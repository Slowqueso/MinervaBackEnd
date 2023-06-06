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
import FetchUserActivity from "./activity/Fetch/FetchUserActivity.js";
import AddProfile from "./user/profile/addProfile.js";
import AddPublicId from "./activity/CreateActivity/AddPublicId.js";
import Donate from "./activity/DonateToActivity/Donate.js";
import DeleteUser from "./user/Delete/DeleteUser.js";
import Views from "./activity/Interactions/Views.js";
import Upvotes from "./activity/Interactions/Upvotes.js";
import JoinResquest from "./activity/Interactions/JoinRequest.js";
import Comments from "./activity/Interactions/Comments.js";
import Donations from "./activity/Interactions/Donations.js";
import GetMembers from "./activity/Fetch/GetMembers.js";
import RegisterWallet from "./user/wallet/UserWalletRegistration.js";

import imageUpload from "./aws/imageUpload.js";
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
router.use("/user", DeleteUser);
router.use("/user", RegisterWallet);

router.use("/activity", CreateDraft);
router.use("/activity", IncrementActivity);

router.use("/activity", AddTerms);
router.use("/activity", AddFields);
router.use("/activity", FetchActivities);
router.use("/activity", JoinActivity);
router.use("/activity", FetchUserActivity);
router.use("/activity", AddPublicId);
router.use("/activity", Donate);
router.use("/activity", Views);
router.use("/activity", Upvotes);
router.use("/activity", JoinResquest);
router.use("/activity", Comments);
router.use("/activity", Donations);
router.use("/activity", GetMembers);

router.use("/aws", imageUpload);

router.use("/two-factor", TwoFactor);
export default router;
