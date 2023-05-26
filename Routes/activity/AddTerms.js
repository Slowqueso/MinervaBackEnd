import express from "express";
const Router = express.Router();
import ActivitySchema from "../../models/ActivitySchema.js";

Router.put("/add-terms", async (req, res) => {
  const { terms, id } = req.body;
  try {
    const activity = await ActivitySchema.updateOne(
      { _id: id },
      {
        $set: {
          terms: terms,
        },
      }
    );
    if (activity.acknowledged) {
      res.status(200).json({ status: "success", msg: "Terms Added!" });
    } else {
      res.status(404).json({ status: "error", msg: "Activity Not Found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", msg: "Some Error Occured" });
  }
});

export default Router;
