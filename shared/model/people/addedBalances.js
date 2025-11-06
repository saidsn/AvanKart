import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin.js";
import PeopleUser from "../../models/peopleUserModel.js";

const addedBalancesSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "PeopleUser",
      required: true,
    },
    balance_id: {
      type: Schema.Types.ObjectId,
      ref: "AddCardBalance",
    },
    sirket_id: {
      type: Schema.Types.ObjectId,
      ref: "Sirket",
      required: true,
    },
    card_id: {
        type: Schema.Types.ObjectId,
        ref: "Cards",
    },
    perm_id: {
        type: Schema.Types.ObjectId,
        ref: "RbacPermission",
    },
    imtiyaz_id: {
      type: Schema.Types.ObjectId,
      ref: "ImtiyazQruplari",
    },
    total_balance: {
      type: Number,
      default: 0,
      required: true,
    },
    last_balance: {
      type: Number,
      default: 0,
      required: true,
    },
    added_balance: {
      type: Number,
      default: 0,
      required: true,
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
      enum: [
        "inactive",
        "active",
        "passive",
        "canceled",
        "waiting",
        "reported",
        "completed",
        "complated",
      ],
      default: "inactive"
    }
  },
  {
    timestamps: true,
  }
);

addedBalancesSchema.plugin(softDeletePlugin);


const AddedBalance = mongoose.model(
  "AddedBalance",
  addedBalancesSchema
);

export default AddedBalance;
