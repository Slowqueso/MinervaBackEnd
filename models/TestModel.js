import mongoose from "mongoose";

const testData = mongoose.Schema({
  testField: String,
});

export default mongoose.model("Test", testData);
