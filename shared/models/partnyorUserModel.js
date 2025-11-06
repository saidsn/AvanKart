import mongoose from "mongoose";
const { Schema, model } = mongoose;
import softDeletePlugin from "../utils/softDeletePlugin.js";
import { Muessise } from "./muessiseModel.js";
import Duties from "./duties.js";
import RbacPermission from "./rbacPermission.model.js";

const userSchema = new Schema(
  {
    name: { type: String, trim: true },
    surname: { type: String, trim: true },
    partnyor_id: { type: String, unique: true, sparse: true },
    muessise_id: {
      type: Schema.Types.ObjectId,
      ref: "Muessise",
      default: null,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    username: { type: String, trim: true },
    password: { type: String, required: true },
    last_password_update: {
      type: Date,
      default: () =>
        new Date(new Date().setFullYear(new Date().getFullYear() - 1)), // 1 year before
    },
    phone_suffix: { type: Number, min: 1, max: 999 },
    phone: { type: String, trim: true },
    birth_date: { type: Date },
    total_qr_codes: { type: Number, default: 0, min: 0 },
    today_qr_codes: { type: Number, default: 0, min: 0 },
    duty: { type: Schema.Types.ObjectId, ref: "Duty", default: null },
    perm: { type: Schema.Types.ObjectId, ref: "RbacPermission", default: null },
    last_qr_code: { type: Date, default: Date.now },
    last_login_ip: { type: String },
    last_user_agent: { type: String },
    language: { type: String, default: "az" },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "light",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    otp_code: { type: String },
    hire_date: { type: Date, default: null },
    dismissal_date: { type: Date, default: null },
    otp_send_time: { type: Date, default: Date.now },
    otp_destination: {
      type: String,
      enum: ["email", "sms", "authenticator"],
      default: "email",
    },
    otp_email_status: { type: Number, enum: [0, 1, 2], default: 1 },
    otp_sms_status: { type: Number, enum: [0, 1, 2], default: 0 },
    otp_authenticator_status: { type: Number, enum: [0, 1, 2], default: 0 },
    authenticator_secret: { type: String, default: null }, // authenticatorla giris eden zamani otp nin kodunu yaratmaq ucun
    status: { type: Number, enum: [0, 1, 2], default: 0 }, // 0 - deactive, 1 - active, 2 - waiting for deletion
    token: { type: String, default: null },
    firebase_token: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.partnyor_id) return next();
  try {
    let partnyor_id;
    do {
      partnyor_id = "PA-" + Math.floor(100000 + Math.random() * 900000);
    } while (await this.constructor.findOne({ partnyor_id }));

    this.partnyor_id = partnyor_id;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.plugin(softDeletePlugin);

const PartnerUser = model("PartnerUser", userSchema);

export default PartnerUser;
