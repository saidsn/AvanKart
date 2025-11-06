import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    device_name: {
        type: String,
        required: true
    },
    device_os: {
        type: String,
        required: true
    },
    last_login_date: {
        type: Date,
        required: true,
        default: Date.now
    },
    location: {
        type: String,
        required: true
    },
    token_id: {
        type: String,
        default: null
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: true
    },
    otp_verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const AdminSession = mongoose.model('AdminSession', sessionSchema);

export default AdminSession; 