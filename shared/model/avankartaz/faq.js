import mongoose from "mongoose";

const { Schema, model } = mongoose;

const FaqSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    localization: {
      type: String,
      enum: ["az", "tr", "en", "ru"],
    },
    category: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Faq = model("faqs", FaqSchema);

export default Faq;
