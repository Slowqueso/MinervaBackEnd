import express from "express";
const Router = express.Router();
import UserSchema from "../../../models/UserSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import path from "path";
import hbs from "nodemailer-express-handlebars";

Router.put("/update-password", async (req, res) => {
  const { userId: otpToken, password, rePassword } = req.body;
  try {
    let newPassword;
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) return res.status(500);
        newPassword = hash;
        const decoded = jwt.decode(otpToken, process.env.SECRET_KEY);
        const { email } = decoded;
        if (email) {
          const user = await UserSchema.findOne({ email: email });
          const response = await UserSchema.findOneAndUpdate(
            { email },
            { username: "Slow", password: newPassword }
          );
          if (response) {
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
                to: `${email}`,
                subject: "Password Changed!",
                template: "resetPassword",
                context: {
                  username: user.username,
                },
              };
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  return res.status(500);
                }
              });
            }
            main()
              .then((response) => {
                return res.status(201).json({ msg: "Updated Password" });
              })
              .catch(console.error);
          }
        } else {
          return res.status(404).send("Error");
        }
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("error");
  }
});

export default Router;
