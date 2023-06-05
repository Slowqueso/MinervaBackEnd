import express from "express";
const Router = express.Router();
import dotenv from "dotenv";
import aws from "aws-sdk";
import crypto from "crypto";
import { promisify } from "util";

const region = process.env.REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_AC;
const bucketName = process.env.BUCKET_NAME;

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});




Router.get("/image-upload/:folderName", async (req, res) => {
  const randomBytes = promisify(crypto.randomBytes);
const rawBytes = await randomBytes(16);
// const folderName = "activityLogo/"
const imagename = rawBytes.toString("hex");
  const folderName = req.params.folderName;
  const params = {
    Bucket: bucketName,
    Key: `${folderName}/${imagename}`,
    Expires: 60,
  };
  

  try {
    const URL = await s3.getSignedUrlPromise("putObject", params);
    res.status(200).json({URL, imagename});
  } catch (err) {
    res.status(400).json({ err });
    console.log(err);
    
  }
});

export default Router;