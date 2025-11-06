import OldSirketUsers from "../../../shared/model/people/oldSirketUsers.js";
import PeopleCardBalances from "../../../shared/model/people/cardBalances.js";
import { generateOtp, sendMail } from "../../../shared/utils/otpHandler.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js"
// TTL cache for storing OTP data
const otpCache = new Map();

// Clean up expired OTPs
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of otpCache.entries()) {
    if (now > data.expiresAt) {
      otpCache.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Leave Membership Request - Generate OTP and send to user
 */
export const leaveMembership = async (req, res) => {
  try {
    const { user } = req; // From authentication middleware
    const { sirket_id } = req.body;

    if (!sirket_id) {
      return res.status(400).json({
        status: "error",
        message: "Şirkət ID tələb olunur",
      });
    }

    // Check if user has active membership with the company
    const existingMembership = await PeopleUser.findOne({
      user_id: user.user_id,
      sirket_id: sirket_id,
      hire_date: { $exists: true },
      end_date: { $exists: false }, // No end date means active
    });

    if (!existingMembership) {
      return res.status(400).json({
        status: "error",
        message: "Bu şirkətdə aktiv üzvlüyünüz yoxdur",
      });
    }

    // Check if user has active balance
    const userBalances = await PeopleCardBalances.find({
      user_id: user.user_id,
      sirket_id: sirket_id,
      balance: { $gt: 0 },
    });

    if (userBalances.length > 0) {
      const totalBalance = userBalances.reduce(
        (sum, card) => sum + card.balance,
        0
      );
      return res.status(400).json({
        status: "error",
        message: `Üzvlükdən ayrılmaq üçün əvvəlcə ${totalBalance} AZN balansınızı istifadə etməlisiniz`,
      });
    }

    // Generate OTP
    const otp = generateOtp(6);
    const cacheKey = `leave_membership_${user.user_id}_${sirket_id}`;
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP in cache with TTL
    otpCache.set(cacheKey, {
      otp,
      user_id: user.user_id,
      sirket_id,
      expiresAt,
      membershipData: existingMembership,
    });

    // Send OTP via email
    const emailSent = await sendMail(user.email, otp, false);

    if (!emailSent) {
      return res.status(500).json({
        status: "error",
        message: "OTP göndərilə bilmədi. Yenidən cəhd edin",
      });
    }

    res.json({
      status: "success",
      message: "OTP email ünvanınıza göndərildi. 5 dəqiqə ərzində təsdiq edin",
      data: {
        sirket_id,
        expires_in: 300, // 5 minutes in seconds
      },
    });
  } catch (error) {
    console.error("Leave membership error:", error);
    res.status(500).json({
      status: "error",
      message: "Daxili server xətası",
    });
  }
};

/**
 * Accept Leave Membership - Verify OTP and process membership termination
 */
export const acceptLeaveMembership = async (req, res) => {
  try {
    const { user } = req;
    const { sirket_id, otp } = req.body;

    if (!sirket_id || !otp) {
      return res.status(400).json({
        status: "error",
        message: "Şirkət ID və OTP tələb olunur",
      });
    }

    const cacheKey = `leave_membership_${user.user_id}_${sirket_id}`;
    const otpData = otpCache.get(cacheKey);

    if (!otpData) {
      return res.status(400).json({
        status: "error",
        message: "OTP vaxtı bitib və ya mövcud deyil",
      });
    }

    if (Date.now() > otpData.expiresAt) {
      otpCache.delete(cacheKey);
      return res.status(400).json({
        status: "error",
        message: "OTP vaxtı bitib",
      });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({
        status: "error",
        message: "Yanlış OTP kodu",
      });
    }

    // Verify the membership still exists and is active
    const currentMembership = await PeopleUser.findOne({
      user_id: user.user_id,
      sirket_id: sirket_id,
      hire_date: { $exists: true },
      end_date: { $exists: false },
    });

    if (!currentMembership) {
      otpCache.delete(cacheKey);
      return res.status(400).json({
        status: "error",
        message: "Aktiv üzvlük tapılmadı",
      });
    }

    // Double-check balance again before processing
    const userBalances = await PeopleCardBalances.find({
      user_id: user.user_id,
      sirket_id: sirket_id,
      balance: { $gt: 0 },
    });

    if (userBalances.length > 0) {
      otpCache.delete(cacheKey);
      const totalBalance = userBalances.reduce(
        (sum, card) => sum + card.balance,
        0
      );
      return res.status(400).json({
        status: "error",
        message: `Balansınız (${totalBalance} AZN) olduğu üçün üzvlükdən ayrıla bilməzsiniz`,
      });
    }

    const endDate = new Date();

    // Start transaction for data consistency
    const session = await PeopleUser.startSession();
    session.startTransaction();

    try {
      // 1. Update current membership with end_date
      await PeopleUser.updateOne(
        {
          user_id: user.user_id,
          sirket_id: sirket_id,
          hire_date: { $exists: true },
          end_date: { $exists: false },
        },
        {
          end_date: endDate,
          updated_at: new Date(),
        },
        { session }
      );

      // 2. Create historical record in OldSirketUsers
      await OldSirketUsers.create(
        [
          {
            user_id: user.user_id,
            sirket_id: sirket_id,
            hire_date: currentMembership.hire_date,
            end_date: endDate,
            departure_reason: "user_request",
            created_at: new Date(),
          },
        ],
        { session }
      );

      // 3. Zero out all balances for this user-company combination
      await PeopleCardBalances.updateMany(
        {
          user_id: user.user_id,
          sirket_id: sirket_id,
        },
        {
          balance: 0,
          updated_at: new Date(),
        },
        { session }
      );

      await session.commitTransaction();

      // Remove OTP from cache
      otpCache.delete(cacheKey);

      res.json({
        status: "success",
        message: "Üzvlükdən uğurla ayrıldınız",
        data: {
          sirket_id,
          end_date: endDate,
          processed_at: new Date(),
        },
      });
    } catch (transactionError) {
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Accept leave membership error:", error);
    res.status(500).json({
      status: "error",
      message: "Daxili server xətası",
    });
  }
};
