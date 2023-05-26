import express from "express";
const Router = express.Router();
import UserSchema from "../../../models/UserSchema.js";
import ActivitySchema from "../../../models/ActivitySchema.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

Router.post("/comment", async (req, res) => {
    const token = req.headers["x-access-token"];
    const activityId = req.body.activityId;
    const comment = req.body.comment;
    try {
      const decoded = jwt.decode(token, process.env.SECRET_KEY);
      const { id } = decoded;
      if (id) {
        const activity = await ActivitySchema.findOneAndUpdate(
          {
            public_ID: activityId,
            'comments': { $not: { $elemMatch: { user_id: id } } }
          },
          {
            $addToSet: { comments: { user_id: id, comment: comment } }
          },
          { returnOriginal: false }
        );
        if (activity) {
          const newComment = activity.comments[activity.comments.length - 1];
          return res.status(200).json({
            msg: "Activity commented",
            commentId: newComment._id,
            uid: id
          });
        } else {
          res.status(400).json({ msg: `You've already commented for this activity!!` });
        }
      } else {
        res.status(400).json({ msg: "Invalid Token" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Server error" });
    }
  });
  


Router.post('/lastcomments', async (req, res) => {
    const start = new Date(req.body.start)
    const activityId = req.body.activityId;
    
    // Aggregate the views by user ID and count the number of unique time values
    const pipeline = [
        {
            $match: {
                _id: ObjectId(activityId),
            },
        },
        {
            $project: {
                comments: {
                    $filter: {
                        input: '$comments',
                        as: 'comment',
                        cond: { $gte: ['$$comment.time', start] }
                    }
                }
            }
        }
    ]

    // Execute the aggregation pipeline and return the results
    const results = await ActivitySchema.aggregate(pipeline)
    if (results) {
        res.status(200).json(results[0].comments)
    } else {
        res.status(400).json({ msg: "No comments found" })
    }
})


Router.get("/allcomments/:activityId", async (req, res) => {
    const activityId = req.params.activityId;
    try {
      const activity = await ActivitySchema.findOne({ public_ID: activityId })
        .select("comments")
        .exec();
  
      if (activity) {
        return res.status(200).json({ comments: activity.comments });
      } else {
        res.status(400).json({ msg: `Activity does not exist` });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Server error" });
    }
  });
  

export default Router;