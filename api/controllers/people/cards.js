//TODO: Import SirketUsers and CardBalances models
// import SirketUser from "../../../shared/models/peopleUsersModel.js";
import PeopleCardBalance from "../../../shared/model/people/cardBalances.js";
import Cards from "../../../shared/models/cardModel.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import TransactionsUser from "../../../shared/models/transactionsModel.js";
import CardConditions from "../../../shared/models/cardConditionsModel.js";
import RequestCard from "../../../shared/model/people/requestActivateCard.js";
import redisClient from "../../redisClient.js";
import CashBack from "../../../shared/models/cashBackModel.js";
import mongoose from "mongoose";

export const myCards = async (req, res) => {
  try {
    const { sirket_id } = req.body;
    const userId = req.user;

    const cacheKey = `myCards:${userId}:${sirket_id}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const sirketUser = await PeopleUser.findOne({ _id: userId, sirket_id });
    if (!sirketUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found in this sirket" });
    }

    const balances = await PeopleCardBalance.find({
      user_id: userId,
      sirket_id,
    }).populate({
      path: "card_id",
      match: { status: "active" }, // yalnız status=active olan kartlar
      select: "name icon background_color"
    });
    const result = balances.map((b) => ({
      name: b.card_id?.name || null,
      icon: b.card_id?.icon || null,
      color: b.card_id?.background_color || null,
      balance: b.balance,
      _id: b._id,
    }));
    const responseData = { success: true, data: result };

    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 120 });

    return res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { card_id } = req.body;
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const skip = (page - 1) * limit;

    const userId = req.user;

    if (!card_id) {
      return res.status(400).json({
        success: false,
        message: "card_id is required",
      });
    }

    const transactions = await TransactionsUser.find({
      from: userId,
      cardbalance: card_id,
    })
      .populate("to", "muessise_name muessise_category")
      .select("_id amount createdAt status")
      .sort({ createdAt: -1 });

    const cashbacks = await CashBack.find({
      user_id: userId,
    })
      .populate("muessise_id", "muessise_name muessise_category")
      .select("_id cashback from_amount createdAt")
      .sort({ createdAt: -1 });

    const formattedTransactions = transactions.map((transaction) => ({
      _id: transaction._id,
      amount: transaction.amount,
      created_at: transaction.createdAt,
      status: transaction.status,
      muessise_name: transaction.to?.muessise_name || null,
      muessise_category: transaction.to?.muessise_category || null,
      category: "transaction",
    }));

    const formattedCashbacks = cashbacks.map((cashback) => ({
      _id: cashback._id,
      amount: cashback.cashback,
      created_at: cashback.createdAt,
      status: "completed",
      muessise_name: cashback.muessise_id?.muessise_name || null,
      muessise_category: cashback.muessise_id?.muessise_category || null,
      category: "cashback",
    }));

    const allData = [...formattedTransactions, ...formattedCashbacks]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(skip, skip + limit);

    const responseData = {
      success: true,
      page,
      skip,
      limit,
      data: allData,
    };

    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getTransactionDetails = async (req, res) => {
  try {
    const { transaction_id, category = "transaction" } = req.body;

    const userId = req.user;

    if (!transaction_id) {
      return res.status(400).json({
        success: false,
        message: "transaction_id is required",
      });
    }

    let detailsData;

    switch (category) {
      case "cashback":
        detailsData = await CashBack.findOne({
          _id: transaction_id,
          user_id: userId,
        })
          .populate(
            "muessise_id",
            "muessise_name profile_image_path muessise_category"
          )
          .populate("transaction_id", "amount createdAt status");

        if (!detailsData) {
          return res.status(404).json({
            success: false,
            message: "Cashback not found",
          });
        }
        break;

      case "transaction":
      default:
        detailsData = await TransactionsUser.findOne({
          _id: transaction_id,
          from: userId,
        }).populate("to", "muessise_name profile_image_path");

        if (!detailsData) {
          return res.status(404).json({
            success: false,
            message: "Transaction not found",
          });
        }
        break;
    }

    res.json({
      success: true,
      data: detailsData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllCards = async (req, res) => {
  try {
    const userId = req.user;
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const skip = (page - 1) * limit;

    // Active olan bütün kartları gətir
    const activeCards = await Cards.find({ status: "active" })
      .skip(skip)
      .limit(limit);

    if (!activeCards || activeCards.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aktiv kart tapılmadı",
      });
    }

    const cardIds = activeCards.map((card) => card._id);

    // Kartların conditions-larını gətir
    const cardConditions = await CardConditions.find({
      cardId: { $in: cardIds },
    });

    // User üçün CardBalances-dən bütün kartları gətir
    const userCardBalances = await PeopleCardBalance.find({
      user_id: userId,
    });

    // User üçün hər kart üzrə ən sonuncu RequestCard-ı gətir
    const userRequestCards = await RequestCard.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$card_id",
          lastRequest: { $first: "$$ROOT" },
        },
      },
    ]);

    // Daha rahat istifadə üçün map halına salaq
    const requestMap = {};
    userRequestCards.forEach((item) => {
      requestMap[item._id.toString()] = item.lastRequest;
    });

    // Nəticəni hazırla
    const result = activeCards.map((card) => {
      // Kartın conditions-larını tap
      const conditions = cardConditions.filter(
        (condition) => condition.cardId.toString() === card._id.toString()
      );

      // Default olaraq "inactive"
      let current_status = "inactive";
      let request_status = "inactive";

      // Əgər balance varsa ordan götür
      const userBalance = userCardBalances.find(
        (balance) => balance.card_id.toString() === card._id.toString()
      );

      // Ən sonuncu request varsa ordan götür
      const userRequest = requestMap[card._id.toString()];
      if (userRequest) {
        request_status = userRequest.status;
      }
      if (userBalance) {
        current_status = userBalance.status;
      }

      return {
        _id: card._id,
        name: card.name,
        description: card.description,
        background_color: card.background_color,
        icon: card.icon,
        category: card.category,
        current_status : request_status,
        isActive: current_status === "active" || request_status === "waiting",
        conditions: conditions.map((condition) => ({
          _id: condition._id,
          title: condition.title,
          description: condition.description,
          status: condition.category,
        })),
      };
    });

    return res.status(200).json({
      success: true,
      data: result,
      page,
      limit,
    });
  } catch (err) {
    console.error("getAllCards error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};