import mongoose from "mongoose";
const { Schema } = mongoose;

const TempUserOtpServiceSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "PeopleUser",
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
  },
  { timestamps: true }
);

const TempPeopleOtpService = mongoose.model(
  "TempPeopleOtpService",
  TempUserOtpServiceSchema
);

export default TempPeopleOtpService;
