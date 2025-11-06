import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin.js";

const invitePeopleSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "PeopleUser",
    },
    inviter: {
      type: Schema.Types.ObjectId,
      ref: "PeopleUser",
    },
    sirket_id: {
      type: Schema.Types.ObjectId,
      ref: "Sirket",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "canceled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

invitePeopleSchema.plugin(softDeletePlugin);
const InvitePeople = mongoose.model("InvitePeople", invitePeopleSchema);
export default InvitePeople;
