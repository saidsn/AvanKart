import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const faqSchema = new Schema(
  {
    question: {
      type: Schema.Types.Mixed,
      required: true,
    },
    answer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    creator_id: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: "PartnerUser",
    },
    category: {
      type: String,
      required: true,
      enum: ["login", "home"],
    },
    project: {
      type: String,
      required: true,
      enum: ["all", "muessise", "sirket"],
    },
  },
  {
    timestamps: true,
  }
);

faqSchema.plugin(softDeletePlugin);

const FAQ = mongoose.model("FAQ", faqSchema);

export default FAQ;
