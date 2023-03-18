import express from "express";
const Router = express.Router();
import UserSchema from "../../../models/UserSchema.js";
import ActivitySchema from "../../../models/ActivitySchema.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

Router.post("/upvoted", async (req, res) => {
    const token = req.headers["x-access-token"];
    const activityId = req.body.activityId;
    try {
        const decoded = jwt.decode(token, process.env.SECRET_KEY);
        const { id } = decoded;
        if (id) {
            const activity = (await ActivitySchema.findOneAndUpdate(
                { _id: activityId, 'upvotes.user_id': { $ne: id } },
                { $addToSet: { upvotes: { user_id: id } } },
                { returnOriginal: false }
                ));
            if (activity) {
                return res.status(200).json({
                    msg: "Activity upvoted",
                });
            } else {
                res.status(400).json({ msg: `Upvote already exists for user ${id}` });
            }
        } else {
            res.status(400).json({ msg: "Invalid Token" });
        }
    } catch (error) {
        console.log(error);
        res.status(400).send("error");
    }
});

Router.post('/noofupvotes', async (req, res) => {
    const activityId = req.body.activityId;

    const result = await ActivitySchema.findOne({ _id: ObjectId(activityId) }, { upvotes: 1, _id: 0 })
    
    if (result) {
        res.status(200).json(result.upvotes)
    }
    else {
        res.status(200).json(0)
    }

})


Router.post('/lastupvotes', async (req, res) => {
    const start = new Date(req.body.start)
    const activityId = req.body.activityId;

    // Aggregate the views by user ID and count the number of unique time values
    const pipeline = [
        {
            $match: {
                _id: ObjectId(activityId),
            },
        },
        { $project: {
            _id:0,
            upvotes: {$filter: {
                input: '$upvotes.time',
                as: 'time',
                cond: {$gte: ['$$time', start]}
            }}
        }}

    ]

    // Execute the aggregation pipeline and return the results
    const results = await ActivitySchema.aggregate(pipeline)
    if (results) {
        
        res.status(200).json(results[0].upvotes)
    }
    else {
        res.status(400).json({ msg: 'No views found' })
    }

})


export default Router;