import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectToMongoDB from "../configs/mongo_connection.js";
import Register from "./user/register/register.js";
import Information from "./user/register/secondaryProfile.js";
import Authenticate from "./user/authenticate/authenticate.js";
import Login from "./user/authenticate/login.js";
import FetchUser from "./user/fetch/userFetch.js";
import CreateDraft from "./activity/CreateActivity/CreateDraft.js";
import IncrementActivity from "./activity/incrementStatus.js";

import AddTerms from "./activity/AddTerms.js";
import AddFields from "./activity/AddFields.js";
import FetchActivities from "./activity/Fetch/FetchActivity.js";
import JoinActivity from "./activity/JoinActivity.js";
import TwoFactor from "./TwoFactor/ResetPassword.js";
import ResetPassword from "./user/PasswordReset/PasswordReset.js";
import AddProfile from "./user/profile/addProfile.js";

dotenv.config();
const router = express.Router();

// Third Party Middlewares
router.use(express.json());
router.use(cors());
router.use("/activity-uploads", express.static("activity-uploads"));

// Custom Middlewares

//DB Config
connectToMongoDB();

//API Endpoints
router.use("/user", Register);
router.use("/user/information", Information);
router.use("/user", Authenticate);
router.use("/user", Login);
router.use("/user", FetchUser);
router.use("/user", ResetPassword);
router.use("/user", AddProfile);

router.use("/activity", CreateDraft);
router.use("/activity", IncrementActivity);

router.use("/activity", AddTerms);
router.use("/activity", AddFields);
router.use("/activity", FetchActivities);
router.use("/activity", JoinActivity);

router.use("/two-factor", TwoFactor);
export default router;
