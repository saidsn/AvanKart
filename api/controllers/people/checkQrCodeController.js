import QrCode from "../../../shared/models/qrCodeModel.js";
import sendPeopleNotification from "../../firebase/people/sendNotification.js";
import PartnerUser from "../../../shared/models/partnyorUserModel.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import PeopleCardBalance from "../../../shared/model/people/cardBalances.js";
import TransactionsUser from "../../../shared/models/transactionsModel.js";
import Sirket from "../../../shared/models/sirketModel.js";
import CashbackFolder from "../../../shared/models/cashbackFolder.js";
import CashBack from "../../../shared/models/cashBackModel.js";
import NotificationModel from "../../../shared/models/notificationModel.js";
import EQaime from "../../../shared/models/eQaimeModel.js";
import Muessise from "../../../shared/models/muessiseModel.js";

const isDev = process.env.NODE_ENV === "development";
const formatQrCode = (qrCode) => qrCode.replace(/-/g, "");

export const checkQrCode = async (req, res) => {
  try {
    const { card_id, qr_code } = req.body;

    const targetQrCode = await QrCode.findOne({ code: qr_code })
      .sort({ createdAt: -1 })
      .populate("muessise_id transaction_id");

    if (!targetQrCode) {
      return res
        .status(404)
        .json({ success: false, message: "QR code not found" });
    }

    // 2️⃣ İstifadəçi
    const partnerUser = await PeopleUser.findById(req.user);
    if (!partnerUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const cardOfCustomer = await PeopleCardBalance.findOne({
      _id: card_id,
      user_id: partnerUser._id,
    });

    if (!cardOfCustomer) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    const qrCreatorSirket = await Muessise.findById(targetQrCode.muessise_id._id);
    if (!qrCreatorSirket) {
      return res.status(404).json({
        success: false,
        message: "QR code creator company not found",
      });
    }

    const isCardAcceptedByMerchant =
      qrCreatorSirket.cards &&
      qrCreatorSirket.cards.some(
        (card) => card?.toString() === cardOfCustomer.card_id?.toString()
      );

    if (!isCardAcceptedByMerchant) {
      return res.status(400).json({
        success: false,
        message: "Bu kartla bu müəssisədə ödəniş etmək mümkün deyil",
      });
    }

    const updatedCard = await PeopleCardBalance.findOneAndUpdate(
      {
        _id: card_id,
        user_id: partnerUser._id,
        balance: { $gte: targetQrCode.price },
      },
      { $inc: { balance: -targetQrCode.price } },
      { new: true }
    );
    if (!updatedCard)
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });

    const now = new Date(); // Bakı saatına uyğun server vaxtı
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    await PartnerUser.findByIdAndUpdate(
      partnerUser._id,
      [
        {
          $set: {
            last_qr_code: now,
            today_qr_codes: {
              $cond: [
                { $lt: ["$last_qr_code", startOfToday] },
                1,
                { $add: ["$today_qr_codes", 1] },
              ],
            },
            total_qr_codes: { $add: ["$total_qr_codes", 1] },
          },
        },
      ],
      { new: true }
    );

    // 5️⃣ Response
    const formattedQrCode = formatQrCode(qr_code);

    const responseData = {
      qr_code_id: targetQrCode._id,
      muessise_name: targetQrCode.muessise_id?.muessise_name || null,
      sirket_name: targetQrCode.muessise_id?.sirket_name || null,
      amount: targetQrCode.price || null,
      transaction_id: targetQrCode.transaction_id?._id || null,
      qr_status: targetQrCode.status,
      card_name: updatedCard.card_id?.name || null,
      card_balance: updatedCard.balance,
      timestamp: now,
      user_sirket_id: partnerUser?.sirket_id || null,
      qr_code: formattedQrCode,
      expire_time: targetQrCode.expire_time,
    };

    return res.status(200).json({
      success: true,
      message: "QR code checked successfully",
      data: responseData,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

export const checkQrCodeStatus = async (req, res) => {
  const { qr_code_id, card_id, lat, lng = null } = req.body;
  console.log('oxundu qr indi')
  try {
    const qrCode = await QrCode.findOneAndUpdate(
      { _id: qr_code_id, status: 0 }
    );

    if (!qrCode){
      return res
        .status(400)
        .json({ success: false, message: "QR code already used" });
    }

    const user = await PeopleUser.findById(req.user).populate("sirket_id");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const sirket = await Sirket.findById(user.sirket_id);
    if (!sirket)
      return res
        .status(404)
        .json({ success: false, message: "Sirket not found" });

    const transaction = await TransactionsUser.findById(qrCode.transaction_id);
    if (!transaction)
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });

    const updatedCard = await PeopleCardBalance.findOneAndUpdate(
      { _id: card_id, balance: { $gte: transaction.amount } },
      { $inc: { balance: -transaction.amount } },
      { new: true }
    );
    if (!updatedCard)
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });

    transaction.status = "success";
    transaction.from = req.user;
    transaction.from_sirket = user.sirket_id._id;
    transaction.lat = lat;
    transaction.lng = lng;
    await transaction.save();

    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const partnerUser = await PartnerUser.findByIdAndUpdate(
      transaction.user,
      [
        {
          $set: {
            last_qr_code: today,
            today_qr_codes: {
              $cond: [
                { $lt: ["$last_qr_code", startOfToday] },
                1, // sıfırla və 1 əlavə et
                { $add: ["$today_qr_codes", 1] },
              ],
            },
            total_qr_codes: { $add: ["$total_qr_codes", 1] },
          },
        },
      ],
      { new: true }
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    let qaimeFolder = await EQaime.findOne({
      start_date: { $gte: startOfMonth, $lte: endOfMonth },
      status: "active",
    });

    if (!qaimeFolder) {
      qaimeFolder = await EQaime.create({
        qaime_total: transaction.amount,
        start_date: startOfMonth,
        end_date: endOfMonth,
        month: now.toLocaleString("en-US", { month: "long" }),
        status: "active",
        sirket_id: sirket._id,
        cards: [{ card_id, balance: transaction.amount }]
      });
    } else {
      qaimeFolder.qaime_total += transaction.amount;
      const existingCard = qaimeFolder.cards.find(
        (c) => c.card_id.toString() === card_id.toString()
      );
      if (existingCard) {
        existingCard.balance += transaction.amount;
      } else {
        qaimeFolder.cards.push({ card_id, balance: transaction.amount });
      }
      await qaimeFolder.save();
    }

    const transactionPercentageExcludedAmount =
      (transaction.amount * transaction.comission) / 100;
    const cashbackPercentageExcludedAmount =
      (transactionPercentageExcludedAmount * sirket.cashback_percentage) / 100;

    const cashbackValid =
      typeof sirket.cashback_percentage === "number" &&
      sirket.cashback_percentage > 0 &&
      typeof transaction.comission === "number" &&
      transaction.comission > 0;

    let cashbackAmount = 0;
    let cashbackApplied = false;

    if (cashbackValid && cashbackPercentageExcludedAmount > 0) {
      let cashbackFolder = await CashbackFolder.findOne({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });
      if (!cashbackFolder)
        cashbackFolder = await CashbackFolder.create({ total: 0 });

      await CashBack.create({
        user_id: req.user,
        folder_id: cashbackFolder._id,
        sirket_id: sirket._id,
        transaction_id: transaction._id,
        card_id: updatedCard._id,
        from_amount: transactionPercentageExcludedAmount,
        cashback: cashbackPercentageExcludedAmount,
      });

      cashbackFolder.total += cashbackPercentageExcludedAmount;
      await cashbackFolder.save();

      updatedCard.balance += cashbackPercentageExcludedAmount;
      updatedCard.lastPayment = new Date();
      updatedCard.updatedBy = req.user;
      await updatedCard.save();

      cashbackAmount = cashbackPercentageExcludedAmount;
      cashbackApplied = true;
    }

    if (qrCode.creator_id?.firebase_token) {
      await sendPeopleNotification({
        title: "QrCode oxundu",
        body: "Sizin QrCode uğurla oxundu və ödəniş tamamlandı.",
        data: { type: "qrcode", qr_code: qrCode.code || qrCode._id.toString() },
        tokens: [qrCode.creator_id.firebase_token],
      });
    }
    qrCode.status = 1;
    await qrCode.save();

    return res.status(200).json({
      success: true,
      message: "QR ödənişi uğurla tamamlandı",
      transaction_id: transaction._id,
      payment_date: transaction.createdAt,
      payment_receiver_muessise:
        sirket.muessise_name || user.sirket_id.muessise_name,
      cashback_applied: cashbackApplied,
      cashback_amount: cashbackAmount,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: err.message,
    });
  }
};
