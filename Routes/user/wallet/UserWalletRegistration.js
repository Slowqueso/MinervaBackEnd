import express from "express";
const Router = express.Router();
import jwt from "jsonwebtoken";
import UserSchema from "../../../models/UserSchema.js";

Router.put("/registerWallet", async (req, res) => {
  const { token, walletAddress } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await UserSchema.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }
    user.wallet_ID = walletAddress;
    await user.save();
    return res.status(200).json({ msg: "Wallet Address Added" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server Error" });
  }
});

export default Router;
