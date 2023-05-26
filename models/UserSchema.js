import mongoose from "mongoose";

const UserScehma = mongoose.Schema({
  wallet_ID: {
    _address: String,
    _date: {
      type: Date,
      default: Date.now,
    },
  },
  public_ID: {
    unique: true,
    type: Number,
  },
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
    type: Date,
    default: Date.now,
  },
  activities_participated_in: [
    {
      activityID: String,
      activity_role: Number,
      activity_role_name: String,
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
  student_profile: {
    name_of_institution: String,
    student_email: String,
    degree: String,
    course_name: String,
    course_duration: String,
    field_of_study: String,
    join_date: String,
    grade: String,
  },
  job_profile: {
    company_name: String,
    job_designation: String,
    location: String,
    job_description: String,
    qualifications: String,
  },
  email_auth: {
    type: Boolean,
    default: false,
  },
  rep:{
    type: Number,
  },
  notifications: [
    {
      
      // notification_type: Number,
      notification_title: String,
      notification_description: String,
      notification_date: {
        type: Date,
        default: Date.now,
      },
      notification_read: {
        type: Boolean,
        default: false,
      },
      activityId: Number,
    },
  ],
  
});

export default mongoose.model("WebUser", UserScehma);
