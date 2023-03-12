import express from "express";
const Router = express.Router();
import ActivitySchema from "../../../models/ActivitySchema.js";

Router.put("/add-activity-public-id/:activityId", async (req, res) => {
  const activityId = req.params.activityId;
  const { publicId } = req.body;
  try {
    const activity = await ActivitySchema.findOneAndUpdate(
      { _id: activityId },
      { $set: { public_ID: publicId } }
    );
    if (activity) {
      return res.status(200).json({ message: "Public ID added successfully" });
    } else {
      // console.log(activityId);
      return res.status(404).json({ message: "Activity not found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default Router;
