import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const rozetCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // kategori adının tekrarlanmasını önler
    },
    rozet_count: {
      type: Number,
      default: 0, // kategori altındaki rozet sayısı
      min: 0,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// eğer ileride kategoriye rozet eklenirse sayıyı otomatik güncellemek için yardımcı metod
rozetCategorySchema.methods.incrementRozetCount = function (n = 1) {
  this.rozet_count += n;
  return this.save();
};

rozetCategorySchema.plugin(softDeletePlugin);

const RozetCategory = mongoose.model("RozetCategory", rozetCategorySchema);

export default RozetCategory;