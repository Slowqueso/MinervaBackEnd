import express from "express";
const Router = express.Router();
import jwt from "jsonwebtoken";
import UserSchema from "../../../models/UserSchema.js";
import ActivitySchema from "../../../models/ActivitySchema.js";
import { ObjectId } from "mongodb";
import { web3, contract, accounts } from "../../../configs/web3_connection.js";

Router.get("/info/:tags", async (req, res) => {
  const { tags } = req.params;
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const user = await UserSchema.findOne({ _id: id }, { [tags]: 1 });
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
    return res.status(400).json({
      msg: "Token Does not exist",
    });
  }
});

Router.get("/info", async (req, res) => {
  const token = req.headers["x-access-token"];
  const walletAddress = req.headers["wallet-address"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const user = await UserSchema.findOne({ _id: id });
      if (user) {
        let isUserRegistered = false;
        if (user.wallet_ID) {
          isUserRegistered = true;
        }
        if (walletAddress) {
          const wallet = walletAddress || user.wallet_ID;
          if (wallet != "null" && wallet && !isUserRegistered) {
            isUserRegistered = await contract.methods
              .isUserRegistered(wallet)
              .call({ from: accounts[0] });
          }
          if (isUserRegistered) {
            user.wallet_ID = wallet;
            await user.save();
          }
        }
        if (user.profile_pic) {
          return res.status(200).json({
            authenticated: true,
            user: {
              id: user._id,
              username: user.username,
              email: user.email,
              credit_score: user.credit_score,
              profile_pic: `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/profilePic/${user.profile_pic}`,
              address: user.address,
              occupation: user.occupation,
              public_ID: user.public_ID,
              isUserRegistered,
            },
          });
        } else {
          return res.status(200).json({
            authenticated: true,
            user: {
              id: user._id,
              username: user.username,
              email: user.email,
              credit_score: user.credit_score,
              address: user.address,
              occupation: user.occupation,
              public_ID: user.public_ID,
            },
          });
        }
      } else {
        return res.status(400).json({ authenticated: false });
      }
    } else {
      return res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("error");
  }
});

Router.get("/if_email_auth", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const user = await UserSchema.findOne({ _id: id }, { email_auth: 1 });
      if (user) {
        return res.status(200).json({
          authenticated: true,
          email_auth: user.email_auth,
        });
      } else {
        res.status(400).json({ authenticated: false });
      }
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("error");
  }
});

Router.get("/toggle_email_auth", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const user = await UserSchema.findOne({ _id: id }, { email_auth: 1 });
      UserSchema.findOneAndUpdate(
        { _id: id },
        { $set: { email_auth: !user.email_auth } }
      )
        .then((response) => {
          res.status(200).json({ authenticated: true });
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json({ authenticated: false });
        });
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("error");
  }
});

Router.get("/view_profiles", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      UserSchema.findOne({ _id: id }, { student_profile: 1, job_profile: 1 })
        .then((user) => {
          if (user) {
            return res.status(200).json({
              student_profile: user.student_profile,
              job_profile: user.job_profile,
            });
          } else {
            res.status(400).json("error");
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json("error");
        });
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("error");
  }
});

Router.get("/get-profile-by-puid/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await UserSchema.findOne(
      { public_ID: uid },
      { username: 1, profile_pic: 1 }
    );

    if (user) {
      const profile_pic = user.profile_pic.contentType
        ? `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/profilePic/${user.profile_pic}`
        : null;
      return res.status(200).json({
        user: {
          username: user.username,
          profile_pic: profile_pic,
        },
      });
    } else {
      return res.status(404).json({ msg: "User Does not exist" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

Router.get("/get-profile-by-uid/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await UserSchema.findOne(
      { _id: uid },
      { username: 1, profile_pic: 1 }
    );

    if (user) {
      const profile_pic = user.profile_pic
        ? `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/profilePic/${user.profile_pic}`
        : null;
      return res.status(200).json({
        user: {
          username: user.username,
          profile_pic: profile_pic,
        },
      });
    } else {
      return res.status(404).json({ msg: "User does not exist" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

Router.post("/get-profile-by-wallet", async (req, res) => {
  var wallet = req.body.walletAddress;

  try {
    const user = await UserSchema.find(
      { "wallet_ID._address": { $in: wallet } },
      { username: 1, profile_pic: 1, "wallet_ID._address": 1, _id: 0 }
    );
    if (user) {
      const newUser = [];
      user.forEach((element) => {
        const profile_pic = element.profile_pic.contentType
          ? `data:image/${
              element.profile_pic.contentType
            };base64,${element.profile_pic.data.toString("base64")}`
          : null;
        newUser.push({
          username: element.username,
          profile_pic: profile_pic,
          walletAddress: element.wallet_ID._address,
        });
      });
      return res.status(200).json({
        user: newUser,
      });
    } else {
      return res.status(404).json({ msg: "User Does not exist" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

Router.post("/get-all-notifications", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const notifications = await UserSchema.find(
        { _id: id },
        { notifications: 1, _id: 0 }
      );

      if (notifications) {
        return res.status(200).json({
          notifications: notifications[0].notifications,
        });
      } else {
        res.status(400).json({ authenticated: false });
      }
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("error");
  }
});

Router.get("/get-no-of-notifications", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const pipeline = [
        {
          $match: {
            _id: ObjectId(id),
          },
        },
        {
          $project: {
            _id: 0,
            count: {
              $size: "$notifications",
            },
          },
        },
      ];
      const notification = await UserSchema.aggregate(pipeline);
      if (notification.length > 0) {
        return res.status(200).json({
          count: notification[0].count,
        });
      } else {
        res.status(400).json({ authenticated: false });
      }
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("error");
  }
});

Router.post("/remove-notification", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const response = await UserSchema.updateOne(
        { _id: id },
        { $pull: { notifications: { _id: req.body.id } } }
      );
      if (response) {
        return res.status(200).json({
          msg: "Notification Removed",
        });
      } else {
        res.status(400).json({ authenticated: false });
      }
    } else {
      res.status(400).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("error");
  }
});

Router.post("/get-role", async (req, res) => {
  const token = req.headers["x-access-token"];
  const activityId = req.body.activityId;
  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY);
    const { id } = decoded;
    if (id) {
      const activity = await ActivitySchema.findOne(
        { public_ID: activityId },
        { _id: 1 }
      );
      if (activity) {
        const pipeline = [
          {
            $match: {
              _id: ObjectId(id),
            },
          },
          {
            $project: {
              _id: 0,
              activities_participated_in: 1,
            },
          },
          {
            $unwind: {
              path: "$activities_participated_in",
            },
          },
          {
            $match: {
              "activities_participated_in.activityID": activity._id.toString(),
            },
          },
          {
            $project: {
              role: "$activities_participated_in.activity_role",
            },
          },
        ];
        const role = await UserSchema.aggregate(pipeline);
        if (role) {
          return res.status(200).json(role[0]);
        } else {
          res.status(400).json({ authenticated: false });
        }
      } else {
        res.status(400).json({ msg: "Invalid activity" });
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
