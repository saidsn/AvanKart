import mongoose from "mongoose";

const { Schema, model } = mongoose;

const InstitutionApplicationSchema = new Schema(
  {
    institutionName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "applicationCategories",
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const InstitutionApplication = model("institutionApplications", InstitutionApplicationSchema);

export default InstitutionApplication;
