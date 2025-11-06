import PeopleUser from "../../../shared/models/peopleUserModel.js";
import OldSirketUsers from "../../../shared/model/people/oldSirketUsers.js";
import Sirket from "../../../shared/models/sirketModel.js";
import TransactionsUser from "../../../shared/models/transactionsModel.js";
import TempPeopleProfileChanges from "../../../shared/models/tempPeopleProfileChanges.js";
import OtpModel from "../../../shared/models/otp.js";
import { generateOtp, sendMail } from "../../../shared/utils/otpHandler.js";

//  dd.mm.yyyy
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

export const getUzvluk = async (req, res) => {
  try {
    const user = req.user;
    console.log("Uzvluk request received for user:", user);

    const foundUser = await PeopleUser.findById(user).populate("sirket_id");

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    
    const memberships = [];

    // active uzvluk
    if (foundUser.sirket_id) {
      const currentMembership = {
        _id: foundUser.sirket_id._id,
        sirket_name: foundUser.sirket_id.sirket_name,
        profile_image_path: foundUser.sirket_id.profile_image_path,
        hire_date: formatDate(foundUser.hire_date),
        status: "ongoing",
      };
      memberships.push(currentMembership);
    }

    // kecmis uzvluk
    const oldMemberships = await OldSirketUsers.find({ user_id: user.id })
      .populate("sirket_id")
      .sort({ dismissal_date: -1 }); // LIFO

    // kohneni yeniye add edirik
    for (const oldMembership of oldMemberships) {
      if (oldMembership.sirket_id) {
        const membership = {
          _id: oldMembership.sirket_id._id,
          sirket_name: oldMembership.sirket_id.sirket_name,
          profile_image_path: oldMembership.sirket_id.profile_image_path,
          hire_date: formatDate(oldMembership.hire_date),
          status: "left",
        };
        memberships.push(membership);
      }
    }

    return res.status(200).json({
      success: true,
      data: memberships,
    });
  } catch (error) {
    console.error("Error in getUzvluk:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUzvlukDetails = async (req, res) => {
  try {
    const { sirket_id } = req.params;
    const user = req.user;

    const currentUser = await PeopleUser.findById(user);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let sirketData;
    let hire_date;
    let end_date = null;
    let isCurrentEmployee = false;

    // if still work at this sirket
    if (
      currentUser.sirket_id &&
      currentUser.sirket_id.toString() === sirket_id
    ) {
      isCurrentEmployee = true;
      sirketData = await Sirket.findById(sirket_id);
      hire_date = currentUser.hire_date;
    } else {
      // else oldMember
      const oldMembership = await OldSirketUsers.findOne({
        user_id: user.id,
        sirket_id: sirket_id,
      }).populate("sirket_id");

      if (!oldMembership) {
        return res.status(404).json({
          message: "You have no relationship with this company",
        });
      }

      sirketData = oldMembership.sirket_id;
      hire_date = oldMembership.hire_date;
      end_date = oldMembership.dismissal_date;
    }

    if (!sirketData) {
      return res.status(404).json({ message: "Company not found" });
    }

    const transactions = await TransactionsUser.find({
      from: user.id,
      from_sirket: sirket_id,
    }).populate({
      path: "to",
      select: "muessise_category",
    });

    const categoryGroups = {};
    let totalAmount = 0;

    transactions.forEach((transaction) => {
      if (transaction.to && transaction.to.muessise_category) {
        const category = transaction.to.muessise_category;

        if (!categoryGroups[category]) {
          categoryGroups[category] = {
            category: category,
            total: 0,
            count: 0,
          };
        }

        categoryGroups[category].total += transaction.amount;
        categoryGroups[category].count += 1;
        totalAmount += transaction.amount;
      }
    });

    const result = {
      name: sirketData.sirket_name,
      hire_date: formatDate(hire_date),
      end_date: end_date ? formatDate(end_date) : null,
      total: totalAmount,
      categories: Object.values(categoryGroups)
        .map((group) => ({
          name: group.category,
          total: group.total,
          count: group.count,
          percentage:
            totalAmount > 0 ? Math.round((group.total / totalAmount) * 100) : 0,
        }))
        .sort((a, b) => b.total - a.total), // sort
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in getUzvlukDetails:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { sirket_id } = req.params;
    const user = req.user;

    // İstifadəçinin mövcudluğunu yoxlayırıq
    const currentUser = await PeopleUser.findById(user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // İstifadəçinin bu şirkətdə işləyib-işləmədiyini yoxlayırıq
    if (
      !currentUser.sirket_id ||
      currentUser.sirket_id.toString() !== sirket_id
    ) {
      return res.status(400).json({
        success: false,
        message: "You are not currently employed at this company",
      });
    }

    // Artıq unsubscribe sorğusu var mı yoxlayırıq
    const existingRequest = await TempPeopleProfileChanges.findOne({
      user_id: user.id,
      request_unsubscribe: true,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Unsubscribe request already exists",
      });
    }

    // 6 rəqəmli OTP generasiya edirik
    const otp = generateOtp(6);

    // Yeni TempPeopleProfileChanges girişi yaradırıq
    const tempChange = new TempPeopleProfileChanges({
      user_id: user.id,
      request_unsubscribe: true,
      otp: otp,
      otp_type: "email",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 saat sonra silınəcək
    });

    await tempChange.save();

    // OtpModel-də yeni girış yaradırıq
    const otpRecord = new OtpModel({
      user_id: user.id,
      otp: otp,
      otp_to: "sirket",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 dəqiqə sonra silınəcək
    });

    await otpRecord.save();

    // Production mühitə görə debug rejimini təyin edirik
    const isProduction = process.env.NODE_ENV === "production";
    const debugMode = !isProduction;

    // Email göndəririk
    const emailSent = await sendMail(currentUser.email, otp, debugMode);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Unsubscribe request submitted successfully. Please check your email for OTP verification.",
    });
  } catch (error) {
    console.error("Error in unsubscribe:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
