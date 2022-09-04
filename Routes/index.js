import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectToMongoDB from "../configs/mongo_connection.js";
import TestModel from "../models/TestModel.js";
import Register from "./user/register/register.js";
import Information from "./user/register/secondaryProfile.js";
import Authenticate from "./user/authenticate/authenticate.js";
import Login from "./user/authenticate/login.js";

dotenv.config();
const router = express.Router();

// Third Party Middlewares
router.use(express.json());
router.use(cors());

// Custom Middlewares

//DB Config
connectToMongoDB();

//API Endpoints
router.use("/user", Register);
router.use("/user/information", Information);
router.use("/user", Authenticate);
router.use("/user", Login);

export default router;
