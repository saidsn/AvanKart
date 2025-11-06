import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../../utils/softDeletePlugin.js";

const addBalanceSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "PeopleUsers",
      required: true,
    },
    sirket_id: {
      type: Schema.Types.ObjectId,
      ref: "Sirket",
      required: true,
    },
    cards: [
      {
        card_id: {
          type: Schema.Types.ObjectId,
          ref: "Cards",
        },
        count: Number,
      },
    ],
    total_balance: {
      type: Number,
      default: 0,
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      refPath: "refModel",
    },
    refModel: {
      type: String,
      enum: ["AdminUser", "PeopleUser"],
    },
    balance_id: { type: String },
    status: {
      type: String,
      enum: [
        "active",
        "passive",
        "canceled",
        "waiting",
        "reported",
        "completed",
        "complated",
      ],
      default: "active",
    },
    otp: {
      code: {
        type: String,
        default: null,
      },
      createdAt: {
        type: Date,
        default: null,
      },
      accepted: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

addBalanceSchema.plugin(softDeletePlugin);

addBalanceSchema.pre("save", async function (next) {
  if (this.balance_id) return next();
  try {
    let balance_id;
    do {
      balance_id =
        "BINV-" + Math.floor(10000000000 + Math.random() * 90000000000);
    } while (await this.constructor.findOne({ balance_id }));

    this.balance_id = balance_id;
    next();
  } catch (err) {
    next(err);
  }
});

const AddCardBalance = mongoose.model("AddCardBalance", addBalanceSchema);
export default AddCardBalance;
