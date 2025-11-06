import cardsCategory from "../../shared/models/cardsCategoryModel.js";
import AddedBalance from "../../shared/model/people/addedBalances.js";
import Cards from "../../shared/models/cardModel.js";
import TransactionsUser from "../../shared/models/transactionsModel.js";
import CashBack from "../../shared/models/cashBackModel.js";
import mongoose from "mongoose";

// Simple in-memory cache
const cache = {
  transactionSummary: {
    data: null,
    timestamp: 0,
    ttl: 30000, // 30 seconds
  },
  filterOptions: {
    data: null,
    timestamp: 0,
    ttl: 300000, // 5 minutes
  },
};

function isCacheValid(cacheItem) {
  return cacheItem.data && Date.now() - cacheItem.timestamp < cacheItem.ttl;
}

function invalidateCache(cacheKey) {
  if (cache[cacheKey]) {
    cache[cacheKey].data = null;
    cache[cacheKey].timestamp = 0;
  }
}

// Invalidate all caches
function invalidateAllCaches() {
  Object.keys(cache).forEach((key) => invalidateCache(key));
}

export const getTransactionSummary = async (req, res) => {
  try {
    // Check cache first
    if (isCacheValid(cache.transactionSummary)) {
      return res.json({
        success: true,
        data: cache.transactionSummary.data,
        cached: true,
      });
    }

    // Get all active cards from database
    let allCards = await Cards.find({ status: "active" }).lean();

    // Create maps for quick access to card data
    const cardsMap = {};
    allCards.forEach((card) => {
      cardsMap[card._id.toString()] = card;
    });

    let groupedCards = {
      Mədaxil: { total: 0, cards: [] },
      Məxaric: { total: 0, cards: [] },
    };

    // Initialize all cards with zero values
    allCards.forEach((card) => {
      // Add card to Mədaxil (income)
      groupedCards["Mədaxil"].cards.push({
        label: card.name,
        total: 0,
        percentage: 0,
        background_color: card.background_color || "var(--color-sidebar-bg)",
        cardId: card._id.toString(),
      });

      // Add card to Məxaric (expenses)
      groupedCards["Məxaric"].cards.push({
        label: card.name,
        total: 0,
        percentage: 0,
        background_color: card.background_color || "var(--color-sidebar-bg)",
        cardId: card._id.toString(),
      });
    });

    // Get transactions
    const transactions = await TransactionsUser.find()
      .populate("from", "name surname people_id")
      .populate("from_sirket", "sirket_name")
      .populate("to", "name")
      .populate("cards", "name category background_color")
      .lean();

    // Get Cashback operations
    const cashbackTransactions = await CashBack.find()
      .populate("card_id", "name background_color")
      .populate("transaction_id", "destination")
      .lean();

    // Calculate sums from transactions
    transactions?.forEach((item) => {
      // Determine category based on new logic
      let category;
      if (item.from && item.from.name) {
        category = "Məxaric"; // Subject operations are always expenses
      } else {
        category = item.destination === "Internal" ? "Mədaxil" : "Məxaric";
      }

      const cardId = item.cards?._id?.toString();
      if (cardId && cardsMap[cardId]) {
        // Find card in appropriate category
        const card = groupedCards[category].cards.find(
          (c) => c.cardId === cardId
        );
        if (card) {
          card.total += item.amount;
          groupedCards[category].total += item.amount;
        }
      }
    });

    // Calculate sums from Cashback operations (always Mədaxil)
    cashbackTransactions?.forEach((item) => {
      const cardId = item.card_id?._id?.toString();
      if (cardId && cardsMap[cardId]) {
        const card = groupedCards["Mədaxil"].cards.find(
          (c) => c.cardId === cardId
        );
        if (card) {
          card.total += item.cashback || 0;
          groupedCards["Mədaxil"].total += item.cashback || 0;
        }
      }
    });

    // Calculate percentages for each category
    Object.keys(groupedCards).forEach((type) => {
      const categoryTotal = groupedCards[type].total;
      if (categoryTotal > 0) {
        groupedCards[type].cards.forEach((card) => {
          card.percentage = Math.round((card.total * 100) / categoryTotal);
        });
      }
    });

    // Sort cards by descending amount
    Object.keys(groupedCards).forEach((type) => {
      groupedCards[type].cards.sort((a, b) => b.total - a.total);
    });

    // Get total transaction count
    const totalTransactions = await TransactionsUser.countDocuments();

    const responseData = {
      groupedCards,
      totalTransactions,
      allCards,
    };

    // Update cache
    cache.transactionSummary.data = responseData;
    cache.transactionSummary.timestamp = Date.now();

    return res.json({
      success: true,
      data: responseData,
      cached: false,
    });
  } catch (error) {
    console.error("Get transaction summary error:", error);
    return res.status(500).json({
      message: "Tranzaksiya məlumatları alına bilmədi",
      success: false,
    });
  }
};

