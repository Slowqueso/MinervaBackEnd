import express from "express";
const Router = express.Router();
import UserSchema from "../../../models/UserSchema.js";
import jwt from "jsonwebtoken";

Router.get("/authenticate", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const user = await UserSchema.findOne({ _id: id });
      if (user) {
        res.status(200).json({ authenticated: true });
      } else {
        res.status(400).json({ authenticated: false });
      }
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {}
});

export default Router;
