import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const generateOtp = (email) => {
  const otp = Math.floor(Math.random() * 899999 + 100000);
  const otpToken = jwt.sign({ email, otp }, process.env.SECRET_KEY, {
    expiresIn: "5m",
  });
  return { otpToken, otp };
};

export default generateOtp;
