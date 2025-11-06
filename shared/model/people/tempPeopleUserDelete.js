import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import PartnerUser from '../../models/partnyorUserModel.js';
import PeopleUser from '../../models/peopleUserModel.js';

const tempPartnerUserDeleteSchema = new Schema({
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: 'PeopleUser',
    required: true,
    index: true
  },
  users: [{ type: Schema.Types.ObjectId, ref: 'PeopleUser' }],
  otp_code: { type: String },
  otp_send_time: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// TTL index burada tek tanımlı şekilde bırakılıyor
tempPartnerUserDeleteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TempPeopleUserDelete = model('TempPeopleUserDelete', tempPartnerUserDeleteSchema);

export default TempPeopleUserDelete;
