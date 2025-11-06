import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin.js";

const cardBalanceSchema = new Schema(
  {
    card_id: {
      type: Schema.Types.ObjectId,
      ref: "Cards",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "PeopleUsers",
      required: true,
    },
    sirket_id: {
      type: Schema.Types.ObjectId,
      ref: "Sirket",
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      required: true,
    },
    last_balance: {
      type: Number,
      default: 0,
    },
    added_balance: {
      type: Number,
      default: 0,
    },
    lastPayment: {
      type: Date,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      refPath: "refModel",
    },
    refModel: {
      type: String,
      enum: ["AdminUser", "PeopleUser"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "inactive",
    },
  },
  {
    timestamps: true,
  }
);

cardBalanceSchema.plugin(softDeletePlugin);

cardBalanceSchema.index(
  { card_id: 1, user_id: 1, sirket_id: 1 },
  { unique: true }
);

const PeopleCardBalance = mongoose.model(
  "PeopleCardBalance",
  cardBalanceSchema
);

export default PeopleCardBalance;
