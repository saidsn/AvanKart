import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import PartnerUser from '../../models/partnyorUserModel.js';
import Duty from '../../models/duties.js'; // Assuming this is the correct import for the Duty model

const tempPartnerDutyDeleteSchema = new Schema({
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: 'PeopleUser',
    required: true,
    index: true
  },
  duties: [{ type: Schema.Types.ObjectId, ref: 'Duties' }],
  otp_code: { type: String },
  otp_send_time: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// TTL index burada tek tanımlı şekilde bırakılıyor
tempPartnerDutyDeleteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TempPeopleDutyDelete = model('TempPeopleDutyDelete', tempPartnerDutyDeleteSchema);

export default TempPeopleDutyDelete;
