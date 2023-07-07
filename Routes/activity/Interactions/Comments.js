import express from "express";
const Router = express.Router();
import UserSchema from "../../../models/UserSchema.js";
import ActivitySchema from "../../../models/ActivitySchema.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { parse } from "path";

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
          const activity = await ActivitySchema.findOne(
            {
              public_ID: activityId,
              'comments': { $elemMatch: { user_id: id } }
            }
          );
          if (activity) {
            const pastComment = activity.comments.find(comment => comment.user_id === id);
            if(pastComment.isDeleted) {
              const pastCommentContent = pastComment.comment;
              const time = pastComment.time;
              const pastCommentObject = { comment: pastCommentContent, time, action: "deleted" };
              pastComment.comment = comment;
              pastComment.time = new Date();
              pastComment.past_comments.push(pastCommentObject);
              pastComment.isDeleted = false;
              await activity.save();
              return res.status(200).json({
                msg: "Activity commented",
                commentId: pastComment._id,
                uid: id
              });
            } else {
              if(pastComment.isRestricted){
                return res.status(400).json({ msg: `You've already commented for this activity!! And your comment has been restricted by the Activity Owner!!` });
              } else {
                return res.status(400).json({ msg: `You've already commented for this activity!!` });
              }
            }
          } else {
            return res.status(400).json({ msg: `You've already commented for this activity!!` });
          }
        }
      } else {
        res.status(400).json({ msg: "Invalid Token" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Server error" });
    }
});

  
Router.post("/editcomment", async (req, res) => {
  const token = req.headers["x-access-token"];
  const activityId = req.body.activityId;
  const commentId = req.body.commentId;
  const comment = req.body.comment;
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const activity = await ActivitySchema.findOne(
        {
          public_ID: activityId,
          'comments': { $elemMatch: { user_id: id } }
        }
      );
      if(activity) {
        const pastComment = await activity.comments.find(comment => comment.user_id === id && comment._id.toString() === commentId);
        if(pastComment) {
          const pastCommentContent = pastComment.comment;
          const time = pastComment.time;
          const pastCommentObject = { comment: pastCommentContent, time, action: "edited" };
          pastComment.comment = comment;
          pastComment.time = new Date();
          pastComment.past_comments.push(pastCommentObject);
          await activity.save();
          return res.status(200).json({
            msg: "Comment updated",
            commentId: pastComment._id,
            uid: id
          });
        } else {
          return res.status(400).json({ msg: `Cannot edit others comment!!` });
        }
      } else {
        return res.status(400).json({ msg: `You've not commented for this activity!!` });
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
});


Router.get("/allcomments/:activityId", async (req, res) => {
  const token = req.headers["x-access-token"];
  const activityId = req.params.activityId;

  const pipeline = [
    {
      $match:
        {
          public_ID: parseInt(activityId),
        },
    },
    {
      $project:
        {
          _id: 1,
          owner: 1,
          comments: {
            $sortArray: {
              input: "$comments",
              sortBy: {
                time: -1,
              },
            },
          },
        },
    },
    {
      $unset:
        "comments.past_comments",
    },
  ]

  try {
    let id = null;
    if (token) {
      const decoded = jwt.decode(token, process.env.SECRET_KEY);
      if (decoded) {
        id = decoded.id || null;
      }
    }

    let activity = await ActivitySchema.aggregate(pipeline);

    if (activity) {
      activity = activity[0];
      if (activity.owner.ID !== id) {
        activity.comments = activity.comments.map((comment) => {
          if (comment.isRestricted) {
            comment.comment = "This comment has been restricted by the Activity Owner";
          }
          return comment;
        });
        
        activity.comments = activity.comments.filter(
          (comment) => !comment.isDeleted
        );
      } else {
        activity.comments = activity.comments.filter(
          (comment) => !comment.isDeleted
        );
      }
      return res.status(200).json({ comments: activity.comments });
    } else {
      return res.status(400).json({ msg: "Activity does not exist" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
});

Router.post("/deletecomment", async (req, res) => {
    const token = req.headers["x-access-token"];
    const activityId = req.body.activityId;
    const commentId = req.body.commentId;
    try {
      const decoded = jwt.decode(token, process.env.SECRET_KEY);
      const { id } = decoded;
      if (id) {
        const activity = await ActivitySchema.findOne(
          {public_ID: activityId, 'comments': { $elemMatch: { _id: commentId, user_id: id } } }
        )
        if (activity) {
          const comment = activity.comments.find(comment => comment._id.toString() === commentId);
          comment.isDeleted = true;
          await activity.save();
          return res.status(200).json({
            msg: "Comment Deleted"
          });
        } else {
          res.status(400).json({ msg: "Cannot delete others comment!!" });
        }
      } else {
        res.status(400).json({ msg: "Invalid Token" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Server error" });
    }
});

Router.post("/restrictcomment", async (req, res) => {
  const token = req.headers["x-access-token"];
  const activityId = req.body.activityId;
  const commentId = req.body.commentId;
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const activity = await ActivitySchema.findOne(
        {public_ID: activityId, 'comments': { $elemMatch: { _id: commentId } } }
      )
      if (activity.owner.ID === id) {
        const comment = activity.comments.find(comment => comment._id.toString() === commentId);
        comment.isRestricted = true;
        await activity.save();
        return res.status(200).json({
          msg: "Comment Restricted"
        });
      } else {
        res.status(400).json({ msg: "Only activity owner can restrict comments!!" });
      }
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
});

Router.post("/unrestrictcomment", async (req, res) => {
  const token = req.headers["x-access-token"];
  const activityId = req.body.activityId;
  const commentId = req.body.commentId;
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const activity = await ActivitySchema.findOne(
        {public_ID: activityId, 'comments': { $elemMatch: { _id: commentId } } }
      )
      if (activity.owner.ID === id) {
        const comment = activity.comments.find(comment => comment._id.toString() === commentId);
        comment.isRestricted = false;
        await activity.save();
        return res.status(200).json({
          msg: "Comment Unrestricted"
        });
      } else {
        res.status(400).json({ msg: "Only activity owner can unrestrict comments!!" });
      }
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
});
  

export default Router;