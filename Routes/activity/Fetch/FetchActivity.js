import express from "express";
const Router = express.Router();
import UserSchema from "../../../models/UserSchema.js";
import ActivitySchema from "../../../models/ActivitySchema.js";

Router.get("/get-all", async (req, res) => {
  const query = await ActivitySchema.find({ _status: { $gt: 2 } }).sort({
    date_created: "descending",
  });
  const activities = [];
  query.forEach((activity) => {
    activities.push({
      id: activity._id,
      title: activity.activity_title,
      desc: activity.activity_desc,
      tags: activity.category_tags,
      logo: `data:image/${
        activity.activity_logo.contentType
      };base64,${activity.activity_logo.data.toString("base64")}`,
      members: activity.members,
      isVerified: activity.isVerified,
      upVotes: activity.upvotes,
      date_created: activity.date_created,
      terms: activity.terms,
      fields: activity.overview_contents,
      duration_period: activity.duration_period,
      _status: activity._status,
      difficulty_level: activity.difficulty_level,
      owner: activity.owner.ID,
      join_price: activity.join_price,
      public_ID: activity.public_ID,
    });
  });
  res.status(200).json({ activities });
});

Router.get("/get-one", async (req, res) => {
  const activityId = req.headers["x-activity-id"];
  try {
    const activity = await ActivitySchema.findOne({ public_ID: activityId });
    if (activity) {
      const owner = await UserSchema.findOne({ _id: activity.owner.ID });
      return res.status(200).json({
        activity: {
          id: activity._id,
          public_ID: activity.public_ID,
          title: activity.activity_title,
          desc: activity.activity_desc,
          tags: activity.category_tags,
          member_limit: activity.member_limit,
          logo: `data:image/${
            activity.activity_logo.contentType
          };base64,${activity.activity_logo.data.toString("base64")}`,
          members: activity.members,
          isVerified: activity.isVerified,
          upVotes: activity.upvotes,
          date_created: activity.date_created,
          terms: activity.terms,
          fields: activity.overview_contents.sort(
            (a, b) => parseInt(a.index) - parseInt(b.index)
          ),
          duration_period: activity.duration_period,
          _status: activity._status,
          difficulty_level: activity.difficulty_level,
          owner: {
            id: activity.owner.ID,
            username: owner.username,
            profile_pic:
              owner.profile_pic.contentType && owner.profile_pic.data
                ? `data:image/${
                    owner.profile_pic.contentType
                  };base64,${owner.profile_pic.data.toString("base64")}`
                : null,
          },
          join_price: activity.join_price,
        },
      });
    } else {
      return res
        .status(404)
        .json({ status: "error", msg: "Activity Not Found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: "error", msg: "Error Occured" });
  }
});

Router.get("/get-public-id/:activityId", async (req, res) => {
  const activityId = req.params.activityId;
  try {
    const activity = await ActivitySchema.findOne({ _id: activityId });
    if (activity) {
      return res.status(200).json({ public_ID: activity.public_ID });
    } else {
      return res
        .status(404)
        .json({ status: "error", msg: "Activity Not Found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", msg: "Error Occured" });
  }
});

export default Router;
