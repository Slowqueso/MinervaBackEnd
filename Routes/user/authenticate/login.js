import express from "express";
const Router = express.Router();
import UserSchema from "../../../models/UserSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: "30d",
  });
  return token;
};

Router.put("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserSchema.findOne({ email });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const token = generateToken(user._id);
        return res.json({
          status: "ok",
          user: token,
          email_auth: user.email_auth,
        });
      } else {
        return res
          .status(400)
          .json({ status: "error", user: false, msg: "Incorrect Password" });
      }
    } else {
      return res
        .status(400)
        .json({ status: "error", msg: "User Does not exist with this email" });
    }
  } catch (err) {}
});

Router.get("/token", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    const user = await UserSchema.findOne({ _id: id });
    if (user) {
      res.status(200).json({ msg: "User Accepted", authenticated: true });
    } else {
      res
        .status(400)
        .json({ msg: "User Does not exist   ", authenticated: false });
    }
  } catch (err) {
    res.status(400).json({ msg: "Token Does not exist", authenticated: false });
  }
});

Router.get("/walletLogin", async (req, res) => {
  const walletAddress = req.headers["x-wallet-address"];

  try {
    const user = await UserSchema.findOne({ wallet_ID: walletAddress });

    if (user) {
      const token = generateToken(user._id);
      return res.json({ status: "ok", user: token });
    } else {
      return res
        .status(400)
        .json({ status: "error", msg: "User Does not exist with this wallet" });
    }
  } catch (err) {
    console.log(err);
  }
});
export default Router;
