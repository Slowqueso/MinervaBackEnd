import express from "express";
const Router = express.Router();
import UserSchema from "../../../models/UserSchema.js";
import ActivitySchema from "../../../models/ActivitySchema.js";
import jwt from "jsonwebtoken";

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
      logo: `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/activityLogo/${activity.activity_logo}`,
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
      if (activity.overview_contents) {
        activity.overview_contents.map((field) => {
          if (field.imageFile) {
            field.imageFile = `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/activityOverview/${field.imageFile}`;
          }
        });
      }
      const owner = await UserSchema.findOne({ _id: activity.owner.ID });
      return res.status(200).json({
        activity: {
          id: activity._id,
          public_ID: activity.public_ID,
          title: activity.activity_title,
          desc: activity.activity_desc,
          tags: activity.category_tags,
          member_limit: activity.member_limit,
          logo: `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/activityLogo/${activity.activity_logo}`,
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
            profile_pic: owner.profile_pic
              ? `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/profilePic/${owner.profile_pic}`
              : null,
          },
          join_price: activity.join_price,
          join_requests: activity.join_requests,
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

Router.get("/toggle-status", async (req, res) => {
  const activityId = req.headers["x-activity-id"];
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;

    if (id) {
      const owner = await ActivitySchema.findOne(
        { _id: activityId },
        { owner: 1 }
      );
      if (owner.owner.ID === id) {
        const status = await ActivitySchema.findOne(
          { _id: activityId },
          { isOpen: 1, _id: 0 }
        );
        ActivitySchema.findOneAndUpdate(
          { _id: activityId },
          { $set: { isOpen: !status.isOpen } }
        )
          .then(() => {
            return res
              .status(200)
              .json({ status: "success", msg: "Status Updated" });
          })
          .catch((err) => {
            console.log(err);
            return res
              .status(500)
              .json({ status: "error", msg: "Error Occured" });
          });
      } else {
        return res.status(403).json({ status: "error", msg: "Unauthorized" });
      }
    } else {
      return res.status(403).json({ status: "error", msg: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: "error", msg: "Error Occured" });
  }
});

Router.get("/info/:tags", async (req, res) => {
  const { tags } = req.params;
  const id = req.headers["x-activity-id"];
  try {
    if (id) {
      const user = await ActivitySchema.findOne({ _id: id }, { [tags]: 1 });
      if (user) {
        return res.status(200).json({
          [tags]: user[tags],
        });
      } else {
        return res.status(400).json({
          msg: "User Does not exist",
        });
      }
    } else {
      return res.status(400).json({
        msg: "User Does not exist",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      msg: "Token Does not exist",
    });
  }
});

Router.post("/add-connections", async (req, res) => {
  const { link, app_name } = req.body;
  const id = req.headers["x-activity-id"];
  try {
    if (id) {
      const response = await ActivitySchema.findOneAndUpdate(
        { public_ID: id },
        {
          $push: {
            connections: {
              link: link,
              app_name: app_name,
            },
          },
        }
      );
      if (response) {
        return res.status(200).json({
          msg: "Connections Added",
        });
      } else {
        return res.status(400).json({
          msg: "Error Occured",
        });
      }
    } else {
      return res.status(400).json({
        msg: "Activity does not exist",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      msg: "Something went wrong",
    });
  }
});

Router.get("/get-connections/:puid", async (req, res) => {
  const { puid } = req.params;
  try {
    if (puid) {
      const response = await ActivitySchema.findOne(
        { public_ID: puid },
        { _id: 0, connections: 1 }
      );

      if (response) {
        return res.status(200).json({
          connections: response.connections,
        });
      } else {
        return res.status(400).json({
          msg: "Error Occured",
        });
      }
    } else {
      return res.status(400).json({
        msg: "Activity does not exist",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      msg: "Something went wrong",
    });
  }
});

export default Router;
