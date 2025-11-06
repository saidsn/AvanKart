import mongoose, { model, Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";
import Sirket from "./sirketModel.js";

const eQaimeSchema = new Schema({
  qaime_id: {
    type: String,
    unique: true,
    sparse: true,
  },
  qaime_total: {
    type: Number,
    default: 0,
  },
  start_date: {
    type: Date,
    default: Date.now,
  },
  end_date: {
    type: Date,
    default: Date.now,
  },
  month: {
    type: String,
    default: "January",
    enum: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
  status: {
    type: String,
    default: "passive",
    enum: ["active", "passive", "tamamlandi", "canceled"],
  },
  cards: [
    {
      card_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cards",
      },
      balance: {
        type: Number,
        default: 0,
      },
    },
  ],
  sirket_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sirket",
  },
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdminUser",
    default: null,
  }
}, { timestamps: true });

eQaimeSchema.pre("save", async function (next) {
  if (this.qaime_id) return next();
  try {
    let qaime_id;
    do {
      qaime_id = "EQA-" + Math.floor(1000000000 + Math.random() * 9000000000);
    } while (await this.constructor.findOne({ qaime_id }));
    this.qaime_id = qaime_id;
    next();
  } catch (err) {
    next(err);
  }
});

eQaimeSchema.plugin(softDeletePlugin);

const EQaime = model("EQaime", eQaimeSchema);

export default EQaime;
