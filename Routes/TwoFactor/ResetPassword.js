import express from "express";
import generateOtp from "../../utils/generateOtp.js";
import nodemailer from "nodemailer";
import path from "path";
import hbs from "nodemailer-express-handlebars";
import UserSchema from "../../models/UserSchema.js";
import jwt from "jsonwebtoken";
const Router = express.Router();

/**
 * @dev - This Route sends OTP for Password Reset to the designated email.
 * Uses nodemailer and express handlebars for generating email templates located in views folder.
 */
Router.post("/generate-otp", async (req, res) => {
  const { email } = req.body;
  const { otpToken, otp } = generateOtp(email);
  try {
    const user = await UserSchema.findOne({ email: email });
    if (user) {
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
          subject: "Password Reset Requested!",
          template: "otpEmail",
          context: {
            username: user.username,
            otp: otp,
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
          res.status(200).json({ otpToken });
        })
        .catch(console.error);
    } else {
      return res.status(404).json({ msg: "User Not Found!" });
    }
  } catch (error) {
    return res.status(500);
  }
});

/**
 * @dev - Validates the Otp with the OTP token from client side.
 * Uses jwt to decode the otp Token.
 */
Router.post("/check-otp", async (req, res) => {
  const { otp: userOtp, userId: otpToken } = req.body;
  try {
    const decoded = jwt.decode(otpToken, process.env.SECRET_KEY);
    const { otp } = decoded;
    if (otp === parseInt(userOtp)) {
      return res
        .status(201)
        .json({ authenticated: true, msg: "User verified!" });
    } else {
      return res
        .status(401)
        .json({ authenticated: false, msg: "Incorrect Otp!" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Some Error Occured, Try again later!" });
  }
});

/**
 * @dev - This function validates the token received from client side
 */
Router.get("/validate-token", async (req, res) => {
  // const { userId: otpToken } = req.body;
  const otpToken = req.headers["x-otp-token"];
  try {
    const decoded = jwt.decode(otpToken, process.env.SECRET_KEY);
    const { email } = decoded;
    if (email) {
      const user = await UserSchema.findOne({ email });
      if (user) {
        return res.status(200).json({ msg: "Token Verified" });
      } else {
        return res.status(404);
      }
    } else {
      return res.status(404);
    }
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Some Error Occured, Try again later!" });
  }
});

export default Router;
