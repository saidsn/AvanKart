import mongoose, { Schema, model } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const invoiceReportSchema = new Schema({
    invoice_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
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
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PeopleUser",
        default: null
    },
    message: {
        type: String,
        default: null
    },
    after_balance: {
        type: Number,
        default: 0
    },
    after_commission: {
        type: Number,
        default: null
    },
    after_commission_percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
},
  {
    timestamps: true,
  });


invoiceReportSchema.plugin(softDeletePlugin);

const InvoiceReport = model("InvoiceReport", invoiceReportSchema);

export default InvoiceReport;