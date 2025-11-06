﻿import mongoose from "mongoose";
import { validationResult } from "express-validator";
import TransactionsUser from "../../../shared/models/transactionsModel.js";
import { generateQrImage } from "../../../shared/utils/GenareteQrImage.js";
import QrCode from "../../../shared/models/qrCodeModel.js";
import PartnerUser from "../../../shared/models/partnyorUserModel.js";
import Hesablasma from "../../../shared/model/partner/Hesablasma.js";

export const cancelQr = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => error.msg);
    return res.status(400).json({ error: formattedErrors[0] });
  }

  const { code } = req.body;
  const userId = new mongoose.Types.ObjectId(req.user);

  try {
    const qrCode = await QrCode.findOne({ code, creator_id: userId });
    if (!qrCode) {
      return res.status(404).json({ message: "QR kod tapılmadı" });
    }

    if (qrCode.status !== 0) {
      return res
        .status(400)
        .json({ message: "Yalnız pending QR kodlar ləğv edilə bilər" });
    }

    qrCode.status = 2;
    // qrCode.read_time = new Date();
    await qrCode.save();

    if (qrCode.transaction_id) {
      await TransactionsUser.findByIdAndUpdate(qrCode.transaction_id, {
        status: "failed",
      });
    }
    return res
      .status(200)
      .json({ status: "canceled", message: "QR kod ləğv edildi" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Daxili server xətası" });
  }
};

export const generateQr = async (req, res) => {
  try {
    console.log("generateQr called");
    const { price } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user);
    // check if user is logged in
    const currentUser = await PartnerUser.findById(req.user)
      .populate("muessise_id")
      .exec();
    if (!currentUser || !currentUser.muessise_id) {
      return res
        .status(403)
        .json({ success: false, message: "Müəssisə tapılmadı" });
    }

    if (price === undefined || price === null || price === "" || isNaN(price)) {
      return res.status(400).json({
        message: "Price is required and must be a valid number.",
      });
    }

    const newTransaction = await TransactionsUser.create({
      from: null,
      to: currentUser.muessise_id,
      user: userId,
      note: "",
      currency: "AZN",
      destination: "Internal",
      amount: price,
      subject: "Kapital",
      comission: currentUser.muessise_id?.komissiya ?? 0,
      status: "pending",
      cards: null,
      cardCategory: null,
      toPartnerId: null,
    });

    await createHesablashma(newTransaction, currentUser.muessise_id);

    const expire_time = new Date(Date.now() + 5 * 60 * 1000); // 5 dakika
    const newQr = await QrCode.create({
      price,
      status: 0,
      expire_time: expire_time,
      transaction_id: newTransaction._id,
      reader_id: null,
      creator_id: userId,
      muessise_id: currentUser.muessise_id,
    });

    const code = newQr.code;

    const qr_image_url = await generateQrImage(code);

    if (!qr_image_url) {
      return res
        .status(500)
        .json({ error: error.msg || "Failed to generate QR code image." });
    }

    return res.status(201).json({
      code,
      qr_image_url,
      expire_time: newQr.expire_time,
      createdAt: newQr.createdAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to generate QR code image",
    });
  }
};

export const checkQrStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => err.msg);
    return res.status(400).json({ error: formattedErrors[0] });
  }

  const code = req.body.code;
  const user_id = new mongoose.Types.ObjectId(req.user);

  if (!code) {
    return res.status(400).json({ message: "Code is required" });
  }

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const qrCode = await QrCode.findOne({
      code,
      creator_id: user_id,
    });

    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found!" });
    }

    const status = qrCode.status;

    switch (status) {
      case 0:
        return res.status(200).json({
          status: "pending",
          expire_time: qrCode.expire_time,
          createdAt: qrCode.createdAt,
        });

      case 1:
        const populatedQr = await QrCode.findOne({
          code,
          creator_id: user_id,
        }).populate("transaction_id");

        if (populatedQr.transaction_id) {
          await TransactionsUser.findByIdAndUpdate(
            populatedQr.transaction_id._id,
            { status: "success" }
          );
        }

        return res.status(200).json({
          status: "success",
          transaction: populatedQr.transaction_id || null,
          expire_time: populatedQr.expire_time,
          createdAt: populatedQr.createdAt,
        });

      case 2:
        return res.status(200).json({
          status: "canceled",
          expire_time: qrCode.expire_time,
          createdAt: qrCode.createdAt,
        });

      default:
        return res.status(400).json({ message: "Unknown status value" });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error!",
      error: error.message,
    });
  }
};

const createHesablashma = async (transaction, muessiseId) => {
  try {
    const now = new Date();
    const day = now.getDate();

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthMid = new Date(now.getFullYear(), now.getMonth(), 16);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    let dateRangeStart, dateRangeEnd;
    if (day <= 15) {
      dateRangeStart = monthStart;
      dateRangeEnd = monthMid;
    } else {
      dateRangeStart = monthMid;
      dateRangeEnd = new Date(
        monthEnd.getFullYear(),
        monthEnd.getMonth(),
        monthEnd.getDate() + 1
      );
    }

    let existingHesab = await Hesablasma.findOne({
      muessise_id: muessiseId,
      createdAt: { $gte: dateRangeStart, $lt: dateRangeEnd },
    });

    if (!existingHesab) {
      existingHesab = await Hesablasma.create({
        sender: muessiseId,
        muessise_id: muessiseId,
        status: "qaralama",
        from_date: dateRangeStart,
        end_date: dateRangeEnd,
      });
    }

    transaction.hesablasma_id = existingHesab._id;
    await transaction.save();

    return existingHesab;
  } catch (error) {
    console.error("createHesablashma error:", error);
    throw error;
  }
};
