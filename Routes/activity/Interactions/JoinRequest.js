import express from "express";
const Router = express.Router();
import UserSchema from "../../../models/UserSchema.js";
import ActivitySchema from "../../../models/ActivitySchema.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import AddToParticipatedActivity from "../../../utils/AddToParticipatedActivity.js";

Router.post("/joinrequest", async (req, res) => {
  const token = req.headers["x-access-token"];
  const activityId = req.body.activityId;
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const user = await UserSchema.findOne(
        { _id: id },
        { profile_pic: 1, first_name: 1, last_name: 1, rep: 1 }
      );
      const memberlimit = await ActivitySchema.findOne(
        { _id: activityId },
        { member_limit: 1, members: 1, isOpen: 1 }
      );
      if (memberlimit.isOpen) {
        if (user && memberlimit.members.length <= memberlimit.member_limit) {
          const join_request = {};
          if (user.profile_pic) {
            join_request.profile_pic = user.profile_pic;
          }

          join_request.user_id = id;
          join_request.name = user.first_name + " " + user.last_name;
          join_request.rep = user.rep;
          const activity = await ActivitySchema.findOneAndUpdate(
            { _id: activityId, "join_requests.user_id": { $ne: id } },
            {
              $addToSet: {
                join_requests: join_request,
              },
            },
            { returnOriginal: false }
          );
          if (activity) {
            AddToParticipatedActivity(activityId, id, 4);
            return res.status(200).json({
              msg: "Activity join request sent",
            });
          } else {
            res
              .status(200)
              .json({
                msg: `Join request already exists for user ${
                  user.first_name + " " + user.last_name
                }`,
              });
          }
        } else {
          res.status(400).json({ msg: `Member limit reached` });
        }
      } else {
        res.status(400).json({ msg: `Activity is closed` });
      }
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("error");
  }
});

Router.post("/joinaccepted", async (req, res) => {
  const token = req.headers["x-access-token"];
  const activityId = req.body.activityId;
  const userId = req.body.userId;
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const user = await UserSchema.findOne({ _id: userId }, { username: 1 });
      const request_removed = await ActivitySchema.findOneAndUpdate(
        { _id: activityId, "join_requests.user_id": userId },
        { $pull: { join_requests: { user_id: userId } } },
        { returnOriginal: false }
      );
      if (request_removed) {
        const accepted = await ActivitySchema.findOneAndUpdate(
          { _id: activityId, "join_accepted.user_id": { $ne: userId } },
          {
            $addToSet: {
              join_accepted: {
                user_id: userId,
              },
            },
          },
          { returnOriginal: false }
        );
        if (user && accepted) {
          // AddToParticipatedActivity(activityId, userId, 2);
          await UserSchema.findOneAndUpdate(
            { _id: userId },
            {
              $addToSet: {
                notifications: {
                  notification_title: `Your request has been accepted`,
                  notification_description: `You have been accepted to join activity ${accepted.activity_title}`,
                  activityId: accepted.public_ID,
                },
              },
            }
          );
          return res.status(200).json({
            msg: "Activity join request accepted",
          });
        } else {
          res.status(400).json({ msg: `User ${userId} not found` });
        }
      } else {
        res
          .status(400)
          .json({ msg: `Join request for user ${userId} not found` });
      }
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("error");
  }
});

Router.post("/joinrejected", async (req, res) => {
  const token = req.headers["x-access-token"];
  const activityId = req.body.activityId;
  const userId = req.body.userId;
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const request_removed = await ActivitySchema.findOneAndUpdate(
        { _id: activityId, "join_requests.user_id": userId },
        { $pull: { join_requests: { user_id: userId } } },
        { returnOriginal: false }
      );
      if (request_removed) {
        await UserSchema.findOneAndUpdate(
          { _id: userId, "activities_participated_in.activityId": activityId },
          {
            $pull: {
              activities_participated_in: {
                activityID: activityId,
              },
            },
          }
        );
        return res.status(200).json({
          msg: "Activity join request rejected",
        });
      } else {
        res
          .status(400)
          .json({ msg: `Join request for user ${userId} not found` });
      }
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("error");
  }
});

Router.post("/displayjoinrequests", async (req, res) => {
  const token = req.headers["x-access-token"];
  const activityId = req.body.activityId;
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const activity = await ActivitySchema.findOne(
        { _id: activityId },
        { join_requests: 1 }
      );
      if (activity) {
        const response = [];
        activity.join_requests.forEach((request) => {
          if (request.profile_pic) {
            response.push({
              user_id: request.user_id,
              name: request.name,
              rep: request.rep,
              profile_pic: `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/profilePic/${request.profile_pic}`,
            });
          } else {
            response.push({
              user_id: request.user_id,
              name: request.name,
              rep: request.rep,
            });
          }
        });

        return res.status(200).json({
          join_requests: response,
        });
      } else {
        res.status(400).json({ msg: `Activity ${activityId} not found` });
      }
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("error");
  }
});

export default Router;
