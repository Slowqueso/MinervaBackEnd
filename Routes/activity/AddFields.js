import express from "express";
const Router = express.Router();
import ActivitySchema from "../../models/ActivitySchema.js";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
const __dirname = path.resolve(path.dirname(""));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "activity-uploads");
  },
  filename: async (req, file, cb) => {
    cb(
      null,
      uuidv4() +
        file.originalname.split(".")[0] +
        "." +
        file.originalname.split(".").pop()
    );
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

Router.put("/add-fields", async (req, res) => {
  const { header, description, id, index } = req.body;
  try {
    const activity = await ActivitySchema.updateOne(
      { _id: id },
      {
        $push: {
          overview_contents: {
            fieldHeader: header,
            fieldDescription: description,
            imageFile: null,
            index: index,
          },
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

Router.post("/add-fields", upload.single("activityAsset"), async (req, res) => {
  console.log("gay");
  const { header, description, activityId, index } = req.body;
  let path;
  const { filename } = req.file;
  if (req.file) {
    path = req.file.path;
  }
  try {
    const activity = await ActivitySchema.updateOne(
      { _id: activityId },
      {
        $push: {
          overview_contents: {
            fieldHeader: header,
            fieldDescription: description,
            imageFile: "activity-uploads/" + filename,
            index: index,
          },
        },
      }
    );
    if (activity.acknowledged) {
      return res.status(200).json({ status: "success", msg: "Fields Added!" });
    } else {
      return res
        .status(404)
        .json({ status: "error", msg: "Activity Not Found!" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", msg: "Some Error Occured!" });
  }
});

export default Router;
