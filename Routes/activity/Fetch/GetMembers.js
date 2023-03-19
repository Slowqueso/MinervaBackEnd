import express from "express";
const Router = express.Router();
import UserSchema from "../../../models/UserSchema.js";
import ActivitySchema from "../../../models/ActivitySchema.js";

Router.get("/get-members/:activityPUID", async (req, res) => {
  try {
    const { activityPUID } = req.params;
    const { members: activityMembers } = await ActivitySchema.findOne(
      { public_ID: activityPUID },
      {
        members: 1,
      }
    );
    const members2 = await Promise.all(
      activityMembers.map(async (member) => {
        const user = await UserSchema.findOne(
          { _id: member.id },
          {
            _id: 1,
            username: 1,
            wallet_ID: 1,
            profile_pic: 1,
          }
        );
        const profile_picture = user.profile_pic.data
          ? `data:image/${
              user.profile_pic.contentType
            };base64,${user.profile_pic.data.toString("base64")}`
          : null;
        return {
          username: user.username,
          wallet_ID: user.wallet_ID._address,
          // user_id: user._id,
          date_of_join: member.date_of_join,
          profile_pic: profile_picture,
        };
      })
    );
    return res.status(200).json(members2);
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

export default Router;
