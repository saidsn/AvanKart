import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../utils/softDeletePlugin.js";

const adminUserSchema = new Schema({
    adminUser_id: { type: String, unique: true },
    name: { type: String, trim: true },
    surname: { type: String, trim: true },
    password: { type: String, required: true },
    profile_image: { type: String },
    profile_image_url: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    birth_date: { type: Date },
    duty: { type: Schema.Types.ObjectId, ref: "Duty" },
    permission_group: { type: Schema.Types.ObjectId, ref: "RbacAdminPermission" },
    sirket_id: { type: Schema.Types.ObjectId, ref: "Sirket" },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone_suffix: { type: Number, min: 1, max: 999 },
    phone: { type: String, trim: true },
    status: { type: String, enum: ['active', 'deactive', 'deleted', 'pending delete'], default: 'active' },
    ip: { type: String, default: null },
    device_info: { type: String, default: null },
    last_login_date: { type: Date, default: () => Date.now() },
    otp_code: { type: String },
    sms_otp_status: { type: Boolean, default: false },
    email_otp_status: { type: Boolean, default: false },
    last_otp_date: { type: Date, default: () => Date.now() },
    delete_purpose: { type: String, default: null },
    delete_time: { type: Date, default: null },
    deleter: { type: Schema.Types.ObjectId, ref: 'AdminUser', default: null },
}, { timestamps: true });

adminUserSchema.pre('save', async function (next) {
    if (this.adminUser_id) return next();

    try {
        let adminUser_id;
        do {
            adminUser_id = 'PM-' + Math.floor(1000000000 + Math.random() * 9000000000);
        } while (await this.constructor.findOne({ adminUser_id }));

        this.adminUser_id = adminUser_id;
        next();
    } catch (err) {
        next(err);
    }
});

adminUserSchema.plugin(softDeletePlugin);

const AdminUser = mongoose.model("AdminUser", adminUserSchema);

export default AdminUser;