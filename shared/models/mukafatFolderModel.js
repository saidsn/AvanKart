import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const mukafatFolderSchema = new Schema(
  {
    folder_id: {
      type: String,
      unique: true,
      sparse: true, // manuel gireceğini söyledin, string yeterli
    },
    mukafat_count: {
      type: Number,
      default: 0, // toplam kaç mukafat kaydedildi
    },
    user_count: {
      type: Number,
      default: 0, // kaç farklı kullanıcı mukafat kazandı
    },
    total_earned: {
      type: Number,
      default: 0, // UserMukafat içindeki earned alanlarının toplamı
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

mukafatFolderSchema.pre("save", async function (next) {
  if (this.folder_id) return next();
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

// status: ongoing / completed (ay bazlı kontrol)
mukafatFolderSchema.virtual("status").get(function () {
  const now = new Date();
  const folderMonth = this.createdAt.getMonth();
  const folderYear = this.createdAt.getFullYear();

  if (folderMonth === now.getMonth() && folderYear === now.getFullYear()) {
    return "ongoing";
  }
  return "completed";
});

// toplam güncelleme için yardımcı metod
mukafatFolderSchema.methods.updateStats = async function () {
  const UserMukafat = mongoose.model("UserMukafat");

  const mukafatlar = await UserMukafat.find({
    createdAt: {
      $gte: new Date(
        this.createdAt.getFullYear(),
        this.createdAt.getMonth(),
        1
      ),
      $lt: new Date(
        this.createdAt.getFullYear(),
        this.createdAt.getMonth() + 1,
        1
      ),
    },
  });

  this.mukafat_count = mukafatlar.length;
  this.user_count = new Set(mukafatlar.map((m) => m.user.toString())).size;
  this.total_earned = mukafatlar.reduce((sum, m) => sum + (m.earned || 0), 0);

  return this.save();
};

mukafatFolderSchema.plugin(softDeletePlugin);

const MukafatFolder = mongoose.model("MukafatFolder", mukafatFolderSchema);

export default MukafatFolder;
