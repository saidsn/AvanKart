import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin.js";

const invitePartnerSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "PartnerUser",
    },
    inviter: {
      type: Schema.Types.ObjectId,
      ref: "PartnerUser",
    },
    muessise_id: {
      type: Schema.Types.ObjectId,
      ref: "Muessise",
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

invitePartnerSchema.plugin(softDeletePlugin);
const InvitePartner = mongoose.model("InvitePartner", invitePartnerSchema);
export default InvitePartner;
