import Invoice from "../../../shared/models/invoysSirketModel.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import AddCardBalance from "../../../shared/model/people/addBalances.js";
import AddedBalance from "../../../shared/model/people/addedBalances.js";

export const addInvoice = async (req, res) => {
  try {
    const { balance } = req.body;
    const userId = req.user._id || req.user.id;

    // Balance dəyərini yoxlayırıq
    if (!balance || balance <= 0) {
      return res.status(400).json({
        success: false,
        error: "Balance dəyəri minimum 0-dan böyük olmalıdır",
      });
    }

    // User-i tapırıq və sirket_id-ni populate edirik
    const user = await PeopleUser.findById(userId).populate("sirket_id");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "İstifadəçi tapılmadı",
      });
    }

    if (!user.sirket_id) {
      return res.status(400).json({
        success: false,
        message: "İstifadəçi heç bir şirkətə bağlı deyil",
      });
    }

    const sirket = user.sirket_id;

    // Commission hesablamaları
    const commissionPercentage = sirket.commission_percentage || 0;
    const commission = (balance * commissionPercentage) / 100;
    const totalBalance = Number(balance) + Number(commission);

    // Yeni invoice yaradırıq
    const newInvoice = new Invoice({
      balance: balance,
      total_balance: totalBalance,
      commission: commission,
      commission_percentage: commissionPercentage,
      sirket_id: sirket._id,
      user_id: userId,
      status: "active",
    });

    // Invoice-i save edirik
    const savedInvoice = await newInvoice.save();

    return res.status(201).json({
      success: true,
      message: "Invoice uğurla yaradıldı",
      data: {
        invoice_id: savedInvoice.invoice_id,
        balance: savedInvoice.balance,
        commission: savedInvoice.commission,
        commission_percentage: savedInvoice.commission_percentage,
        total_balance: savedInvoice.total_balance,
        status: savedInvoice.status,
        sirket_name: sirket.sirket_name,
        sirket_id: sirket.sirket_id,
      },
      redirect: "/hesablashmalar/datatable",
    });
  } catch (error) {
    console.error("addInvoice error:", error);
    return res.status(500).json({
      success: false,
      message: "Daxili server xətası",
      error: error.message,
    });
  }
};

export const editInvoice = async (req, res) => {
  const invoice_id = req.body.invoice;
  const rawBalance = req.body.balance;

  const balance = parseFloat(rawBalance.toString().replace(/[^\d.-]/g, ""));

  try {
    const userId = req.user.id;

    const user = await PeopleUser.findById(userId).populate("sirket_id");

    if (!user || !user.sirket_id) {
      return res.status(404).json({
        success: false,
        message: "İstifadəçi və ya şirkət tapılmadı",
      });
    }

    const invoice = await Invoice.findOne({
      invoice_id,
      status: { $in: ["reported", "active"] },
      user_id: userId,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice tapılmadı",
      });
    }

    const sirket = user.sirket_id;

    // Commission hesablamaları
    const commissionPercentage = sirket.commission_percentage || 0;
    const commission = (balance * commissionPercentage) / 100;
    const totalBalance = balance + commission;

    invoice.balance = balance;
    invoice.total_balance = totalBalance;
    invoice.commission = commission;
    invoice.commission_percentage = commissionPercentage;
    if (invoice.status === "reported") {
      invoice.status = "reported_sended_again";
    }

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: "Invoice uğurla yeniləndi",
      data: invoice,
    });
  } catch (err) {
    console.error("editInvoice error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const sendInvoice = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.user.id;

    const user = await PeopleUser.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "İstifadəçi tapılmadı",
      });
    }

    if (!user.sirket_id) {
      return res.status(400).json({
        success: false,
        message: "İstifadəçi heç bir şirkətə bağlı deyil",
      });
    }

    const addBalanceRecord = await AddCardBalance.findOne({
      _id: id,
      sirket_id: user.sirket_id,
      status: "active",
    });

    if (!addBalanceRecord) {
      return res.status(404).json({
        success: false,
        message: "Aktiv balans qeydi tapılmadı",
      });
    }

    addBalanceRecord.status = "waiting";
    await addBalanceRecord.save();

    return res.status(200).json({
      success: true,
      message: "Invoice uğurla göndərildi və status waiting-ə dəyişdirildi",
      data: {
        balance_id: addBalanceRecord.balance_id,
        _id: addBalanceRecord._id,
        total_balance: addBalanceRecord.total_balance,
        status: addBalanceRecord.status,
        sirket_id: addBalanceRecord.sirket_id,
      },
    });
  } catch (error) {
    console.error("sendInvoice error:", error);
    return res.status(500).json({
      success: false,
      message: "Daxili server xətası",
      error: error.message,
    });
  }
};

export const acceptDeleteInvoice = async (req, res) => {
  try {
    const { id, otp } = req.body;

    if (!id || !otp) {
      return res.status(400).json({
        success: false,
        message: "ID və OTP parametrləri tələb olunur",
      });
    }

    const addBalanceRecord = await AddCardBalance.findById(id);

    if (!addBalanceRecord) {
      return res.status(404).json({
        success: false,
        message: "Balans qeydi tapılmadı",
      });
    }

    if (!addBalanceRecord.otp || !addBalanceRecord.otp.code) {
      return res.status(400).json({
        success: false,
        message: "OTP kodu mövcud deyil",
      });
    }

    if (addBalanceRecord.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "OTP kodu yanlışdır",
      });
    }

    const currentTime = new Date();
    const otpCreatedTime = new Date(addBalanceRecord.otp.createdAt);
    const timeDifferenceInMinutes =
      (currentTime - otpCreatedTime) / (1000 * 60);

    if (timeDifferenceInMinutes > 5) {
      return res.status(400).json({
        success: false,
        message: "OTP kodunun vaxtı keçib (5 dəqiqədən çox)",
      });
    }

    await AddedBalance.deleteMany({ balance_id: id });

    await AddCardBalance.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Invoice və əlaqəli balans qeydləri uğurla silindi",
    });
  } catch (error) {
    console.error("acceptDeleteInvoice error:", error);
    return res.status(500).json({
      success: false,
      message: "Daxili server xətası",
      error: error.message,
    });
  }
};

// Invoice təsdiqləmə funksiyası
export const approveInvoice = async (req, res) => {
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

    // Query by balance_id instead of _id
    const invoice = await AddCardBalance.findOne({
      _id: id,
      sirket_id: currentUser.sirket_id,
      status: { $in: ["active", "reported"] },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message:
          "Invoice tapılmadı və ya təsdiqləmək üçün uyğun statusda deyil",
      });
    }

    // Update using the actual MongoDB _id and correct status value
    await AddCardBalance.findByIdAndUpdate(invoice._id, {
      $set: {
        status: "complated", // Use 'complated' as defined in your schema enum
      },
    });

    return res.status(200).json({
      success: true,
      message: "Invoice uğurla təsdiqləndi",
    });
  } catch (error) {
    console.error("approveInvoice error:", error);
    return res.status(500).json({
      success: false,
      message: "Daxili server xətası",
      error: error.message,
    });
  }
};
