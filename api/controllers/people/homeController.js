import mongoose from 'mongoose';
import PeopleUser from '../../../shared/models/peopleUserModel.js';

export const home = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    try {
        const userId = new mongoose.Types.ObjectId(req.user);
        const user = await PeopleUser.findOne({ _id: userId }).populate('sirket_id', 'sirket_name sirket_id profile_image profile_image_path');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, message: 'ok', token, user}); // gələcəkdə bura qr code sayını da döndərəcəyik.
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}