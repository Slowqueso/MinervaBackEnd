import express from "express";
const Router = express.Router();
import UserSchema from "../../../models/UserSchema.js";
import ActivitySchema from "../../../models/ActivitySchema.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

Router.post("/donated", async (req, res) => {
    const token = req.headers["x-access-token"];
    const activityId = req.body.activityId;
    const amount = req.body.amount;
    try {
        const decoded = jwt.decode(token, process.env.SECRET_KEY);
        const { id } = decoded;
        if (id) {
            const activity = (await ActivitySchema.findOneAndUpdate(
                { _id: activityId, 'donations.user_id': { $ne: id } },
                {$addToSet: { donations: { user_id: id, amount: amount } } },
                { returnOriginal: false }
                ));
            if (activity) {
                return res.status(200).json({
                    msg: "Activity donated",
                });
            } else {
                res.status(400).json({ msg: `Donation already exists for user ${id}` });
            }
        } else {
            res.status(400).json({ msg: "Invalid Token" });
        }
    } catch (error) {
        console.log(error);
        res.status(400).send("error");
    }
});

Router.post('/lastdonations', async (req, res) => {
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
                donations: {
                    $filter: {
                        input: '$donations',
                        as: 'donation',
                        cond: { $gte: ['$$donation.time', start] }
                    }
                }
            }
        }
    ];

    const result = await ActivitySchema.aggregate(pipeline);
    if (result) {
        res.status(200).json(result[0].donations)
    }
    else {
        res.status(400).json({ msg: "No comments found" })
    }
})



export default Router;