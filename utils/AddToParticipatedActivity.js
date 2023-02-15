import UserSchema from "../models/UserSchema.js";
import ActivitySchema from "../models/ActivitySchema.js";
import Roles from "../constants/activity_roles.js";

const AddToParticipatedActivity = (activityId, userId, role) => {
  const role_name = Roles[role];
  UserSchema.findByIdAndUpdate(
    userId,
    {
      $push: {
        activities_participated_in: {
          activityID: activityId,
          activity_role: role,
          activity_role_name: role_name,
        },
      },
    },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log("User updated");
      }
    }
  );
};

export default AddToParticipatedActivity;
