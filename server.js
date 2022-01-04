//Dependencies
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import router from "./Routes/MainRoutes/index.js";

// env config
import dotenv from "dotenv";
dotenv.config();

//Initialising
const port = process.env.PORT;
const app = express();

//Custom Middleware
app.use(router);

//Web Server Connection
app.listen(port, () => console.log(`listening to port: ${port}`));
