import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'otp_to',
  },
  otp_to: {
    type: String,
    enum: ['admin', 'muessise', 'sirket'],
    default: 'muessise'
  },
  phone_suffix: { type: String },
  phone_number: { type: String },
  email: { type: String },
  otp: { type: String, required: true },
  expire_time: { type: Date, required: true, index: { expires: 0 } },
  attempts: { type: Number, default: 0 }
}, { timestamps: true });

const OtpModel = mongoose.model('Otp', otpSchema);

export default OtpModel;  