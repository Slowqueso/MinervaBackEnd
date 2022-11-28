import express from "express";
const Router = express.Router();
import jwt from "jsonwebtoken";
import UserSchema from "../../../models/UserSchema.js";

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
export default Router;
