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
    phone: { type: String, unique: true, sparse: true, trim: true },
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

    status: { type: Number, enum: [0, 1, 2], default: 0 },
    token: { type: String, default: null },
    firebase_token: { type: String, default: null },
  },
  { timestamps: true }
);

function generatePeopleId() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let body = "";
  for (let i = 0; i < 10; i++) {
    body += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `AP-${body}`;
}

userSchema.pre("save", async function (next) {
  if (this.people_id) return next();
  try {
    let people_id;
    do {
      people_id = generatePeopleId();
    } while (await this.constructor.findOne({ people_id }));

    this.people_id = people_id;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.plugin(softDeletePlugin);

const PeopleUsers = model("PeopleUsers", userSchema);
export default PeopleUsers;
