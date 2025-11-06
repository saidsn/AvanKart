import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CompanyApplicationSchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    employeeCount: {
      type: Number,
      required: true,
      min: 1,
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

const CompanyApplication = model("companyApplications", CompanyApplicationSchema);

export default CompanyApplication;
