import mongoose from "mongoose";
import AddCardBalance from "../../../shared/model/people/addBalances.js";
import AddedBalance from "../../../shared/model/people/addedBalances.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import RbacPeoplePermission from "../../../shared/models/rbacPeopleModel.js";
import { generateOtp, sendMail } from "../../../shared/utils/otpHandler.js";
import Sirket from "../../../shared/models/sirketModel.js";
import SirketDuty from "../../../shared/models/Sirketduties.js";
import ImtiyazQruplari from "../../../shared/model/people/imtiyazQruplari.js";

export const balanceOperationsTemp = async (req, res) => {
  try {
    const { main_values = {}, exceptions = {}, hidden = {} } = req.body || {};

    // Cari istifadəçi (əməliyyatı edən şəxs)
    const me = await PeopleUser.findById(req.user?.id)
      .select("_id email sirket_id")
      .populate("sirket_id", "_id sirket_balance");
    
    if (!me?.sirket_id) {
      return res
        .status(404)
        .json({ success: false, message: "Sirket tapilmadi" });
    }
    
    const sirketId = me.sirket_id._id || me.sirket_id;
    const sirketBalance = Number(me.sirket_id?.sirket_balance ?? 0);

    // Data yoxlama
    const mainHasAny =
      main_values &&
      Object.keys(main_values).some((pid) => {
        const obj = main_values[pid] || {};
        return Object.values(obj).some((v) => Number(v) > 0);
      });
    
    const exceptionsHasAny =
      exceptions &&
      Object.keys(exceptions).some((pid) => {
        const uobj = exceptions[pid] || {};
        return Object.values(uobj).some((cards) =>
          Object.values(cards || {}).some((v) => Number(v) > 0)
        );
      });

    if (!mainHasAny && !exceptionsHasAny) {
      return res
        .status(400)
        .json({ success: false, message: "Bos data insert olmaz" });
    }

    // İmtiyaz qruplarını yoxla
    const permSet = new Set([
      ...Object.keys(main_values || {}),
      ...Object.keys(exceptions || {}),
    ]);

    if (permSet.size) {
      const perms = await ImtiyazQruplari.find({
        _id: { $in: Array.from(permSet) },
        sirket_id: sirketId,
      }).select("_id");
      
      const validPermIds = new Set(perms.map((p) => String(p._id)));
      for (const pid of Array.from(permSet)) {
        if (!validPermIds.has(String(pid))) permSet.delete(pid);
      }
    }

    // User -> Card -> Amount mapping
    const userCardMap = new Map(); // userId -> Map(cardId -> amount)
    const cardUsageCounter = new Map(); // cardId -> Set(userIds)
    const userPermMap = new Map(); // userId -> permId (imtiyaz_id üçün)

    for (const permId of permSet) {
      const usersOfPerm = await PeopleUser.find({
        imtiyaz: permId,
        sirket_id: sirketId,
      })
        .select("_id totalBalance")
        .lean();

      if (!usersOfPerm.length) continue;

      // Hidden users
      const hiddenUsersObj = hidden?.[permId] || {};
      const hiddenUserIds = new Set(
        Object.entries(hiddenUsersObj)
          .filter(([_, v]) => !!v)
          .map(([uid]) => String(uid))
      );

      // Exception data: exceptions[permId][userId][cardId] = amount
      const permExceptions = exceptions?.[permId] || {};

      // Main values: main_values[permId][cardId] = amount
      const permMainValues = main_values?.[permId] || {};
      const cleanedMainValues = Object.fromEntries(
        Object.entries(permMainValues)
          .map(([cid, val]) => [cid, Number(val)])
          .filter(([_, v]) => Number.isFinite(v) && v > 0)
      );

      for (const u of usersOfPerm) {
        const userId = String(u._id);

        if (hiddenUserIds.has(userId)) continue;

        const perUserCards = new Map();

        // Əgər bu user üçün exception varsa
        const excForUser = permExceptions?.[userId];
        if (excForUser) {
          for (const [cardId, raw] of Object.entries(excForUser || {})) {
            const val = Number(raw);
            if (Number.isFinite(val) && val > 0) {
              perUserCards.set(String(cardId), val);
            }
          }
        }

        // Exception olmayan cardları main_values-dan götür
        for (const [cardId, val] of Object.entries(cleanedMainValues)) {
          if (!excForUser || excForUser[cardId] === undefined) {
            perUserCards.set(String(cardId), Number(val));
          }
        }

        if (perUserCards.size === 0) continue;

        // User-ə card təyin et
        if (!userCardMap.has(userId)) userCardMap.set(userId, new Map());
        const userMap = userCardMap.get(userId);
        
        for (const [cardId, val] of perUserCards.entries()) {
          userMap.set(cardId, val);

          if (!cardUsageCounter.has(cardId))
            cardUsageCounter.set(cardId, new Set());
          cardUsageCounter.get(cardId).add(userId);
        }

        // İmtiyaz qrupunu saxla (modelə əlavə etmək üçün)
        userPermMap.set(userId, permId);
      }
    }

    // Toplam məbləği hesabla
    let grandTotal = 0;
    const perCardTotals = new Map();

    for (const [, cardsMap] of userCardMap.entries()) {
      for (const [cardId, val] of cardsMap.entries()) {
        grandTotal += val;
        perCardTotals.set(cardId, (perCardTotals.get(cardId) || 0) + val);
      }
    }

    if (grandTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Məbləğ daxil edin",
      });
    }

    if (!(sirketBalance > 0) || grandTotal > sirketBalance) {
      return res.status(400).json({
        success: false,
        message: "Şirkət balansı yetərsizdir.",
        need: grandTotal,
        have: sirketBalance,
      });
    }

    // MANUAL ROLLBACK
    let addBalanceDoc = null;
    let writePhaseOk = false;

    try {
      // Əsas əməliyyat sənədi (bunu əməliyyatı edən şəxs yaradır)
      addBalanceDoc = await AddCardBalance.create({
        user_id: me._id,  // Əməliyyatı yaradan (admin/operator)
        sirket_id: sirketId,
        total_balance: grandTotal,
        cards: [],
        updatedBy: me._id,
        refModel: "PeopleUser",
        status: "active",
      });

      // Bütün userlərin cari balanslarını götür
      const allUserIds = Array.from(userCardMap.keys());
      const userBalances = await PeopleUser.find({ 
        _id: { $in: allUserIds } 
      })
        .select("_id totalBalance")
        .lean();

      const balanceByUser = new Map(
        userBalances.map((u) => [String(u._id), Number(u.totalBalance ?? 0)])
      );

      // Bulk insert üçün data hazırla
      const bulk = [];
      for (const [userId, cardsMap] of userCardMap.entries()) {
        const lastBalance = balanceByUser.get(userId) ?? 0;
        
        for (const [cardId, addVal] of cardsMap.entries()) {
          const added_balance = Number(addVal);
          const total_balance = Number(lastBalance) + added_balance;

          bulk.push({
            user_id: userId,  // Balansı alan user (DÜZƏLDILDI)
            balance_id: addBalanceDoc._id,
            sirket_id: sirketId,
            card_id: cardId,
            imtiyaz_id: userPermMap.get(userId), // İmtiyaz qrupu əlavə edildi
            
            added_balance,
            last_balance: Number(lastBalance),
            total_balance,
            
            updatedBy: me._id,  // Əməliyyatı edən şəxs
            refModel: "PeopleUser",
            status: "active",
          });
        }
      }

      if (bulk.length) {
        await AddedBalance.insertMany(bulk, { ordered: true });
      }

      // Card metadata-nı yenilə
      const cardsMeta = Array.from(cardUsageCounter.entries()).map(
        ([cardId, usersSet]) => ({
          card_id: cardId,
          count: usersSet.size,
        })
      );

      await AddCardBalance.updateOne(
        { _id: addBalanceDoc._id },
        { $set: { cards: cardsMeta } }
      );

      writePhaseOk = true;
    } catch (writeErr) {
      // Rollback
      try {
        if (addBalanceDoc?._id) {
          await AddedBalance.deleteMany({ balance_id: addBalanceDoc._id });
          await AddCardBalance.deleteOne({ _id: addBalanceDoc._id });
        }
      } catch (rbErr) {
        console.error("manual rollback failed:", rbErr);
      }
      throw writeErr;
    }

    // OTP göndər
    try {
      if (writePhaseOk && addBalanceDoc?._id) {
        const code = generateOtp();
        const emailTo = me.email;
        if (emailTo) {
          await sendMail(emailTo, code);
        }
        await AddCardBalance.updateOne(
          { _id: addBalanceDoc._id },
          { $set: { otp: { code, createdAt: new Date() } } }
        );
      }
    } catch (otpErr) {
      console.error("OTP/sendMail error:", otpErr?.message || otpErr);
    }

    return res.status(201).json({
      success: true,
      message: "Balans elave emeliyyati yaradildi",
      otpRequired: true,
      resendUrl: "/resend-otp",
      data: {
        balance_id: addBalanceDoc?.balance_id,
        doc_id: String(addBalanceDoc?._id || ""),
        total: grandTotal,
        per_card_totals: Object.fromEntries(perCardTotals),
        cards_usage: Array.from(cardUsageCounter.entries()).reduce(
          (acc, [cid, set]) => {
            acc[cid] = set.size;
            return acc;
          },
          {}
        ),
      },
    });
  } catch (err) {
    console.error("balanceOperationsTemp error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server xetasi", error: err?.message });
  }
};

