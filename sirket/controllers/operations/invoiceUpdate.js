import PeopleUser from "../../../shared/models/peopleUserModel.js";
import AddCardBalance from "../../../shared/model/people/addBalances.js";
import { sendMail } from "../../../shared/utils/otpHandler.js";

export const invoiceDelete = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID tələb olunur",
      });
    }

    const currentUser = await PeopleUser.findById(req.user.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "İstifadəçi tapılmadı",
      });
    }

    if (!currentUser.sirket_id) {
      return res.status(400).json({
        success: false,
        message: "Şirkət məlumatı tapılmadı",
      });
    }

    const invoice = await AddCardBalance.findOne({
      _id: id,
      sirket_id: currentUser.sirket_id,
      status: { $in: ["active", "reported"] },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice tapılmadı və ya silmək üçün uyğun statusda deyil",
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000);

    const emailSubject = "Invoice Silmək üçün OTP Kodu";
    const emailText = `
    Salam ${currentUser.name || currentUser.email},
    
    Invoice silmək üçün OTP kodunuz: ${otpCode}
    
    Bu kod 10 dəqiqə ərzində keçərlidir.
    
    Təşəkkür edirik.
    `;

    try {
      await sendMail(currentUser.email, emailSubject, emailText);
    } catch (emailError) {
      return res.status(500).json({
        success: false,
        message: "Email göndərilmədi, yenidən cəhd edin",
      });
    }

    await AddCardBalance.findByIdAndUpdate(id, {
      $set: {
        "otp.code": otpCode,
        "otp.createdAt": otpExpireTime,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Invoice silmək üçün OTP kodu email ünvanınıza göndərildi",
      otpRequired: true,
      resendUrl: "/resend-otp",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server xətası baş verdi",
    });
  }
};

// Invoice silinməsini OTP ilə təsdiqləyən controller
export const acceptDeleteInvoice = async (req, res) => {
  try {
    const { id, otp } = req.body;
    if (!id || !otp) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID və OTP tələb olunur",
      });
    }

    const currentUser = await PeopleUser.findById(req.user.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "İstifadəçi tapılmadı",
      });
    }

    if (!currentUser.sirket_id) {
      return res.status(400).json({
        success: false,
        message: "Şirkət məlumatı tapılmadı",
      });
    }

    const invoice = await AddCardBalance.findOne({
      _id: id,
      sirket_id: currentUser.sirket_id,
      status: { $in: ["active", "reported"] },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice tapılmadı və ya silmək üçün uyğun statusda deyil",
      });
    }

    console.log("Otp: ", otp);
    // OTP yoxlanışı
    if (!invoice.otp || invoice.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "OTP kodu yanlışdır",
      });
    }
    if (invoice.otp.createdAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP kodunun vaxtı bitib",
      });
    }

    // Invoice statusunu 'deleted' et
    await AddCardBalance.findByIdAndUpdate(id, {
      $set: {
        status: "deleted",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Invoice uğurla silindi",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server xətası baş verdi",
    });
  }
};
