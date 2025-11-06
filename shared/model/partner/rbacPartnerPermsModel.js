import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import PartnerUser from '../../models/partnyorUserModel.js'; // Assuming this is the correct import for the PartnerUser model
import Muessise from '../../models/muessiseModel.js'; // Assuming this is the correct import for the Muessise model

const rbacPartnerPermsSchema = new Schema({
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: 'PartnerUser',
    required: true,
    index: true
  },
  muessise_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Muessise",
  },
  users: [{ type: Schema.Types.ObjectId, ref: 'PartnerUser' }],
  otp_code: { type: String },
  otp_send_time: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// TTL index burada tek tanımlı şekilde bırakılıyor
rbacPartnerPermsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RbacPartnerPermUsers = model('RbacPartnerPermUsers', rbacPartnerPermsSchema);

export default RbacPartnerPermUsers;