export const editBalanceThis = async (req, res) => {
  try {
    const {
      balance_id,
      main_values = {},
      exceptions = {},
      hidden = {},
    } = req.body || {};
    if (!balance_id || typeof balance_id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "balance_id lazimdir" });
    }

    const me = await PeopleUser.findById(req.user?.id)
      .select("_id email sirket_id")
      .populate("sirket_id", "_id sirket_balance");
    if (!me?.sirket_id) {
      return res
        .status(404)
        .json({ success: false, message: "Sirket tapilmadi" });
    }
    const sirketId = me.sirket_id._id || me.sirket_id;
    const sirketBalance = Number(me.sirket_id?.sirket_balance ?? 0);

    const addBalanceDoc = await AddCardBalance.findOne({
      balance_id,
      sirket_id: sirketId,
    });
    if (!addBalanceDoc?._id) {
      return res
        .status(404)
        .json({ success: false, message: "Balance emeliyyati tapilmadi" });
    }

    const mainHasAny =
      main_values &&
      Object.keys(main_values).some((pid) => {
        const obj = main_values[pid] || {};
        return Object.values(obj).some((v) => Number(v) > 0);
      });
    const exceptionsHasAny =
      exceptions &&
      Object.keys(exceptions).some((pid) => {
        const uobj = exceptions[pid] || {};
        return Object.values(uobj).some((cards) =>
          Object.values(cards || {}).some((v) => Number(v) > 0)
        );
      });

    if (!mainHasAny && !exceptionsHasAny) {
      return res
        .status(400)
        .json({ success: false, message: "Davam etmək üçün dəyər daxil edin" });
    }

    //  Paylanma qurulması (create ilə eyni məntiq)
    const userCardMap = new Map();
    const cardUsageCounter = new Map();

    const permSet = new Set([
      ...Object.keys(main_values || {}),
      ...Object.keys(exceptions || {}),
    ]);

    if (permSet.size) {
      const perms = await ImtiyazQruplari.find({
        _id: { $in: Array.from(permSet) },
        sirket_id: sirketId,
      }).select("_id");
      const validPermIds = new Set(perms.map((p) => String(p._id)));
      for (const pid of Array.from(permSet)) {
        if (!validPermIds.has(String(pid))) permSet.delete(pid);
      }
    }

    for (const permId of permSet) {
      const usersOfPerm = await PeopleUser.find({
        imtiyaz: permId,
        sirket_id: sirketId,
      })
        .select("_id totalBalance")
        .lean();

      if (!usersOfPerm.length) continue;

      const hiddenUsersObj = hidden?.[permId] || {};
      const hiddenUserIds = new Set(
        Object.entries(hiddenUsersObj)
          .filter(([_, v]) => !!v)
          .map(([uid]) => String(uid))
      );

      const permExceptions = exceptions?.[permId] || {};

      const permMainValues = main_values?.[permId] || {};
      const cleanedMainValues = Object.fromEntries(
        Object.entries(permMainValues)
          .map(([cid, val]) => [cid, Number(val)])
          .filter(([_, v]) => Number.isFinite(v) && v > 0)
      );

      for (const u of usersOfPerm) {
        const userId = String(u._id);
        if (hiddenUserIds.has(userId)) continue;

        const perUserCards = new Map();

        const excForUser = permExceptions?.[userId];
        if (excForUser) {
          for (const [cardId, raw] of Object.entries(excForUser || {})) {
            const val = Number(raw);
            if (Number.isFinite(val) && val > 0) {
              perUserCards.set(String(cardId), val);
            }
          }
        }

        for (const [cardId, val] of Object.entries(cleanedMainValues)) {
          if (!excForUser || excForUser[cardId] === undefined) {
            perUserCards.set(String(cardId), Number(val));
          }
        }

        if (perUserCards.size === 0) continue;

        if (!userCardMap.has(userId)) userCardMap.set(userId, new Map());
        const userMap = userCardMap.get(userId);
        for (const [cardId, val] of perUserCards.entries()) {
          userMap.set(cardId, val);

          if (!cardUsageCounter.has(cardId))
            cardUsageCounter.set(cardId, new Set());
          cardUsageCounter.get(cardId).add(userId);
        }
      }
    }

    //  Toplamların hesablanması
    let grandTotal = 0;
    const perCardTotals = new Map();
    for (const [, cardsMap] of userCardMap.entries()) {
      for (const [cardId, val] of cardsMap.entries()) {
        grandTotal += val;
        perCardTotals.set(cardId, (perCardTotals.get(cardId) || 0) + val);
      }
    }

    if (grandTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Mebleg yoxdur (hamisi 0/NaN veya gecerli kullanici yok)",
      });
    }

    if (!(sirketBalance > 0) || grandTotal > sirketBalance) {
      return res.status(400).json({
        success: false,
        message: "Sirket balansi yetersizdir — emeliyyat legv edildi",
        need: grandTotal,
        have: sirketBalance,
      });
    }

    //    Uğursuz olarsa köhnəni geri bərpa etməyə cəhd et (manual rollback).
    const prevAdded = await AddedBalance.find({
      balance_id: addBalanceDoc._id,
    }).lean();

    const allUserIds = Array.from(userCardMap.keys());
    const userBalances = await PeopleUser.find({ _id: { $in: allUserIds } })
      .select("_id totalBalance")
      .lean();
    const balanceByUser = new Map(
      userBalances.map((u) => [String(u._id), Number(u.totalBalance ?? 0)])
    );

    const bulk = [];
    for (const [userId, cardsMap] of userCardMap.entries()) {
      const lastBalance = balanceByUser.get(userId) ?? 0;
      for (const [cardId, addVal] of cardsMap.entries()) {
        const added_balance = Number(addVal);
        const total_balance = Number(lastBalance) + added_balance;

        bulk.push({
          user_id: userId,
          balance_id: addBalanceDoc._id,
          sirket_id: sirketId,
          card_id: cardId,

          added_balance,
          last_balance: Number(lastBalance),
          total_balance,
          updatedBy: me._id,
          refModel: "PeopleUser",
          status: "active",
        });
      }
    }

    try {
      await AddedBalance.deleteMany({ balance_id: addBalanceDoc._id });

      if (bulk.length) {
        await AddedBalance.insertMany(bulk, { ordered: true });
      }

      const cardsMeta = Array.from(cardUsageCounter.entries()).map(
        ([cardId, usersSet]) => ({
          card_id: cardId,
          count: usersSet.size,
        })
      );

      await AddCardBalance.updateOne(
        { _id: addBalanceDoc._id },
        {
          $set: {
            total_balance: grandTotal,
            cards: cardsMeta,
            updatedBy: me._id,
            refModel: "PeopleUser",
          },
        }
      );
    } catch (writeErr) {
      try {
        await AddedBalance.deleteMany({ balance_id: addBalanceDoc._id });
        if (prevAdded?.length) {
          const restoreDocs = prevAdded.map(({ _id, ...rest }) => rest);
          await AddedBalance.insertMany(restoreDocs, { ordered: true });
        }
      } catch (rbErr) {
        console.error("editBalanceOperation rollback failed:", rbErr);
      }
      console.error("editBalanceOperation write error:", writeErr);
      return res.status(500).json({
        success: false,
        message: "Server xetasi",
        error: writeErr?.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Balans edit emeliyyati tamamlandi",
      data: {
        balance_id: addBalanceDoc.balance_id,
        doc_id: String(addBalanceDoc._id),
        total: grandTotal,
        per_card_totals: Object.fromEntries(perCardTotals),
        cards_usage: Array.from(cardUsageCounter.entries()).reduce(
          (acc, [cid, set]) => {
            acc[cid] = set.size;
            return acc;
          },
          {}
        ),
      },
    });
  } catch (err) {
    console.error("editBalanceOperation error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server xetasi", error: err?.message });
  }
};

