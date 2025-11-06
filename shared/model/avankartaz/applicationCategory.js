import mongoose from "mongoose";
import slugify from "slugify";

const { Schema, model } = mongoose;

const ApplicationCategorySchema = new Schema(
  {
    title: {
      az: { type: String, required: true },
      tr: { type: String, required: true },
      en: { type: String, required: true },
      ru: { type: String, required: true },
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

ApplicationCategorySchema.pre("save", function (next) {
  if (!this.slug || this.slug.trim() === "") {
    this.slug = slugify(this.title.az, {
      lower: true,
      strict: true,
      locale: "az",
      replacement: "-",
    });
  }
  next();
});

const ApplicationCategory = model("applicationCategories", ApplicationCategorySchema);

export default ApplicationCategory;
