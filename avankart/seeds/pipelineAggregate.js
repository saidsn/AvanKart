import { createClient } from "redis";
import AddedBalance from "../../shared/model/people/addedBalances.js";

// 🔹 Redis Client setup
const redisClient = createClient();

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error", err);
});

await redisClient.connect();

export const aggregate = async (pipelineTitle, sirket_id, options = {}) => {
  const { range = "year", from = null, to = null } = options;
  const cacheKey = `${pipelineTitle}:${sirket_id}:${range}:${from || "null"}:${to || "null"}`;

  try {
    // ✅ First try to get from Redis
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return { cachedData };
    }

    // 🔹 Date range calculation
    let startDate = new Date();
    let endDate = new Date();

    if (range === "custom" && from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
    } else {
      // Default: last 3 years
      startDate.setFullYear(startDate.getFullYear() - 3);
    }

    let balances = [];
    let formattedBalance = {};

    if (pipelineTitle === "imtiyazQruplariUzeOdemeler") {
      const pipeline = [
        {
          $match: {
            sirket_id,
            status: "completed",
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$perm_id",
            total_balance: { $sum: "$added_balance" },
          },
        },
        {
          $lookup: {
            from: "rbacpermissions",
            localField: "_id",
            foreignField: "_id",
            as: "permissionDetails",
          },
        },
        { $unwind: "$permissionDetails" },
        {
          $project: {
            _id: 0,
            permissionName: "$permissionDetails.name",
            total_balance: "$total_balance",
          },
        },
      ];

      balances = await AddedBalance.aggregate(pipeline);

      formattedBalance = {
        labels: balances.map((b) => b.permissionName),
        datasets: balances.map((b) => b.total_balance || 0),
      };
    }

    if (pipelineTitle === "toplamOdemeler") {
      const pipeline = [
        {
          $match: {
            sirket_id,
            status: "completed",
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$card_id",
            total_balance: { $sum: "$added_balance" },
          },
        },
        {
          $lookup: {
            from: "cards",
            localField: "_id",
            foreignField: "_id",
            as: "cardsDetails",
          },
        },
        { $unwind: "$cardsDetails" },
        {
          $project: {
            _id: 0,
            cardsName: "$cardsDetails.name",
            total_balance: "$total_balance",
          },
        },
      ];

      balances = await AddedBalance.aggregate(pipeline);

      formattedBalance = {
        labels: balances.map((b) => b.cardsName),
        datasets: balances.map((b) => b.total_balance || 0),
        total: balances.reduce((sum, v) => sum + v.total_balance, 0),
      };
    }

    
    await redisClient.setEx(cacheKey, 60 * 60 * 6, JSON.stringify(formattedBalance));

    return { formattedBalance };
  } catch (err) {
    console.error("❌ Aggregate error:", err.message);
    return { formattedBalance: {} }; 
  }
};
