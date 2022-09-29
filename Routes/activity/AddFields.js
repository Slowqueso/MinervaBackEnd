import express from "express";
const Router = express.Router();
import ActivitySchema from "../../models/ActivitySchema.js";

Router.put("/add-fields", async (req, res) => {
  const { fields, id } = req.body;
  try {
    const activity = await ActivitySchema.updateOne(
      { _id: id },
      {
        $set: {
          overview_contents: fields,
        },
      }
    );
    if (activity.acknowledged) {
      res.status(200).json({ status: "success", msg: "Fields Added!" });
    } else {
      res.status(404).json({ status: "error", msg: "Activity Not Found!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", msg: "Some Error Occured!" });
  }
});

export default Router;
