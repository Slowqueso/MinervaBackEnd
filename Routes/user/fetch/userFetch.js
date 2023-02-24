import express from "express";
const Router = express.Router();
import jwt from "jsonwebtoken";
import UserSchema from "../../../models/UserSchema.js";


Router.get("/info/:tags", async (req, res) => {
  const { tags } = req.params;
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      
      const user = await UserSchema.findOne({ _id: id },{[tags]:1});
      if (user) {
        return res.status(200).json({
          [tags]: user[tags],
        });
      } else {
        return res.status(400).json({
          msg: "User Does not exist",
        });
      }
    } else {
      return res.status(400).json({
        msg: "User Does not exist",
      });
    }
  } catch (err) {
    return res.status(400).json({
      msg: "Token Does not exist",
    });
  }
});    

Router.get("/info", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const user = await UserSchema.findOne({ _id: id });
      if (user) {
        if (user.profile_pic.data && user.profile_pic.contentType) {
          return res.status(200).json({
            authenticated: true,
            user: {
              id: user._id,
              username: user.username,
              email: user.email,
              credit_score: user.credit_score,
              profile_pic: `data:image/${
                user.profile_pic.contentType
              };base64,${user.profile_pic.data.toString("base64")}`,
              address: user.address,
              occupation: user.occupation,
            },
          });
        } else {
          return res.status(200).json({
            authenticated: true,
            user: {
              id: user._id,
              username: user.username,
              email: user.email,
              credit_score: user.credit_score,
              address: user.address,
              occupation: user.occupation,
            },
          });
        }
      } else {
        res.status(400).json({ authenticated: false });
      }
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("error");
  }
});

Router.get("/if_email_auth", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const user = await UserSchema.findOne({ _id: id },{email_auth:1});
      if (user) {
        return res.status(200).json({
          authenticated: true,
          email_auth: user.email_auth,
        });
      } else {
        res.status(400).json({ authenticated: false });
      }
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("error");
  }
});

Router.get("/toggle_email_auth", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const user = await UserSchema.findOne({ _id: id },{email_auth:1});
      UserSchema.findOneAndUpdate({_id : id},{$set:{email_auth : !user.email_auth}}).then((response) => {
        
        res.status(200).json({authenticated:true});
      }).catch((err) => {
        console.log(err);
        res.status(400).json({authenticated:false});
      })
      
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("error");
  }
});

Router.get("/view_profiles", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      UserSchema.findOne({ _id: id },{student_profile:1,job_profile:1}).then((user) => {
        if (user) {
          return res.status(200).json({
            student_profile: user.student_profile,
            job_profile: user.job_profile,
          });
        } else {
          res.status(400).json("error");
        }
      }).catch((err) => {
        console.log(err);
        res.status(400).json("error");
      })

    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("error");
  }
});


export default Router;
