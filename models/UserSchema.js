import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserScehma = mongoose.Schema({
  wallet_ID: [
    {
      _address: String,
      _date: {
        type: String,
        default: Date.now,
      },
    },
  ],
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contact_number: {
    type: String,
    unique: true,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  first_name: String,
  last_name: String,
  username: {
    type: String,
    required: true,
    unique: false,
  },
  address: {
    country: String,
    state: String,
    city_district: String,
    postal_code: Number,
    house_address: String,
  },
  profile_pic: {
    data: Buffer,
    contentType: String,
  },
  linkedProfiles: [
    {
      _application: Number,
      _profile_url: String,
    },
  ],
  activities_owner: [
    {
      activityID: Number,
    },
  ],
  login_device: [],
  previous_login_date: {
    type: String,
    default: Date.now,
  },
  activities_participated_in: [
    {
      activityID: Number,
    },
  ],
  recent_searches: [],
  credit_score: {
    type: Number,
    default: 100,
  },
  age: {
    type: Number,
  },
  date_of_birth: {
    day: Number,
    month: String,
    year: Number,
  },
  flagged_activities: [],
  occupation: {
    type: Number,
    default: 0,
  },
});

// UserScehma.methods.matchPassword = async (enteredPassword) => {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// UserScehma.pre("save", async (next) => {
//   if (!this.isModified("password")) {
//     next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

export default mongoose.model("WebUser", UserScehma);
