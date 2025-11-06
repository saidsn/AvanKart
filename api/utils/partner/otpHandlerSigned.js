import jwt from 'jsonwebtoken';
import PartnerUser from '../../../shared/models/partnyorUserModel.js';
import TempPartnerProfileChanges from '../../../api/models/partner/tempPartnerProfileChanges.js';

export const acceptOtp = async ({ otp, duty, id }) => {
  try {
    const tempChange = await TempPartnerProfileChanges.findById(id);
    if (!tempChange) {
      return { message: 'Data Not Found', token: null };
    }

    const isOtpValid = tempChange.otp === otp;
    const isOtpExpired = new Date() > new Date(tempChange.expiresAt);

    if (!isOtpValid) {
      return { message: 'OTP is not valid', token: null };
    }

    if (isOtpExpired) {
      return {
        message: 'The OTP code has expired. Please request a new one.',
        token: null,
      };
    }

    const user = await PartnerUser.findById(tempChange.user_id);
    if (!user) {
      return { message: 'User not found', token: null };
    }

    switch (duty) {
      case 'updateName':
        user.name = tempChange.name;
        break;
      case 'updateBirthDate':
        user.birth_date = tempChange.birth_date;
        break;
      case 'updateEmail':
        user.email = tempChange.email;
        break;
      case 'updatePassword':
        user.password = tempChange.password; // TODO: Add password hashing
        break;
      case 'deleteProfile':
        await PartnerUser.findByIdAndDelete(user._id);
        return { message: 'Profile Deleted', token: null };
      default:
        return { message: 'Wrong Operation.', token: null };
    }

    await user.save();
    
    await TempPartnerProfileChanges.findByIdAndDelete(id);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    return { message: 'Operation Completed Successfully !', token };
  } catch (error) {
    return { message: 'AcceptOtp Error', token: null };
  }
};