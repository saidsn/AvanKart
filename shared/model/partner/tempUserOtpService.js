import mongoose from "mongoose";
const { Schema } = mongoose;

const TempUserOtpServiceSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "PartnerUser",
      required: true,
    },
    otp_code: {
      type: String,
      required: true,
    },
    changed: {
      type: String,
      enum: ["sms", "email", "authenticator"],
      required: true,
    },
    accepted_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const TempUserOtpService = mongoose.model(
  "TempUserOtpService",
  TempUserOtpServiceSchema
);

export default TempUserOtpService;
