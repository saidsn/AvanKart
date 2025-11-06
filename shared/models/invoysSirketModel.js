import mongoose, { Schema, model } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const invoiceSchema = new Schema({
    invoice_id: {
        type: String,
        unique: true,
        sparse: true
    },
    balance: {
        type: Number,
        default: 0
    },
    total_balance: {
        type: Number,
        default: 0
    },
    commission: {
        type: Number,
        default: null
    },
    commission_percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    sirket_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sirket"
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdminUser",
        default: null
    },
    status: {
        type: String,
        default: "active",
        enum: ["active", "passive", "canceled", "waiting", "reported", "reported_sended_again", "complated"],
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PeopleUser"
    }
},
  {
    timestamps: true,
  });

invoiceSchema.pre("save", async function (next) {
    try {
        if (this.invoice_id) return next();
        let invoice_id;
        do {
            invoice_id = "CINV-" + Math.floor(1000000000 + Math.random() * 9000000000);
        } while (await this.constructor.findOne({ invoice_id }));
        this.invoice_id = invoice_id;
        next();
    } catch (err) {
        next(err);
    }
});

invoiceSchema.plugin(softDeletePlugin);

const Invoice = model("Invoice", invoiceSchema);

export default Invoice;