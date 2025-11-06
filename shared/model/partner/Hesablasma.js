import mongoose from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin.js";
import AdminUser from "../../models/adminUsersModel.js";
import TransactionsUser from "../../models/transactionsModel.js";

const HesablasmaSchema = new mongoose.Schema(
  {
    hesablasma_id: {
      type: String,
      unique: true,
    },
    transaction_count: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    komissiya: { type: Number, default: 0 },
    yekun_mebleg: { type: Number, default: 0 },
    from_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    faktura: {
      added_by: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "faktura.userRef",
        default: null,
      },
      userRef: {
        type: String,
        enum: ["PartnerUser", "AdminUser"],
        default: null,
      },
      path: { type: String, default: null },
      fileName: { type: String, default: null },
      added_at: { type: Date, default: null },
    },
    status: {
      type: String,
      required: true,
      enum: [
        "qaralama",
        "waiting_aktiv",
        "waiting_tamamlandi",
        "reported",
        "reported_arasdirilir",
        "reported_arasdirilir_yeniden_gonderildi",
        "aktiv",
        "tamamlandi",
      ],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PartnerUser",
      default: null,
    },
    muessise_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Muessise",
      required: true,
    },
    avankart_admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

HesablasmaSchema.pre("save", async function (next) {
  if (this.hesablasma_id) return next();
  try {
    let newId;
    do {
      newId = "MINV-" + Math.floor(1000000000 + Math.random() * 9000000000);
    } while (await this.constructor.findOne({ hesablasma_id: newId }));
    this.hesablasma_id = newId;
    next();
  } catch (err) {
    next(err);
  }
});

HesablasmaSchema.virtual("transactionUsers", {
  ref: "TransactionsUser",
  localField: "_id",
  foreignField: "hesablasma_id",
  match: { status: "success" },
});

HesablasmaSchema.virtual("totalBalance").get(function () {
  if (!Array.isArray(this.transactionUsers)) return 0;

  return this.transactionUsers.reduce((sum, t) => {
    if (t?.status !== "success") return sum;

    const amount = Number(t?.amount) || 0;
    const comission = Number(t?.comission) || 0;
    return sum + (amount - (amount * comission) / 100);
  }, 0);
});

HesablasmaSchema.plugin(softDeletePlugin);

const Hesablasma = mongoose.model("Hesablasma", HesablasmaSchema);

export default Hesablasma;
