import mongoose from "mongoose";

const ActivitySchema = mongoose.Schema({
  owner: {
    ID: {
      type: String,
      required: true,
    },
    _address: {
      type: String,
    },
  },
  activity_title: {
    type: String,
    required: true,
    unique: true,
  },
  activity_desc: {
    type: String,
    required: true,
    unique: false,
  },
  category_tags: String,
  activity_logo: {
    data: Buffer,
    contentType: String,
  },
  overview_contents: [
    {
      fieldHeader: String,
      fieldDescription: String,
      imageFile: String,
      index: Number,
    },
  ],
  members: [
    {
      id: {
        type: String,
      },
      address: {
        type: String,
      },
      username: String,
      date_of_join: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  date_created: {
    type: Date,
    default: Date.now,
  },
  join_price: {
    type: Number,
    required: true,
  },
  member_limit: {
    type: Number,
    required: true,
  },
  terms: [
    {
      termTitle: String,
      termDescription: String,
    },
  ],
  isVerified: {
    type: Boolean,
    default: false,
  },
  _status: {
    type: Number,
    default: 0,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  difficulty_level: {
    type: Number,
    required: true,
  },
  duration_period: {
    type: Number,
    required: true,
  },
});

export default mongoose.model("Activities", ActivitySchema);
