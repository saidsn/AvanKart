import CashbackFolder from "../../../../shared/models/cashbackFolder.js";
import CashBack from "../../../../shared/models/cashBackModel.js";
import CardsCategory from "../../../../shared/models/cardsCategoryModel.js";
export const getCashback = async (req, res) => {
  try {
    return res.render("pages/emeliyyatlar/avankart/cashback", {
      error: "",
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.error("delete-ticket error:", error);
    return res.status(500).send("Internal Server Error");
  }
}
export const getCashbackDetails = async (req, res) => {
  try {
    const folderId = req.params.folder_id;
    console.log("FolderId from URL:", folderId);

    if (!folderId) {
      return res.status(400).send("folder_id is missing in URL");
    }

    const rawData = await CashbackFolder.aggregate([
      { $match: { folder_id: folderId.trim() } },
      {
        $lookup: {
          from: "cashbacks",
          localField: "_id",
          foreignField: "folder_id",
          as: "cashbacks"
        }
      },
      {
        $addFields: {
          customers: { $size: { $ifNull: [{ $setUnion: ["$cashbacks.user_id", []] }, []] } },
          transactions: { $size: { $ifNull: [{ $setUnion: ["$cashbacks.transaction_id", []] }, []] } }
        }
      },
      {
        $project: {
          folder_id: 1,
          status: 1,
          total: 1,
          transactions: 1,
          createdAt: 1,
          customers: 1
        }
      }
    ]);

    if (!rawData.length) {
      return res.status(404).send("Folder not found");
    }

    const data = rawData.map(item => ({
      invoice: item.folder_id,
      customers: item.customers,
      transactions: item.transactions || 0,
      amount: item.total || 0,
      date: new Date(item.createdAt).toLocaleString("az", {
        month: "long",
        year: "numeric",
      }),
      status: item.status === "ongoing" ? "Davam edir" : "Tamamlanıb",
    }));


    return res.render("pages/emeliyyatlar/avankart/cashbackDetails", {
      error: "",
      csrfToken: req.csrfToken(),
      data: data[0]
    });

  } catch (error) {
    console.error("cashback details error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const getCashbackPost = async (req, res) => {
  try {
    const draw = req.body.draw || 1;
    const start = parseInt(req.body.start) || 0;
    const length = parseInt(req.body.length) || 10;
    const searchValue = req.body.search?.value || req.body.search || "";

    // Filter parametrləri
    const { years, months, card_status, minAmount, maxAmount } = req.body;

    let matchQuery = {};
    let dateConditions = [];

    // Axtarış filteri
    if (searchValue && searchValue.trim()) {
      matchQuery.folder_id = { $regex: searchValue.trim(), $options: "i" };
    }

    // Status filter - frontend və backend arasında mapping
    if (card_status?.length) {
      const statusMapping = {
        'continue': 'ongoing',
        'completed': 'complated'
      };
      const mappedStatuses = card_status.map(status => statusMapping[status] || status);
      matchQuery.status = { $in: mappedStatuses };
    }

    // İl filteri
    if (years?.length) {
      const yearNumbers = years.map(Number).filter(year => !isNaN(year));
      if (yearNumbers.length > 0) {
        dateConditions.push({ $in: [{ $year: "$createdAt" }, yearNumbers] });
      }
    }

    // Ay filteri - frontend "month01" formatından rəqəmə çevirmə
    if (months?.length) {
      const monthNumbers = months.map(month => {
        if (typeof month === 'string' && month.startsWith('month')) {
          return parseInt(month.replace('month', ''));
        }
        return parseInt(month);
      }).filter(month => !isNaN(month) && month >= 1 && month <= 12);
      
      if (monthNumbers.length > 0) {
        dateConditions.push({ $in: [{ $month: "$createdAt" }, monthNumbers] });
      }
    }

    // Tarix şərtlərini birləşdirmə
    if (dateConditions.length > 0) {
      matchQuery.$expr = dateConditions.length === 1 
        ? dateConditions[0] 
        : { $and: dateConditions };
    }

    // Əsas aggregation pipeline
    let pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "cashbacks",
          localField: "_id",
          foreignField: "folder_id",
          as: "cashbacks"
        }
      },
      {
        $addFields: {
          customers: { 
            $size: { 
              $ifNull: [
                { $setUnion: [{ $ifNull: ["$cashbacks.user_id", []] }, []] }, 
                []
              ] 
            } 
          },
          transactions: { 
            $size: { $ifNull: ["$cashbacks", []] } 
          },
          totalFilteredAmount: { 
            $sum: { $ifNull: ["$cashbacks.amount", 0] } 
          }
        }
      }
    ];

    // Məbləğ aralığı filteri
    if (minAmount != null && maxAmount != null) {
      const min = parseFloat(minAmount);
      const max = parseFloat(maxAmount);
      if (!isNaN(min) && !isNaN(max)) {
        pipeline.push({
          $match: { 
            $or: [
              { totalFilteredAmount: { $gte: min, $lte: max } },
              { total: { $gte: min, $lte: max } }
            ]
          }
        });
      }
    }

    // Filterlənmiş record sayını almaq üçün ayrı sorgu
    const countPipeline = [...pipeline];
    const countResult = await CashbackFolder.aggregate([
      ...countPipeline,
      { $count: "total" }
    ]);
    const totalFiltered = countResult.length > 0 ? countResult[0].total : 0;

    // Pagination və projection əlavə etmə
    pipeline.push(
      { $skip: start },
      { $limit: length },
      {
        $project: {
          folder_id: 1,
          status: 1,
          total: 1,
          transactions: 1,
          createdAt: 1,
          customers: 1,
          totalFilteredAmount: 1
        }
      }
    );

    // Data əldə etmə
    const rawData = await CashbackFolder.aggregate(pipeline);

    // Total amount aggregation (filterlənməmiş data üçün)
    const totalAmounts = await CashbackFolder.aggregate([
      { $group: { _id: "$status", total: { $sum: "$total" } } }
    ]);

    let totalOngoing = 0;
    let totalComplated = 0;
    totalAmounts.forEach(t => {
      if (t._id === "ongoing") totalOngoing = t.total;
      if (t._id === "complated") totalComplated = t.total;
    });

    // Data formatlama
    const data = rawData.map(item => ({
      invoice: item.folder_id,
      customers: item.customers || 0,
      transactions: item.transactions || 0,
      amount: item.total || 0,
      date: new Date(item.createdAt).toLocaleString("az", {
        month: "long",
        year: "numeric",
      }),
      status: item.status === "ongoing" ? "Davam edir" : "Tamamlanıb",
    }));

    const totalRecords = await CashbackFolder.countDocuments();
    const totalPages = Math.ceil(totalFiltered / length);

    res.json({
      draw: parseInt(draw),
      recordsTotal: totalRecords,
      recordsFiltered: totalFiltered,
      totalPages,
      data,
      totalAmount: {
        ongoing: totalOngoing,
        complated: totalComplated
      }
    });

  } catch (error) {
    console.error("cashback post error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
};


export const getCashbackDetailsPost = async (req, res) => {
  try {
    const { folder_id } = req.params;
    // Folder tapırıq
    const folder = await CashbackFolder.findOne({ folder_id: folder_id.trim() });
    if (!folder) return res.status(404).send("Folder not found");

    const folderObjectId = folder._id;

    const draw = parseInt(req.body.draw) || 1;
    const start = parseInt(req.body.start) || 0;
    const length = parseInt(req.body.length) || 10;
    const searchValue = req.body.search || "";

    const pipeline = [
      { $match: { folder_id: folderObjectId } },
      { $sort: { createdAt: -1 } },
      { $skip: start },
      { $limit: length },

      // PeopleUser join
      {
        $lookup: {
          from: "peopleusers",
          let: { userId: "$user_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            { $project: { people_id: 1, name: 1, surname: 1 } }
          ],
          as: "user"
        }
      },
      { $addFields: { user: { $arrayElemAt: ["$user", 0] } } },

      // Transaction join
      {
        $lookup: {
          from: "transactionsusers",
          let: { transactionId: "$transaction_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$transactionId"] } } },
            { $project: { transaction_id: 1, cardCategory: 1, hesablasma_id: 1 } }
          ],
          as: "transaction"
        }
      },
      { $addFields: { transaction: { $arrayElemAt: ["$transaction", 0] } } },

      // CardCategory join
      {
        $lookup: {
          from: "cardscategories",
          let: { cardCategoryId: "$transaction.cardCategory" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$cardCategoryId"] } } },
            { $project: { name: 1 } }
          ],
          as: "cardCategory"
        }
      },
      { $addFields: { cardCategory: { $arrayElemAt: ["$cardCategory.name", 0] } } },

      // Hesablasma join 
      {
        $lookup: {
          from: "hesablasmas",
          let: { hesablasmaId: "$transaction.hesablasma_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$hesablasmaId"] } } },
            { $project: { end_date: 1 } }
          ],
          as: "hesablasma"
        }
      },
      { $addFields: { hesablasma: { $arrayElemAt: ["$hesablasma.end_date", 0] } } }
    ];

    // Search filter
    if (searchValue) {
      pipeline.push({
        $match: {
          $or: [
            { "user.people_id": { $regex: searchValue, $options: "i" } },
            { "user.name": { $regex: searchValue, $options: "i" } },
            { "user.surname": { $regex: searchValue, $options: "i" } }
          ]
        }
      });
    }

    const rawData = await CashBack.aggregate(pipeline);

    const totalRecords = await CashBack.countDocuments({ folder_id: folderObjectId });

    const data = rawData.map(item => ({
      user: {
        user: item.user ? `${item.user.name || ""} ${item.user.surname || ""}`.trim() : "",
        userId: item.user ? item.user.people_id : ""
      },
      transactionId: item.transaction ? item.transaction.transaction_id : "",
      cardCategory: item.cardCategory || "",
      amount: item.from_amount || 0,
      settlementDate: item.hesablasma
        ? new Date(item.hesablasma).toLocaleString("az", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        })
        : ""
    }));

    res.json({
      draw,
      recordsTotal: totalRecords,
      recordsFiltered: totalRecords,
      data
    });

  } catch (error) {
    console.error("cashback details post error:", error);
    return res.status(500).send("Internal Server Error.");
  }
};

export const getCardCategories = async (req, res) => {
    try {
        const categories = await CardCategory.find({}, 'name'); // yalnız name
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

