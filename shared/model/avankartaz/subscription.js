import mongoose from "mongoose";

const { Schema, model } = mongoose;

const SubscriptionSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

const Subscription = model("subscriptions", SubscriptionSchema);

export default Subscription;
