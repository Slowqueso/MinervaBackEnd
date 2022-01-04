import mongoose from "mongoose";
import dotenv from "dotenv";

// Initializing
dotenv.config();

//DB Config
const connectToMongoDB = () => {
  try {
    const conn = mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.log(err);
  }
};

export default connectToMongoDB;
