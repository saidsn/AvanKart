import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const userRozetSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "PeopleUser",
      required: true,
      index: true,
    },
    rozet: {
      type: Schema.Types.ObjectId,
      ref: "Rozet",
      required: true,
      index: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    // rozet pasiv edildiyse ya da sistemden kaldırıldıysa
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userRozetSchema.plugin(softDeletePlugin);

const UserRozet = mongoose.model("UserRozet", userRozetSchema);

export default UserRozet;