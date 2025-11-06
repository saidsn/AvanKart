import mongoose from "mongoose";
const { Schema, model } = mongoose;
import PartnerUser from "./partnyorUserModel.js";

const tempPartnerProfileChangesSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "PartnerUser",
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    surname: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    full_name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
    },
    phone_suffix: {
      type: String,
      trim: true,
    },
    phone_number: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    duty: {
      type: Schema.Types.ObjectId,
      ref: "Duty",
    },
    perm: {
      type: Schema.Types.ObjectId,
      ref: "Permission",
    },
    birth_date: {
      type: Date,
    },
    password: {
      type: String,
    },
    otp: {
      type: String,
    },
    otp_type: {
      type: String,
      enum: ["email", "sms", "other"],
      default: "email",
    },
    expiresAt: {
      type: Date,
    },
    device_details: {
      type: Object,
      default: {},
    },
    request_delete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index burada tek tanımlı şekilde bırakılıyor
tempPartnerProfileChangesSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const TempPartnerProfileChanges = model(
  "TempPartnerProfileChanges",
  tempPartnerProfileChangesSchema
);

export default TempPartnerProfileChanges;