export const editBalanceOperation = async (req, res) => {
  try {
    const { balance_id, main_values = {}, exceptions = {}, hidden = {} } = req.body || {};

    // Cari istifadəçi (əməliyyatı edən şəxs)
    const me = await PeopleUser.findById(req.user?.id)
      .select("_id email sirket_id")
      .populate("sirket_id", "_id sirket_balance");
    if (!me?.sirket_id) {
      return res
        .status(404)
        .json({ success: false, message: "Sirket tapilmadi" });
    }
    if (!balance_id) {
      return res
        .status(404)
        .json({ success: false, message: "Balance tapilmadi" });
    }
    const balance = await AddCardBalance.findOne({sirket_id:me?.sirket_id, balance_id});
    if(!balance){
      return res
        .status(404)
        .json({ success: false, message: "Balance tapilmadi" });
    }
    
    const sirketId = me.sirket_id._id || me.sirket_id;
    const sirketBalance = Number(me.sirket_id?.sirket_balance ?? 0);

    // Data yoxlama
    const mainHasAny =
      main_values &&
      Object.keys(main_values).some((pid) => {
        const obj = main_values[pid] || {};
        return Object.values(obj).some((v) => Number(v) > 0);
      });
    
    const exceptionsHasAny =
      exceptions &&
      Object.keys(exceptions).some((pid) => {
        const uobj = exceptions[pid] || {};
        return Object.values(uobj).some((cards) =>
          Object.values(cards || {}).some((v) => Number(v) > 0)
        );
      });

    if (!mainHasAny && !exceptionsHasAny) {
      return res
        .status(400)
        .json({ success: false, message: "Bos data insert olmaz" });
    }

    // İmtiyaz qruplarını yoxla
    const permSet = new Set([
      ...Object.keys(main_values || {}),
      ...Object.keys(exceptions || {}),
    ]);

    if (permSet.size) {
      const perms = await ImtiyazQruplari.find({
        _id: { $in: Array.from(permSet) },
        sirket_id: sirketId,
      }).select("_id");
      
      const validPermIds = new Set(perms.map((p) => String(p._id)));
      for (const pid of Array.from(permSet)) {
        if (!validPermIds.has(String(pid))) permSet.delete(pid);
      }
    }

    // User -> Card -> Amount mapping
    const userCardMap = new Map(); // userId -> Map(cardId -> amount)
    const cardUsageCounter = new Map(); // cardId -> Set(userIds)
    const userPermMap = new Map(); // userId -> permId (imtiyaz_id üçün)

    for (const permId of permSet) {
      const usersOfPerm = await PeopleUser.find({
        imtiyaz: permId,
        sirket_id: sirketId,
      })
        .select("_id totalBalance")
        .lean();

      if (!usersOfPerm.length) continue;

      // Hidden users
      const hiddenUsersObj = hidden?.[permId] || {};
      const hiddenUserIds = new Set(
        Object.entries(hiddenUsersObj)
          .filter(([_, v]) => !!v)
          .map(([uid]) => String(uid))
      );

      // Exception data: exceptions[permId][userId][cardId] = amount
      const permExceptions = exceptions?.[permId] || {};

      // Main values: main_values[permId][cardId] = amount
      const permMainValues = main_values?.[permId] || {};
      const cleanedMainValues = Object.fromEntries(
        Object.entries(permMainValues)
          .map(([cid, val]) => [cid, Number(val)])
          .filter(([_, v]) => Number.isFinite(v) && v > 0)
      );

      for (const u of usersOfPerm) {
        const userId = String(u._id);

        if (hiddenUserIds.has(userId)) continue;

        const perUserCards = new Map();

        // Əgər bu user üçün exception varsa
        const excForUser = permExceptions?.[userId];
        if (excForUser) {
          for (const [cardId, raw] of Object.entries(excForUser || {})) {
            const val = Number(raw);
            if (Number.isFinite(val) && val > 0) {
              perUserCards.set(String(cardId), val);
            }
          }
        }

        // Exception olmayan cardları main_values-dan götür
        for (const [cardId, val] of Object.entries(cleanedMainValues)) {
          if (!excForUser || excForUser[cardId] === undefined) {
            perUserCards.set(String(cardId), Number(val));
          }
        }

        if (perUserCards.size === 0) continue;

        // User-ə card təyin et
        if (!userCardMap.has(userId)) userCardMap.set(userId, new Map());
        const userMap = userCardMap.get(userId);
        
        for (const [cardId, val] of perUserCards.entries()) {
          userMap.set(cardId, val);

          if (!cardUsageCounter.has(cardId))
            cardUsageCounter.set(cardId, new Set());
          cardUsageCounter.get(cardId).add(userId);
        }

        // İmtiyaz qrupunu saxla (modelə əlavə etmək üçün)
        userPermMap.set(userId, permId);
      }
    }

    // Toplam məbləği hesabla
    let grandTotal = 0;
    const perCardTotals = new Map();

    for (const [, cardsMap] of userCardMap.entries()) {
      for (const [cardId, val] of cardsMap.entries()) {
        grandTotal += val;
        perCardTotals.set(cardId, (perCardTotals.get(cardId) || 0) + val);
      }
    }

    if (grandTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Məbləğ daxil edin",
      });
    }

    if (!(sirketBalance > 0) || grandTotal > sirketBalance) {
      return res.status(400).json({
        success: false,
        message: "Şirkət balansı yetərsizdir.",
        need: grandTotal,
        have: sirketBalance,
      });
    }

    // MANUAL ROLLBACK
    let addBalanceDoc = null;
    let writePhaseOk = false;

    try {
      // Əsas əməliyyat sənədi (bunu əməliyyatı edən şəxs yaradır)
      addBalanceDoc = await AddCardBalance.findOne({
        sirket_id: sirketId,
        balance_id,
        status: "active",
      });

      // Bütün userlərin cari balanslarını götür
      const allUserIds = Array.from(userCardMap.keys());
      const userBalances = await PeopleUser.find({ 
        _id: { $in: allUserIds } 
      })
        .select("_id totalBalance")
        .lean();

      const balanceByUser = new Map(
        userBalances.map((u) => [String(u._id), Number(u.totalBalance ?? 0)])
      );

      // Bulk insert üçün data hazırla
      const bulk = [];
      for (const [userId, cardsMap] of userCardMap.entries()) {
        const lastBalance = balanceByUser.get(userId) ?? 0;
        
        for (const [cardId, addVal] of cardsMap.entries()) {
          const added_balance = Number(addVal);
          const total_balance = Number(lastBalance) + added_balance;

          bulk.push({
            user_id: userId,  // Balansı alan user (DÜZƏLDILDI)
            balance_id: addBalanceDoc._id,
            sirket_id: sirketId,
            card_id: cardId,
            imtiyaz_id: userPermMap.get(userId), // İmtiyaz qrupu əlavə edildi
            
            added_balance,
            last_balance: Number(lastBalance),
            total_balance,
            
            updatedBy: me._id,  // Əməliyyatı edən şəxs
            refModel: "PeopleUser",
            status: "active",
          });
        }
      }

      if (bulk.length) {
        await AddedBalance.deleteMany({balance_id: balance._id});
        await AddedBalance.insertMany(bulk, { ordered: true });
      }

      // Card metadata-nı yenilə
      const cardsMeta = Array.from(cardUsageCounter.entries()).map(
        ([cardId, usersSet]) => ({
          card_id: cardId,
          count: usersSet.size,
        })
      );

      await AddCardBalance.updateOne(
        { _id: addBalanceDoc._id },
        { $set: { cards: cardsMeta } }
      );

      writePhaseOk = true;
    } catch (writeErr) {
      // Rollback
      try {
        if (addBalanceDoc?._id) {
          await AddedBalance.deleteMany({ balance_id: addBalanceDoc._id });
          await AddCardBalance.deleteOne({ _id: addBalanceDoc._id });
        }
      } catch (rbErr) {
        console.error("manual rollback failed:", rbErr);
      }
      throw writeErr;
    }

    // OTP göndər
    try {
      if (writePhaseOk && addBalanceDoc?._id) {
        const code = generateOtp();
        const emailTo = me.email;
        if (emailTo) {
          await sendMail(emailTo, code);
        }
        await AddCardBalance.updateOne(
          { _id: addBalanceDoc._id },
          { $set: { otp: { code, createdAt: new Date() } } }
        );
      }
    } catch (otpErr) {
      console.error("OTP/sendMail error:", otpErr?.message || otpErr);
    }

    return res.status(201).json({
      success: true,
      message: "Balans elave emeliyyati yaradildi",
      otpRequired: true,
      resendUrl: "/resend-otp",
      data: {
        balance_id: addBalanceDoc?.balance_id,
        doc_id: String(addBalanceDoc?._id || ""),
        total: grandTotal,
        per_card_totals: Object.fromEntries(perCardTotals),
        cards_usage: Array.from(cardUsageCounter.entries()).reduce(
          (acc, [cid, set]) => {
            acc[cid] = set.size;
            return acc;
          },
          {}
        ),
      },
    });
  } catch (err) {
    console.error("balanceOperationsTemp error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server xetasi", error: err?.message });
  }
}