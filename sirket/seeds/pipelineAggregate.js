import AddedBalance from "../../shared/model/people/addedBalances.js";
import mongoose from "mongoose";

export const aggregate = async (pipelineTitle, sirket_id, options = {}) => {
  const { range = "year", from = null, to = null, imtiyazId = null } = options;

  try {
    let startDate = new Date();
    let endDate = new Date();

    if (range === "custom" && from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
    } else if (range === "all") {
      startDate = new Date(0);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 3);
    }

    let balances = [];
    let formattedBalance = {};

    if (pipelineTitle === "imtiyazQruplariUzeOdemeler") {
      const matchFilter = {
        sirket_id,
        status: "completed",
        createdAt: { $gte: startDate, $lte: endDate },
      };
      if (imtiyazId) matchFilter.imtiyaz_id = new mongoose.Types.ObjectId(imtiyazId);

      const pipeline = [
        { $match: matchFilter },
        { $group: { _id: "$imtiyaz_id", total_balance: { $sum: "$added_balance" } } },
        { $lookup: { from: "imtiyazqruplaris", localField: "_id", foreignField: "_id", as: "imtiyazDetails" } },
        { $unwind: "$imtiyazDetails" },
        { $project: { _id: 0, imtiyazName: "$imtiyazDetails.name", total_balance: 1 } },
      ];

      balances = await AddedBalance.aggregate(pipeline);
      const total = balances.reduce((sum, b) => sum + (b.total_balance || 0), 0);

      formattedBalance = {
        labels: balances.map(b => b.imtiyazName),
        datasets: balances.map(b => b.total_balance || 0),
        total,
      };
    }

    if (pipelineTitle === "toplamOdemeler") {
      const pipeline = [
        { $match: { sirket_id, status: "completed", createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: "$card_id", total_balance: { $sum: "$added_balance" } } },
        { $lookup: { from: "cards", localField: "_id", foreignField: "_id", as: "cardsDetails" } },
        { $unwind: "$cardsDetails" },
        { $project: { _id: 0, cardsName: "$cardsDetails.name", total_balance: "$total_balance" } },
      ];

      balances = await AddedBalance.aggregate(pipeline);
      formattedBalance = {
        labels: balances.map(b => b.cardsName),
        datasets: balances.map(b => b.total_balance || 0),
        total: balances.reduce((sum, v) => sum + v.total_balance, 0),
      };
    }

    return { formattedBalance };

  } catch (err) {
    console.error("❌ Aggregate error:", err.message);
    return { formattedBalance: {} };
  }
};
