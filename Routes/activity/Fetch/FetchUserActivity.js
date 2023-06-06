import express from "express";
import jwt from "jsonwebtoken";
import ActivitySchema from "../../../models/ActivitySchema.js";
import UserSchema from "../../../models/UserSchema.js";
const Router = express.Router();

Router.get("/get-user-activities", async (req, res) => {
  const userToken = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(userToken, process.env.SECRET_KEY);
    const { id: userId } = decoded;
    const { activities_participated_in } = await UserSchema.findOne({
      _id: userId,
    });

    const ids = activities_participated_in.map(
      (activity) => activity.activityID
    );

    const query = await ActivitySchema.find(
      {
        _id: { $in: ids },
      },
      {
        activity_title: 1,
        _id: 1,
        activity_logo: 1,
        public_ID: 1,
        _status: 1,
      }
    );

    const Activities = query.map((activity, index) => {
      
      return {
        id: activity._id,
        title: activity.activity_title,
        public_ID: activity.public_ID,
        activity_logo: `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/activityLogo/${activity.activity_logo}`,
        // `data:image/${
        //   activity.activity_logo.contentType
        // };base64,${activity.activity_logo.data.toString("base64")}`,
        role: activities_participated_in.find(
          (activities) => activities.activityID === activity._id.toString()
          ).activity_role,
          // role: activities_participated_in[index].activity_role,
        
        status: activity._status,
      };
    });
    return res.json({ activities: Activities }).status(200);
  } catch (error) {
    console.log(error);
    return res
      .json({ msg: "Error 404: Some Problem Occured, Try again later!" })
      .status(404);
  }
});

export default Router;
