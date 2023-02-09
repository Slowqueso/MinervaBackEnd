import express from "express";
const Router = express.Router();
import jwt from "jsonwebtoken";
import UserSchema from "../../../models/UserSchema.js";
import ActivitySchema from "../../../models/ActivitySchema.js";
import multer from "multer";
import fs from "fs";
import status from "../../../utils/status.js";
import path from "path";
const __dirname = path.resolve(path.dirname(""));
import isLevelValid from "../../../utils/LevelValidator.js";
import isPriceValid from "../../../utils/PriceValidator.js";
import nodemailer from "nodemailer";
import getOrderedDate from "../../../utils/dateParser.js";
import hbs from "nodemailer-express-handlebars";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "activity-uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.originalname.split(".")[0] + "." + file.originalname.split(".").pop()
    );
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

Router.get("/drafts/get-activity/:activityId", async (req, res) => {
  const id = req.params.activityId;
  const token = req.headers["x-access-token"];
  try {
    const activity = await ActivitySchema.findOne({ _id: id });
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id: userID } = decoded;
    if (activity && activity._status < 4) {
      // console.log(activity.owner.ID);
      if (activity.owner.ID === userID) {
        return res.status(200).json({
          status: "success",
          activity: {
            id: activity._id,
            title: activity.activity_title,
            description: activity.activity_desc,
            categories: activity.category_tags,
            member_limit: activity.member_limit,
            _status: activity._status,
            difficulty_level: activity.difficulty_level,
            join_price: activity.join_price,
            durationPeriod: activity.duration_period,
            date_created: activity.date_created,
            logo: `data:image/${
              activity.activity_logo.contentType
            };base64,${activity.activity_logo.data.toString("base64")}`,
          },
        });
      } else {
        return res
          .status(500)
          .json({ status: "error", msg: "You don't own this activity" });
      }
    } else {
      return res.status(404).json({
        status: "error",
        msg: "Incorrect ID! Please ensure your Activity is still in drafting stage!",
      });
    }
  } catch (error) {
    if (error) {
      return res
        .status(404)
        .json({ status: "error", msg: "Error 404: Not Found!" });
    }
  }
  return res.status(500).json({ status: "error", msg: "Server Error" });
});

Router.post(
  "/create-activity/create-draft",
  upload.single("activityLogo"),
  async (req, res) => {
    const token = req.headers["x-access-token"];
    const {
      title,
      description,
      selectedLevel,
      memberLimit,
      durationPeriod,
      joinPrice,
      categories,
      address,
    } = req.body;
    const { filename } = req.file;
    try {
      const decoded = jwt.decode(token, process.env.SECRET_KEY);
      const { id } = decoded;
      if (id) {
        const user = await UserSchema.findOne({ _id: id });
        if (user && isLevelValid(parseInt(selectedLevel), user.credit_score)) {
          if (!isPriceValid(parseInt(selectedLevel), parseInt(joinPrice))) {
            return res.status(500).json({
              msg: "ETH Limit Exceeded for the level!",
              status: "error",
            });
          }
          ActivitySchema.create(
            {
              owner: {
                ID: user._id,
              },
              activity_title: title,
              activity_desc: description,
              category_tags: categories,
              activity_logo: {
                data: fs.readFileSync(
                  __dirname + "/activity-uploads/" + filename
                ),
                contentType: req.file.mimetype,
              },
              member_limit: memberLimit,
              _status: 1,
              difficulty_level: selectedLevel,
              duration_period: durationPeriod,
              join_price: joinPrice,
              members: [
                {
                  id: user._id,
                  address: address,
                  username: user.username,
                },
              ],
            },
            async (err, activity) => {
              
              
              if (err) {
                if(err.code === 11000){
                  return res.status(500).json({
                    status: "error",
                    msg: "Activity with same title already exists!",
                  });
                }
                else{console.log(err);
                return res.status(500).json({
                  status: "error",
                  msg: "Some Error Occured, Please try again later!",
                });}
              }
              
              if (activity) {
                fs.unlinkSync(__dirname + "/activity-uploads/" + filename);
                async function main() {
                  let transporter = nodemailer.createTransport({
                    service: "Gmail",
                    secure: false,
                    auth: {
                      user: process.env.EMAIL,
                      pass: process.env.PASSWORD_MAIL,
                    },
                  });
                  const handlebarOptions = {
                    viewEngine: {
                      partialsDir: path.resolve("./views/"),
                      defaultLayout: false,
                    },
                    viewPath: path.resolve("./views/"),
                  };
                  transporter.use("compile", hbs(handlebarOptions));
                  const mailOptions = {
                    from: `"Minerva" <${process.env.EMAIL}>`, // sender address
                    to: `${user.email}`,
                    subject: "New Activity Draft has been created :D",
                    template: "ActivityDraft",
                    context: {
                      date_created: getOrderedDate(activity.date_created),
                      activity_title: activity.activity_title,
                      activity_desc: activity.activity_desc,
                      activity_logo: `data:image/${
                        activity.activity_logo.contentType
                      };base64,${activity.activity_logo.data.toString(
                        "base64"
                      )}`,
                      member_limit: activity.member_limit,
                      joining_price: activity.join_price,
                      difficulty_level: activity.difficulty_level,
                      duration_period: activity.duration_period,
                      email: user.email,
                    },
                  };
                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      return res.status(500);
                    }
                  });
                }
                await main();
                return res
                  .status(201)
                  .json({ draftSaved: true, _id: activity._id });
              } else {
                return res.status(400).json({
                  status: "error",
                  msg: "Something Went Wrong, Please try again later",
                });
              }
            }
          );
        } else {
          return res
            .status(400)
            .json({ status: "error", msg: "Not Enough Credit Score" });
        }
      } else {
        return res.status(400).json({ status: "error", msg: "Invalid Token" });
      }
    } catch (err) {
      console.log(err);
    }
  }
);

