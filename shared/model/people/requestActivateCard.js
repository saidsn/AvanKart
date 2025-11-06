import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin.js";

const requestActivateCardSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "PeopleUser",
      required: true,
    },
    card_id: {
      type: Schema.Types.ObjectId,
      ref: "Cards",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "rejected"],
      default: "pending",
    },
    actionMessage: {
      type: String,
    },
    action_time: {
      type: Date,
      default: Date.now,
    },
    attempts: {
      type: Number,
      default: 1,
    },
    reasons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CardConditions",
      },
    ],
  },
  {
    timestamps: true,
  }
);

requestActivateCardSchema.plugin(softDeletePlugin);

const RequestCard = mongoose.model("RequestCard", requestActivateCardSchema);

export default RequestCard;
