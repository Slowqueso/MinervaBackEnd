import express from "express";
const Router = express.Router();
import jwt from "jsonwebtoken";
import UserSchema from "../../../models/UserSchema.js";
import multer from "multer";
import fs from "fs";
import path from "path";
const __dirname = path.resolve(path.dirname(""));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "pfp-uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      // Date.now().toString() +
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

Router.put("/register", upload.single("profileImage"), async (req, res) => {
  const token = req.headers["x-access-token"];
  const { houseAddress, district, state, country, postalCode, occupation } =
    req.body;
  const { filename } = req.file;
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const { id } = decoded;
    const user = await UserSchema.updateOne(
      { _id: id },
      {
        $set: {
          address: {
            country,
            state,
            city_district: district,
            postal_code: postalCode,
            house_address: houseAddress,
          },
          occupation,
          profile_pic: {
            data: fs.readFileSync(__dirname + "/pfp-uploads/" + filename),
            contentType: req.file.mimetype,
          },
        },
      }
    );
    res.status(204).json({ msg: "User Information Added!" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "Some Error Occured" });
  }
});

Router.post("/register", async (req, res) => {
  const token = req.headers["x-access-token"];
  const { houseAddress, district, state, country, postalCode, occupation } =
    req.body;
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    const user = await UserSchema.updateOne(
      { _id: id },
      {
        $set: {
          address: {
            country,
            state,
            city_district: district,
            postal_code: postalCode,
            house_address: houseAddress,
          },
          occupation,
        },
      }
    );
    res.status(201).json({ msg: "User Information Added!" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "Some Error Occured" });
  }
});

Router.get("/register", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const user = await UserSchema.findOne({ _id: id });
      if (user) {
        if (user.email && user.occupation && user.occupation > 0) {
          res.status(200).json({
            completed: true,
            user: {
              email: user.email,
              username: user.username,
            },
          });
        } else {
          res.status(200).json({
            completed: false,
            user: {
              email: user.email,
              username: user.username,
            },
          });
        }
      } else {
        res.status(400).json({ msg: "Invalid user" });
      }
    } else {
      res.status(400);
    }
  } catch (err) {}
});

export default Router;
