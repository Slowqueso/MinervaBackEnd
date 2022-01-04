import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectToMongoDB from "./db_connection.js";
import TestModel from "../../Models/TestModel.js";

// Initializing
dotenv.config();
const router = express.Router();
const port = process.env.PORT;

// Third Party Middlewares
router.use(express.json());
router.use(cors());

// Custom Middlewares

//DB Config
const conn = mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//API Endpoints

router.post("/", async (req, res) => {
  const { testValue } = req.body;
  const data = new TestModel({
    testField: testValue,
  });
  console.log(testValue);
  TestModel.create({ testField: testValue }, async (err, data2) => {
    if (err) throw err;
    res.status(200).json(data2);
  });
});

router.get("/", (req, res) => {
  TestModel.find()
    .then((test) => {
      res.status(200).json(test);
    })
    .catch((err) => {
      res.status(404).json({ msg: "Data Not Found!" });
    });
});

export default router;
