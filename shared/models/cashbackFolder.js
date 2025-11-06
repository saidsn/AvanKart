import mongoose from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const folderSchema = new mongoose.Schema(
  {
    folder_id: { type: String, unique: true }, //
    status: { type: String, enum: ['ongoing','complated'], default: 'ongoing' }, //
    total: { type: Number, default: 0 }, //
  },
  {
    timestamps: true,
  }
);

folderSchema.pre("save", async function (next) {
  if (this.sirket_id) return next();
  try {
    let folder_id;
    do {
      folder_id = "AINV-" + Math.floor(100000000 + Math.random() * 900000000);
    } while (await this.constructor.findOne({ folder_id }));

    this.folder_id = folder_id;
    next();
  } catch (err) {
    next(err);
  }
});

folderSchema.plugin(softDeletePlugin);

export const CashbackFolder = mongoose.model("CashbackFolder", folderSchema);

export default CashbackFolder;