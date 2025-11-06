import PartnerUser from '../../../shared/models/partnyorUserModel.js';
import mongoose from 'mongoose';

export const home = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const userId = req.user;
    const firebaseToken = req.body?.firebase_token ?? undefined;

    let user; // üstte tanımlıyoruz
    if (firebaseToken) {
      user = await PartnerUser.findOneAndUpdate(
        { _id: userId },
        { $set: { firebase_token: firebaseToken } },
        { new: true }
      ).populate('muessise_id').lean();
    } else {
      user = await PartnerUser.findById(userId).populate('muessise_id').lean();
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }





    return res.status(200).json({
      success: true,
      message: "ok",
      token,
      user, // burası artık undefined olmaz
      a: '1.0.0',
      i: '1.0.0'
    });
  } catch (error) {
    console.error("error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
