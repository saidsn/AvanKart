import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const userMukafatSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "PeopleUser",
      required: true,
      index: true,
    },
    folder_id: {
      type: Schema.Types.ObjectId,
      ref: "MukafatFolder"
    },
    mukafat: {
      type: Schema.Types.ObjectId,
      ref: "Mukafat",
      required: true,
      index: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    earned: {
      type: Number,
      default: 0
    },
    isUsed: {
      type: Boolean,
      default: false, // hediye kuponu gibi kullanılabilir ödüller için
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userMukafatSchema.plugin(softDeletePlugin);

const UserMukafat = mongoose.model("UserMukafat", userMukafatSchema);

export default UserMukafat;