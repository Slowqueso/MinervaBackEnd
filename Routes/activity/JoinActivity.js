import express from "express";
const Router = express.Router();
import ActivitySchema from "../../models/ActivitySchema.js";
import UserSchema from "../../models/UserSchema.js";
import jwt from "jsonwebtoken";
import AddToParticipatedActivity from "../../utils/AddToParticipatedActivity.js";

Router.put("/join-activity", async (req, res) => {
  const { activityId, registeredAddress, userId } = req.body;
  console.log(activityId);
  try {
    if (userId) {
      const user = await UserSchema.findOne({ _id: userId });
      /**
       * Add credit score validation and push member into activity
       */
      const activity = await ActivitySchema.findOneAndUpdate(
        { _id: activityId },
        {
          $push: {
            members: {
              id: userId,
              address: registeredAddress,
              username: user.username,
            },
          },
        }
      );
      AddToParticipatedActivity(activityId, userId, 2);
      return res.status(204).json({ msg: "Member Added!" });
    } else {
      return res
        .status(404)
        .json({ status: "error", msg: "User does not exist!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error Occured", status: "error" });
  }
});

export default Router;
