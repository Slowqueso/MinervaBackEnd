import express from "express";
const Router = express.Router();
import ActivitySchema from "../../models/ActivitySchema.js";

Router.put("/increment-status", async (req, res) => {
  const { id } = req.body;
  const activity = await ActivitySchema.findOne({ _id: id });

  if (activity) {
    activity._status = activity._status + 1;
    try {
      const response = await ActivitySchema.updateOne({ _id: id }, activity);
      return res
        .status(204)
        .json({ status: "success", msg: "Activity Updated" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: "error", msg: "Update Failed" });
    }
  } else {
    return res.status(500).json({ status: "error", msg: "Some Error Occured" });
  }
});
export default Router;
