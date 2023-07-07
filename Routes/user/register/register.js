import express from "express";
const Router = express.Router();
import jwt from "jsonwebtoken";
import UserSchema from "../../../models/UserSchema.js";
import { isEmailCorrect, isContactCorrect } from "../../../utils/validation.js";
import bcrypt from "bcryptjs";
import { web3, accounts, contract } from "../../../configs/web3_connection.js";

const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: "30d",
  });
  return token;
};

Router.post("/register", async (req, res) => {
  // await Moralis.start({
  //   apiKey: process.env.MORALIS_API_KEY,
  // });
  const { email, password, username, fname, lname, contact } = req.body;
  if (
    !email ||
    email === "" ||
    password === "" ||
    !password ||
    !username ||
    !fname ||
    !lname
  ) {
    return res.status(400).json({ msg: "All fields are not entered" });
  } else {
    if (isEmailCorrect(email) && isContactCorrect(contact)) {
      return res
        .status(400)
        .json({ msg: "Make sure Email and Contact are right!" });
    } else {
      const senderAddress = accounts[0];

      const userExist1 = await UserSchema.findOne({ email });
      const userExist2 = await UserSchema.findOne({ contact_number: contact });

      if (userExist1 || userExist2) {
        return res.status(400).json({ msg: "User Already Exists" });
      }
      // const public_ID = await contract.methods
      //   .getUserCount()
      //   .call({ from: senderAddress });
      const public_ID = await UserSchema.count()+1;
      let newPassword;
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
          newPassword = hash;
          UserSchema.create(
            {
              email,
              password: newPassword,
              contact_number: contact,
              username,
              first_name: fname,
              last_name: lname,
              public_ID: parseInt(public_ID),
            },
            async (err, user) => {
              if (err) {
                console.log(err);
                return res
                  .status(500)
                  .json({ msg: "Some Error Occured, Please Try again later!" });
              }
              if (user) {
                const token = generateToken(user._id);
                return res.status(201).json({ token: token, uid: user._id });
              } else {
                res.status(400).json({
                  msg: "Something Went Wrong, Please try again later",
                });
              }
            }
          );
        });
      });
    }
  }
});

export default Router;
