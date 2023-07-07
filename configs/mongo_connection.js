import mongoose from "mongoose";
import dotenv from "dotenv";

// Initializing
dotenv.config();
const PROD = process.env.PRODUCTION;
//DB Config
const connectToMongoDB = () => {
  try {
    if (PROD !== "false") {
      mongoose.connect(process.env.CLOUD_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to Cloud DB");
    } else {
      mongoose.connect(process.env.LOCAL_DB_URI);
      console.log("Connected to Local DB");
    }
  } catch (err) {
    console.log(err);
  }
};

export default connectToMongoDB;
