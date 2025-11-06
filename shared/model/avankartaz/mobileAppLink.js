import mongoose from "mongoose";

const { Schema, model } = mongoose;

const MobileAppLinkSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const MobileAppLink = model("mobileAppLinks", MobileAppLinkSchema);

export default MobileAppLink;
