//Dependencies
import express from "express";
import router from "./Routes/index.js";
// import listenToEvent from "./Web3Listeners/RegisterUser.js";

// env config
import dotenv from "dotenv";
dotenv.config();

//Initialising
const port = process.env.PORT;
const app = express();

//Custom Middleware
app.use(router);
app.use(express.json());

//Web Server Connection

app.listen(port, () => {
  console.log(`listening to port: ${port}`);
  // listenToEvent();
});