Router.put("/upd-owner-address", async (req, res) => {
  const { activityId, account } = req.body;
  try {
    console.log(activityId);
    const activity = await ActivitySchema.updateOne(
      { _id: activityId },
      {
        $set: {
          "owner._address": account,
        },
      }
    );
    if (activity) {
      return res.status(204);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: "error", msg: "Error OCcured" });
  }
});

Router.post(
  "/upd-activity/:activityId",
  upload.single("activityLogo"),
  async (req, res) => {
    const activityId = req.params.activityId;
    const token = req.headers["x-access-token"];
    const objForUpdate = {};
    if(req.body.title){ objForUpdate.activity_title = req.body.title; }
    if(req.body.description){ objForUpdate.activity_desc = req.body.description; }
    if(req.body.selectedLevel){ objForUpdate.difficulty_level = req.body.selectedLevel; }
    if(req.body.memberLimit){ objForUpdate.member_limit = req.body.memberLimit; }
    if(req.body.durationPeriod){ objForUpdate.duration_period = req.body.durationPeriod; }
    if(req.body.joinPrice){ objForUpdate.join_price = req.body.joinPrice; }
    if(req.body.categories){ objForUpdate.category_tags = req.body.categories; }
    if(req.file){
      objForUpdate.activity_logo = {
            data: fs.readFileSync(
              __dirname + "/activity-uploads/" + req.file.filename
            ),
            contentType: req.file.mimetype,
          }
    }

    
    try {
      const activity = await ActivitySchema.findOne({ _id: activityId });
      const decoded = jwt.decode(token, process.env.SECRET_KEY);
      const { id } = decoded;
      
      if (activity && id) {
        const user = await UserSchema.findOne({ _id: id });

        if (user && isLevelValid(parseInt(objForUpdate.difficulty_level), user.credit_score)){
          if (!isPriceValid(parseInt(objForUpdate.difficulty_level), parseInt(objForUpdate.join_price))) {
          return res.status(500).json({
            msg: "ETH Limit Exceeded for the level!",
            status: "error",
          });
        }
        ActivitySchema.updateOne(
          { _id: activityId },
          {
            $set: objForUpdate,
            
          },
          function(err, result) {
            if(err){
              if(err.code === 11000){
              return res.status(500).json({
                status: "error",
                msg: "Activity with same title already exists!",
                });
              }else{
                return res
              .status(500)
              .json({ status: "error", msg: "Error Occured" });
              }
            }
            else{
              if(req.file){
                fs.unlinkSync(__dirname + "/activity-uploads/" + req.file.filename);
              }
              return res.status(201).json({ draftSaved: true, _id: activityId });
            }
          }
        )
       
      }
      else {
        return res
          .status(400)
          .json({ status: "error", msg: "Not Enough Credit Score" });
      }

      }
    } catch (error) {
      console.log(error)
      // return res.status(500).json({ status: "error", msg: "Error OCcured" });
    }
  }
);

export default Router;
