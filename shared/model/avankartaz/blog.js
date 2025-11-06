import mongoose from "mongoose";
import slugify from "slugify";

const { Schema, model } = mongoose;

const BlogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    lang: {
      type: String,
      required: true,
      enum: ["az", "tr", "en", "ru"],
      default: "az",
    },
    coverImage: {
      type: String,
      required: true,
    },
    detailImage: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "blogCategories",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

BlogSchema.pre("save", async function (next) {
  if (!this.isModified("title")) return next();

  let baseSlug = slugify(this.title, {
    lower: true,
    strict: true,
    locale: "az",
    replacement: "-",
  });

  let slug = baseSlug;
  let counter = 1;

  const Model = mongoose.model("Blog", BlogSchema);

  // aynı slug varsa -1, -2, ... ekle
  while (await Model.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  this.slug = slug;
  next();
});

const Blog = model("blogs", BlogSchema);

export default Blog;
