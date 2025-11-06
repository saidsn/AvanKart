import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import softDeletePlugin from '../utils/softDeletePlugin.js';
import PartnerUser from './partnyorUserModel.js';
import Muessise from './muessiseModel.js';
import TransactionsUser from './transactionsModel.js';

const generateCode = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 16; i++) {
    const rand = Math.floor(Math.random() * chars.length);
    result += chars[rand];
  }
  return result;
};

const qrCodeSchema = new Schema({
    price: { type: String, trim: true },
    code: { type: String, unique:true, trim: true},
    type: { type: String, trim: true}, // ref falan olmalı bu da
    creator_id: { type: Schema.Types.ObjectId, ref: 'PartnerUser', default: null },
    muessise_id: { type: Schema.Types.ObjectId, ref: 'Muessise', default: null }, //müessise id
    reader_id: { type: Schema.Types.ObjectId, ref: 'PartnerUser', default: null },
    transaction_id: { type: Schema.Types.ObjectId, ref: 'TransactionsUser', default: null }, // TRX-XXXXXXXXXX
    creating_time: { type: Date, default: Date.now },
    expire_time: { type: Date, required: true},
    read_time: { type: Date, default: null },
    status: { type: Number, enum: [0, 1, 2], default: 0 }
},{ timestamps: true });

qrCodeSchema.pre('save', async function (next) {
  if (this.partnyor_id) return next();

  let exists;
   do {
    this.code = generateCode();
    exists = await this.constructor.findOne({ code: this.code });
  } while (exists)

  next();
});

const QrCode = model('QrCode', qrCodeSchema);

export default QrCode;
