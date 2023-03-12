import express from "express";
const Router = express.Router();
import UserSchema from "../../../models/UserSchema.js";

Router.delete("/delete/:uid", async (req, res) => {
  UserSchema.deleteOne({ _id: req.params.uid }, (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Some Error Occured" });
    }
    if (result) {
      return res.status(200).json({ msg: "User Deleted" });
    }
  });
});

export default Router;
