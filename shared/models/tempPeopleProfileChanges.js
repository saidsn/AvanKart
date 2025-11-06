import mongoose from "mongoose";
const { Schema, model } = mongoose;

const tempPeopleProfileChangesSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "PeopleUser",
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
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone_suffix: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    phone_number: {
      type: String,
      trim: true,
    },
    birth_date: {
      type: Date,
    },
    password: {
      type: String,
    },
    duty: { type: Schema.Types.ObjectId, ref: "SirketDuty", default: null },
    perm: { type: Schema.Types.ObjectId, ref: "RbacPeoplePermission", default: null },
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
    request_freeze: {
      type: Boolean,
      default: false,
    },
    request_unsubscribe: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

tempPeopleProfileChangesSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const TempPeopleProfileChanges = model(
  "TempPeopleProfileChanges",
  tempPeopleProfileChangesSchema
);

export default TempPeopleProfileChanges;
