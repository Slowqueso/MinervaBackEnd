import mongoose from "mongoose";

const ActivitySchema = mongoose.Schema({
  public_ID: {
    type: Number,
    unique: true,
  },
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
    type: String,
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
  upvotes: [
    {
      _id: false,
      user_id: {
        type: String,
      },
      time: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  difficulty_level: {
    type: Number,
    required: true,
  },
  duration_period: {
    type: Number,
    required: true,
  },
  donations: [
    {
      from: {
        type: String,
      },
      amountInUSD: {
        type: Number,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  views: [
    {
      _id: false,
      user_id: {
        type: String,
      },
      time: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  comments: [
    {
      user_id: {
        type: String,
      },
      username: {
        type: String,
      },
      comment: {
        type: String,
      },
      time: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  join_requests: [
    {
      _id: false,
      user_id: {
        type: String,
      },
      name: {
        type: String,
      },
      rep: {
        type: Number,
      },
      profile_pic: {
        type: String,
      },
    },
  ],
  join_accepted: [
    {
      _id: false,
      user_id: {
        type: String,
      },
      time: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  isOpen: {
    type: Boolean,
    default: true,
  },
  connections: [
    {
      _id: false,
      link:String,
      app_name:String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export default mongoose.model("Activities", ActivitySchema);