export const invalidateTransactionCache = async (req, res) => {
  try {
    invalidateAllCaches();
    return res.json({
      success: true,
      message: "Cache cleared successfully",
    });
  } catch (error) {
    console.error("Cache invalidation error:", error);
    return res.status(500).json({
      message: "Cache temizlənə bilmədi",
      success: false,
    });
  }
};

export const getFilterOptions = async (req, res) => {
  try {
    // Check cache first
    if (isCacheValid(cache.filterOptions)) {
      return res.json({
        success: true,
        data: cache.filterOptions.data,
        cached: true,
      });
    }

    // Get unique card categories
    const cardCategories = await Cards.find({ status: "active" })
      .select("name")
      .lean();

    // Get unique subjects (muessises)
    const subjects = await mongoose.connection.db
      .collection("muessises")
      .find({})
      .project({ name: 1 })
      .toArray();

    // Get unique users for filtering
    const users = await mongoose.connection.db
      .collection("peopleusers")
      .find({})
      .project({ name: 1, surname: 1, people_id: 1 })
      .limit(100) // Limit for performance
      .toArray();

    const responseData = {
      cardCategories: cardCategories.map((card) => card.name),
      subjects: subjects.map((subject) => subject.name),
      users: users.map((user) => ({
        id: user._id,
        name: `${user.name || ""} ${user.surname || ""}`.trim(),
        people_id: user.people_id,
      })),
    };

    // Update cache
    cache.filterOptions.data = responseData;
    cache.filterOptions.timestamp = Date.now();

    return res.json({
      success: true,
      data: responseData,
      cached: false,
    });
  } catch (error) {
    console.error("Get filter options error:", error);
    return res.status(500).json({
      message: "Filter seçimləri alına bilmədi",
      success: false,
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await TransactionsUser.find()
      .populate("from", "name surname people_id")
      .populate("from_sirket", "sirket_name")
      .populate("to", "name")
      .populate("cards", "name category background_color")
      .lean();

    if (!transactions || transactions.length === 0) {
      return res.status(400).json({
        message: "Transactions not found",
        success: false,
      });
    }
    const totalTransactions = await TransactionsUser.countDocuments();
    if (totalTransactions === 0)
      return res.status(400).json({
        message: "Transactions not found",
        success: false,
      });

    // Получаем все активные карты из базы данных
    let allCards = await Cards.find({ status: "active" }).lean();

    // Создаем мапы для быстрого доступа к данным карт
    const cardsMap = {};
    allCards.forEach((card) => {
      cardsMap[card._id.toString()] = card;
    });

    let groupedCards = {
      Mədaxil: { total: 0, cards: [] },
      Məxaric: { total: 0, cards: [] },
    };

    // Инициализируем все карты с нулевыми значениями
    allCards.forEach((card) => {
      // Добавляем карту в Mədaxil (доходы)
      groupedCards["Mədaxil"].cards.push({
        label: card.name,
        total: 0,
        percentage: 0,
        background_color: card.background_color || "var(--color-sidebar-bg)",
        cardId: card._id.toString(),
      });

      // Добавляем карту в Məxaric (расходы)
      groupedCards["Məxaric"].cards.push({
        label: card.name,
        total: 0,
        percentage: 0,
        background_color: card.background_color || "var(--color-sidebar-bg)",
        cardId: card._id.toString(),
      });
    });

    // Получаем Cashback операции
    const cashbackTransactions = await CashBack.find()
      .populate("card_id", "name background_color")
      .populate({path: "transaction_id", select:"destination"})
      .lean();

    // Подсчитываем суммы по транзакциям
    transactions?.forEach((item) => {
      // Определяем категорию на основе новой логики
      let category;
      if (item.from && item.from.name) {
        category = "Məxaric"; // Subject операции всегда расход
      } else {
        category = item.destination === "Internal" ? "Mədaxil" : "Məxaric";
      }

      const cardId = item.cards?._id?.toString();
      if (cardId && cardsMap[cardId]) {
        // Находим карту в соответствующей категории
        const card = groupedCards[category].cards.find(
          (c) => c.cardId === cardId
        );
        if (card) {
          card.total += item.amount;
          groupedCards[category].total += item.amount;
        }
      }
    });

    // Подсчитываем суммы по Cashback операциям (всегда Mədaxil)
    cashbackTransactions?.forEach((item) => {
      const cardId = item.card_id?._id?.toString();
      if (cardId && cardsMap[cardId]) {
        const card = groupedCards["Mədaxil"].cards.find(
          (c) => c.cardId === cardId
        );
        if (card) {
          card.total += item.cashback || 0;
          groupedCards["Mədaxil"].total += item.cashback || 0;
        }
      }
    });

    // Вычисляем проценты для каждой категории
    Object.keys(groupedCards).forEach((type) => {
      const categoryTotal = groupedCards[type].total;
      if (categoryTotal > 0) {
        groupedCards[type].cards.forEach((card) => {
          card.percentage = Math.round((card.total * 100) / categoryTotal);
        });
      }
    });

    // Сортируем карты по убыванию суммы
    Object.keys(groupedCards).forEach((type) => {
      groupedCards[type].cards.sort((a, b) => b.total - a.total);
    });
    return res.render("pages/transactions.ejs", {
      error: "",
      csrfToken: req.csrfToken(),
      data: transactions,
      totalTransactions,
      groupedCards,
      allCards,
    });
  } catch (error) {
    console.log("delete-ticket error:", error);
    return res.status(500).send("Internal Server Error 1 ci den");
  }
};

export const exportTransactions = async (req, res) => {
  try {
    console.log("=== exportTransactions called ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const {
      start_date,
      end_date,
      status,
      card_category,
      destination,
      min,
      max,
      query,
      format = "excel",
    } = req.body;

    // Build match criteria (same as getTransactionsTable)
    const match = {
      status: "success",
    };

    // Date filtering
    if (start_date || end_date) {
      match.date = {};
      if (start_date) {
        const startDate = new Date(start_date);
        startDate.setHours(0, 0, 0, 0);
        match.date.$gte = startDate;
      }
      if (end_date) {
        const endDate = new Date(end_date);
        endDate.setHours(23, 59, 59, 999);
        match.date.$lte = endDate;
      }
    }

    // Card category filtering
    if (card_category) {
      if (Array.isArray(card_category)) {
        match["cards.name"] = { $in: card_category };
      } else {
        match["cards.name"] = card_category;
      }
    }

    // Destination filtering
    if (destination) {
      if (Array.isArray(destination)) {
        const mappedDestinations = destination.map((dest) => {
          if (dest === "incoming") return "Internal";
          if (dest === "outgoing") return "External";
          return dest;
        });
        match.destination = { $in: mappedDestinations };
      } else {
        if (destination === "incoming") match.destination = "Internal";
        else if (destination === "outgoing") match.destination = "External";
        else match.destination = destination;
      }
    }

    // Status filtering
    if (status) {
      if (Array.isArray(status)) {
        const mappedStatuses = status.map((stat) => {
          if (stat === "success") return "success";
          if (stat === "fail") return "failed";
          return stat;
        });
        match.status = { $in: mappedStatuses };
      } else {
        if (status === "success") match.status = "success";
        else if (status === "fail") match.status = "failed";
        else match.status = status;
      }
    }

    // Amount filtering
    if (min || max) {
      match.amount = {};
      if (min) match.amount.$gte = Number(min);
      if (max) match.amount.$lte = Number(max);
    }

    // Search filtering
    if (query) {
      const destinationMap = { Mədaxil: "Internal", Məxaric: "External" };
      const statusMap = {
        uğurlu: "success",
        uğursuz: "failed",
        gözləmədə: "pending",
      };

      let searchValue = query;
      if (destinationMap[query]) searchValue = destinationMap[query];
      if (statusMap[query]) searchValue = statusMap[query];

      const searchRegex = new RegExp(searchValue, "i");
      match.$or = [
        { transaction_id: searchRegex },
        { subject: searchRegex },
        { status: searchRegex },
        { destination: searchRegex },
        { "user.name": searchRegex },
        { "user.surname": searchRegex },
      ];
    }

    // Build aggregation pipeline (same as getTransactionsTable)
    const transactionPipeline = [
      {
        $lookup: {
          from: "partnerusers",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "peopleusers",
          localField: "from",
          foreignField: "_id",
          as: "from",
        },
      },
      {
        $lookup: {
          from: "cards",
          localField: "cards",
          foreignField: "_id",
          as: "cards",
        },
      },
      {
        $lookup: {
          from: "muessises",
          localField: "to",
          foreignField: "_id",
          as: "to",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$from", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$cards", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$to", preserveNullAndEmptyArrays: true } },
      { $addFields: { operation_type: "transaction" } },
    ];

    const cashbackPipeline = [
      {
        $lookup: {
          from: "transactionusers",
          localField: "transaction_id",
          foreignField: "_id",
          as: "transaction",
        },
      },
      {
        $lookup: {
          from: "partnerusers",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "cards",
          localField: "card_id",
          foreignField: "_id",
          as: "cards",
        },
      },
      {
        $lookup: {
          from: "muessises",
          localField: "muessise_id",
          foreignField: "_id",
          as: "to",
        },
      },
      { $unwind: { path: "$transaction", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$cards", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$to", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          operation_type: "cashback",
          transaction_id: "$transaction.transaction_id",
          amount: "$cashback",
          destination: "Internal",
          subject: "$transaction.subject",
          date: "$createdAt",
          status: "success",
          from: null,
          from_sirket: null,
        },
      },
    ];

    // Apply filters
    const matchBeforeUnwind = {};
    const matchAfterUnwind = {};

    Object.keys(match).forEach((key) => {
      if (key.startsWith("cards.")) {
        matchAfterUnwind[key] = match[key];
      } else {
        matchBeforeUnwind[key] = match[key];
      }
    });

    if (Object.keys(matchBeforeUnwind).length > 0) {
      transactionPipeline.push({ $match: matchBeforeUnwind });
      cashbackPipeline.push({ $match: matchBeforeUnwind });
    }

    if (Object.keys(matchAfterUnwind).length > 0) {
      transactionPipeline.push({ $match: matchAfterUnwind });
      cashbackPipeline.push({ $match: matchAfterUnwind });
    }

    // Get all data for export (no pagination)
    const transactions = await TransactionsUser.aggregate([
      ...transactionPipeline,
      { $unionWith: { coll: "cashbacks", pipeline: cashbackPipeline } },
      { $sort: { date: -1 } },
    ]);

    // Format data for export
    const exportData = transactions.map((item) => {
      // Format destination
      if (item.operation_type === "cashback") {
        item.destination = "Mədaxil";
      } else if (item.from && item.from.name) {
        item.destination = "Məxaric";
      } else {
        if (item.destination === "Internal") item.destination = "Mədaxil";
        if (item.destination === "External") item.destination = "Məxaric";
      }

      // Format status
      switch (item.status) {
        case "failed":
          item.status = "uğursuz";
          break;
        case "success":
          item.status = "uğurlu";
          break;
        case "pending":
          item.status = "gözləmədə";
          break;
      }

      return {
        İstifadəçi:
          `${item.from?.name || ""} ${item.from?.surname || ""}`.trim() ||
          `${item.user?.name || ""} ${item.user?.surname || ""}`.trim(),
        "İstifadəçi ID": item.from?.people_id || item.user?.partnyor_id || "",
        "Tranzaksiya ID": item.transaction_id || "",
        Təyinatı: item.destination || "",
        "Kart Kateqoriyası": item.cards?.name || "",
        "Məbləğ (AZN)": parseFloat(item.amount).toFixed(2),
        Subyekt: item.subject || "",
        Tarix: new Date(item.date).toLocaleString("az-AZ", {
          timeZone: "Asia/Baku",
        }),
        Status: item.status || "",
      };
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `tranzaksiyalar_${timestamp}.xlsx`;

    if (format === "excel") {
      // For Excel export, we'll return JSON and let frontend handle conversion
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename.replace(".xlsx", ".json")}"`
      );
      return res.json({
        success: true,
        data: exportData,
        filename: filename,
        count: exportData.length,
      });
    } else {
      // For CSV export
      const csvContent = [
        Object.keys(exportData[0] || {}).join(","),
        ...exportData.map((row) =>
          Object.values(row)
            .map((val) => `"${val}"`)
            .join(",")
        ),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename.replace(".xlsx", ".csv")}"`
      );
      return res.send("\uFEFF" + csvContent); // BOM for UTF-8
    }
  } catch (error) {
    console.error("Export transactions error:", error);
    return res.status(500).json({
      message: "Export xətası",
      success: false,
    });
  }
};

export const getTransactionsTable = async (req, res) => {
  try {
    console.log("=== getTransactionsTable called ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Режим отладки убран, так как проблема решена

    const {
      start = 0, // DataTables skip sayısı olarak gönderir
      length = 10, // DataTables page size
      subject,
      end_date,
      start_date,
      status,
      cardCategory,
      card_category, // Добавляем альтернативное название
      destination,
      cardDestinations, // Добавляем альтернативное название
      cardStatus, // Добавляем альтернативное название
      min,
      max,
      search,
      query, // Добавляем параметр query для поиска
      draw,
      from,
    } = req.body;

    console.log("Extracted parameters:", {
      start_date,
      end_date,
      min,
      max,
      card_category,
      destination,
      status,
    });

    const limit = Number(length) || 10;
    const skip = Number(start) || 0;

    const match = {
      status: "success", // Only return successful transactions
    };

    if (from) {
      match.from = {
        name: from.name,
        surname: from.surname || "",
        id: from.id,
        people_id: from.people_id,
      };
    }

    // Обработка фильтрации по датам
    if (start_date || end_date) {
      console.log("Date filters received:", { start_date, end_date });
      match.date = {};

      if (start_date) {
        // Устанавливаем начало дня для start_date
        const startDate = new Date(start_date);
        startDate.setHours(0, 0, 0, 0);
        match.date.$gte = startDate;
        console.log("Start date filter applied:", startDate);
      }

      if (end_date) {
        // Устанавливаем конец дня для end_date
        const endDate = new Date(end_date);
        endDate.setHours(23, 59, 59, 999);
        match.date.$lte = endDate;
        console.log("End date filter applied:", endDate);
      }

      console.log("Final date match object:", match.date);
    }

    if (subject) match.subject = subject;
    if (status) match.status = status;

    // Обработка категорий карт
    const cardCategoryValue = cardCategory || card_category;
    if (cardCategoryValue) {
      console.log("Card category filter:", cardCategoryValue);
      if (Array.isArray(cardCategoryValue)) {
        // Ищем карты по названию - после $unwind cards становится объектом
        match["cards.name"] = { $in: cardCategoryValue };
      } else {
        match["cards.name"] = cardCategoryValue;
      }
      console.log("Card category match applied:", match["cards.name"]);
    }

    // Обработка назначения (destination)
    const destinationValue = destination || cardDestinations;
    if (destinationValue) {
      if (Array.isArray(destinationValue)) {
        // Преобразуем значения для поиска
        const mappedDestinations = destinationValue.map((dest) => {
          if (dest === "incoming") return "Internal";
          if (dest === "outgoing") return "External";
          return dest;
        });
        match.destination = { $in: mappedDestinations };
      } else {
        if (destinationValue === "incoming") match.destination = "Internal";
        else if (destinationValue === "outgoing")
          match.destination = "External";
        else match.destination = destinationValue;
      }
    }

    // Обработка статуса
    const statusValue = status || cardStatus;
    if (statusValue) {
      if (Array.isArray(statusValue)) {
        const mappedStatuses = statusValue.map((stat) => {
          if (stat === "success") return "success";
          if (stat === "fail") return "failed";
          return stat;
        });
        match.status = { $in: mappedStatuses };
      } else {
        if (statusValue === "success") match.status = "success";
        else if (statusValue === "fail") match.status = "failed";
        else match.status = statusValue;
      }
    }

    if (min || max) {
      match.amount = {};
      if (min) match.amount.$gte = Number(min);
      if (max) match.amount.$lte = Number(max);
    }

    // arama için map
    const destinationMap = { Mədaxil: "Internal", Məxaric: "External" };
    const statusMap = {
      uğurlu: "success",
      uğursuz: "failed",
      gözləmədə: "pending",
    };

    // Используем query для поиска, если он есть, иначе search
    const searchTerm = query || search;

    if (searchTerm) {
      let searchValue = searchTerm;
      if (destinationMap[searchTerm]) searchValue = destinationMap[searchTerm];
      if (statusMap[searchTerm]) searchValue = statusMap[searchTerm];

      const searchRegex = new RegExp(searchValue, "i");
      match.$or = [
        { transaction_id: searchRegex },
        { subject: searchRegex },
        { status: searchRegex },
        { destination: searchRegex },
        { "user.name": searchRegex },
        { "user.surname": searchRegex },
      ];
    }

    // toplam ve filtrelenmiş kayıt sayısı (включая cashback операции)
    const transactionCount = await TransactionsUser.countDocuments({
      status: "success",
    });
    const cashbackCount = await CashBack.countDocuments();
    const totalCount = transactionCount + cashbackCount;

    // Создаем два отдельных запроса: для транзакций и для cashback операций
    let transactionPipeline = [];
    let cashbackPipeline = [];

    // Pipeline для обычных транзакций with optimized lookups
    transactionPipeline.push({
      $lookup: {
        from: "partnerusers",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [{ $project: { name: 1, surname: 1, partnyor_id: 1 } }],
      },
    });

    transactionPipeline.push({
      $lookup: {
        from: "peopleusers",
        localField: "from",
        foreignField: "_id",
        as: "from",
        pipeline: [{ $project: { name: 1, surname: 1, people_id: 1 } }],
      },
    });

    transactionPipeline.push({
      $lookup: {
        from: "cards",
        localField: "cards",
        foreignField: "_id",
        as: "cards",
        pipeline: [{ $project: { name: 1, category: 1, background_color: 1 } }],
      },
    });

    transactionPipeline.push({
      $lookup: {
        from: "muessises",
        localField: "to",
        foreignField: "_id",
        as: "to",
        pipeline: [{ $project: { name: 1 } }],
      },
    });

    // Unwind массивы
    transactionPipeline.push({
      $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
    });

    transactionPipeline.push({
      $unwind: { path: "$from", preserveNullAndEmptyArrays: true },
    });

    transactionPipeline.push({
      $unwind: { path: "$cards", preserveNullAndEmptyArrays: true },
    });

    transactionPipeline.push({
      $unwind: { path: "$to", preserveNullAndEmptyArrays: true },
    });

    // Добавляем поле type для различения типов операций
    transactionPipeline.push({
      $addFields: {
        operation_type: "transaction",
      },
    });

    // Pipeline для cashback операций
    cashbackPipeline.push({
      $lookup: {
        from: "transactionusers",
        localField: "transaction_id",
        foreignField: "_id",
        as: "transaction",
      },
    });

    cashbackPipeline.push({
      $lookup: {
        from: "partnerusers",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    });

    cashbackPipeline.push({
      $lookup: {
        from: "cards",
        localField: "card_id",
        foreignField: "_id",
        as: "cards",
      },
    });

    cashbackPipeline.push({
      $lookup: {
        from: "muessises",
        localField: "muessise_id",
        foreignField: "_id",
        as: "to",
      },
    });

    // Unwind массивы для cashback
    cashbackPipeline.push({
      $unwind: { path: "$transaction", preserveNullAndEmptyArrays: true },
    });

    cashbackPipeline.push({
      $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
    });

    cashbackPipeline.push({
      $unwind: { path: "$cards", preserveNullAndEmptyArrays: true },
    });

    cashbackPipeline.push({
      $unwind: { path: "$to", preserveNullAndEmptyArrays: true },
    });

    // Преобразуем cashback в формат транзакции
    cashbackPipeline.push({
      $addFields: {
        operation_type: "cashback",
        transaction_id: "$transaction.transaction_id",
        amount: "$cashback",
        destination: "Internal", // Cashback всегда Mədaxil
        subject: "$transaction.subject",
        date: "$createdAt",
        status: "success",
        from: null,
        from_sirket: null,
      },
    });

    // Разделяем match на части: до $unwind и после $unwind
    const matchBeforeUnwind = {};
    const matchAfterUnwind = {};

    // Разделяем условия match
    Object.keys(match).forEach((key) => {
      if (key.startsWith("cards.")) {
        // Фильтры по картам применяем после $unwind
        matchAfterUnwind[key] = match[key];
      } else {
        // Остальные фильтры применяем до $unwind
        matchBeforeUnwind[key] = match[key];
      }
    });

    // Добавляем match стадии до $unwind
    if (Object.keys(matchBeforeUnwind).length > 0) {
      console.log("Adding match stage before unwind:", matchBeforeUnwind);
      transactionPipeline.push({ $match: matchBeforeUnwind });
      cashbackPipeline.push({ $match: matchBeforeUnwind });
    }

    // Добавляем match стадии после $unwind
    if (Object.keys(matchAfterUnwind).length > 0) {
      console.log("Adding match stage after unwind:", matchAfterUnwind);
      transactionPipeline.push({ $match: matchAfterUnwind });
      cashbackPipeline.push({ $match: matchAfterUnwind });
    }

    // Объединяем результаты
    const combinedPipeline = [
      { $unionWith: { coll: "cashbacks", pipeline: cashbackPipeline } },
      { $sort: { date: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    // Выполняем агрегацию для получения данных
    console.log(
      "Executing aggregation with pipeline:",
      JSON.stringify([...transactionPipeline, ...combinedPipeline], null, 2)
    );
    const transactions = await TransactionsUser.aggregate([
      ...transactionPipeline,
      ...combinedPipeline,
    ]);
    console.log("Aggregation result count:", transactions.length);

    // Отладочная информация убрана, так как все работает

    // Подсчитываем отфильтрованные записи
    const countPipeline = [
      { $unionWith: { coll: "cashbacks", pipeline: cashbackPipeline } },
    ];

    if (Object.keys(match).length > 0) {
      countPipeline.push({ $match: match });
    }

    countPipeline.push({ $count: "total" });

    const filteredCountResult = await TransactionsUser.aggregate([
      ...transactionPipeline,
      ...countPipeline,
    ]);

    const filteredCount =
      filteredCountResult.length > 0 ? filteredCountResult[0].total : 0;

    // formatlama
    transactions.forEach((item) => {
      // Логика отображения destination:
      // - Cashback операции всегда Mədaxil (доход)
      // - Subject операции (from поле заполнено) всегда Məxaric (расход)
      // - Остальные операции по destination
      if (item.operation_type === "cashback") {
        item.destination = "Mədaxil"; // Cashback всегда доход
      } else if (item.from && item.from.name) {
        item.destination = "Məxaric"; // Subject операции всегда расход
      } else {
        if (item.destination === "Internal") item.destination = "Mədaxil";
        if (item.destination === "External") item.destination = "Məxaric";
      }

      item.amount = Number(item.amount).toFixed(2);

      const newDate = new Date(item.date);
      item.date = `${newDate.toLocaleDateString("az-AZ", { timeZone: "Asia/Baku" })}-${newDate.toLocaleTimeString("az-AZ", { timeZone: "Asia/Baku" })}`;

      switch (item.status) {
        case "failed":
          item.status = "uğursuz";
          break;
        case "success":
          item.status = "uğurlu";
          break;
        case "pending":
          item.status = "gözləmədə";
          break;
      }

      // Преобразуем ObjectId в строки для корректной работы с фронтендом
      if (item._id) item._id = item._id.toString();
      if (item.user && item.user._id) item.user._id = item.user._id.toString();
      if (item.from && item.from._id) item.from._id = item.from._id.toString();
      if (item.cards && item.cards._id)
        item.cards._id = item.cards._id.toString();
      if (item.to && item.to._id) item.to._id = item.to._id.toString();

      // Убираем from_sirket поле (sirket_name больше не отображается)
      if (item.from_sirket) {
        delete item.from_sirket;
      }
    });

    return res.status(200).json({
      success: true,
      draw,
      recordsTotal: totalCount,
      recordsFiltered: filteredCount,
      data: transactions,
    });
  } catch (error) {
    console.error("Transactions table error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
