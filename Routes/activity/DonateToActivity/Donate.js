import express from "express";
import ActivitySchema from "../../../models/ActivitySchema.js";
import jwt from "jsonwebtoken";
const Router = express.Router();

Router.put("/donate/:activityId", async (req, res) => {
  const { activityId } = req.params;
  const { amountInUSD, userToken: token } = req.body;
  try {
    const activity = await ActivitySchema.findOne({ public_ID: activityId });
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id: userID } = decoded;
    if (!userID) {
      return res.status(401).json({ msg: "Unauthorized Access" });
    }
    if (!activity) {
      return res.status(404).json({ msg: "Activity Not Found" });
    }
    const updateResponse = await ActivitySchema.updateOne(
      { _id: activity._id },
      {
        $push: {
          donations: {
            from: userID,
            amountInUSD,
          },
        },
      }
    );
    return res.status(203).json({ msg: "Donation Added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Some Error Occured" });
  }
});

export default Router;
