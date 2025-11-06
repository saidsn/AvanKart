import mongoose from "mongoose";

const tempAddedPartnerProfileChangesSchema = new mongoose.Schema(
  {
    // User məlumatları
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    muessiseName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    dutyId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    permissionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Creator məlumatları
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    // Status məlumatları
    status: {
      type: String,
      enum: [
        "pending_otp_verification",
        "approved_no_otp",
        "otp_verified",
        "expired",
      ],
      default: "pending_otp_verification",
    },

    // OTP məlumatları
    otpCode: {
      type: String,
      default: null,
    },
    otpMethod: {
      type: String,
      enum: ["email", "sms", "authenticator"],
      default: null,
    },
    otpSentAt: {
      type: Date,
      default: null,
    },
    otpVerifiedAt: {
      type: Date,
      default: null,
    },

    // Tarix məlumatları
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 saat
    },
  },
  {
    timestamps: true,
  }
);

// Index əlavə etmək
tempAddedPartnerProfileChangesSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);
tempAddedPartnerProfileChangesSchema.index({ createdBy: 1 });
tempAddedPartnerProfileChangesSchema.index({ status: 1 });

const tempAddedPartnerProfileChanges = mongoose.model(
  "TempAddedPartnerProfileChanges",
  tempAddedPartnerProfileChangesSchema
);

export default tempAddedPartnerProfileChanges;
