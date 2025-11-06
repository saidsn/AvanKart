import mongoose from "mongoose";
const { Schema, model } = mongoose;
import softDeletePlugin from "../utils/softDeletePlugin.js";

const userSchema = new Schema(
  {
    name: { type: String, trim: true },
    surname: { type: String, trim: true },

    people_id: { type: String, unique: true, sparse: true },

    sirket_id: {
      type: Schema.Types.ObjectId,
      ref: "Sirket",
      default: null,
    },

    totalBalance: { type: Number, default: 0, min: 0 },
    lastPaymentDate: { type: Date, default: null },
    lastPaymentLocation: { type: String, trim: true, default: null },

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
        new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    },
    phone_suffix: { type: Number, min: 1, max: 999 },
    phone: { type: String, trim: true },
    birth_date: { type: Date },
    total_qr_codes: { type: Number, default: 0, min: 0 },
    today_qr_codes: { type: Number, default: 0, min: 0 },

    duty: { type: Schema.Types.ObjectId, ref: "SirketDuty", default: null },
    perm: { type: Schema.Types.ObjectId, ref: "RbacPeoplePermission", default: null },
    imtiyaz: { type: Schema.Types.ObjectId, ref: "ImtiyazQruplari", default: null },

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
    status: { type: Number, enum: [0, 1, 2], default: 0 },
    token: { type: String, default: null },
    firebase_token: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.people_id) return next();
  try {
    let people_id;
    do {
      people_id = "AP-" + Math.floor(1000000000 + Math.random() * 9000000000);
    } while (await this.constructor.findOne({ people_id }));

    this.people_id = people_id;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.plugin(softDeletePlugin);

const PeopleUser = model("PeopleUser", userSchema);

export default PeopleUser;
