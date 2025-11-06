import mongoose from "mongoose";
const { Schema } = mongoose;

const TempAdminOtpServiceSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    otp_code: {
      type: String,
      required: true,
    },
    changed: {
      type: String,
      enum: ["sms", "email","authenticator"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "passive"],
      default: "active",
    },
    type: {
      type: String,
      enum: ["email", "sms","authenticator"],
      required: true,
    },
    accepted_at: {
      type: Date,
      default: null,
    },
    otp_to: {
      type: String,
      enum: ["admin", "sirket", "muessise"],
      required: false,
      deafult: "admin"
    }
  },
  { timestamps: true }
);

const TempAdminOtpService = mongoose.model(
  "TempAdminOtpService",
  TempAdminOtpServiceSchema
);

export default TempAdminOtpService;
