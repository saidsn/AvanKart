import TransactionsUser from "../../../shared/models/transactionsModel.js";
import Card from "../../../shared/models/cardModel.js";
import mongoose from "mongoose";
import Hesablasma from "../../../shared/model/partner/Hesablasma.js";
import Cards from "../../../shared/models/cardModel.js";
import i18n from "i18n";

export const createDemoData = async () => {
  if (process.env.NODE_ENV === "development") {
    try {
      const fakeCategoryId = new mongoose.Types.ObjectId();
      const fakeCreatorId = new mongoose.Types.ObjectId();
      const fakeFromId = new mongoose.Types.ObjectId();
      const fakeToId = new mongoose.Types.ObjectId();

      // Kartları yoxla, yoxdursa yarat
      let yemekKart = await Card.findOne({ name: "Yemək kartı" });
      if (!yemekKart) {
        yemekKart = await Card.create({
          name: "Yemək kartı",
          background_color: "#ffffff",
          icon: "food-icon",
          description: "Test yemək kartı",
          category: fakeCategoryId,
          creator: fakeCreatorId,
          status: "active",
        });
      }

      let yanacaqKart = await Card.findOne({ name: "Yanacaq kartı" });
      if (!yanacaqKart) {
        yanacaqKart = await Card.create({
          name: "Yanacaq kartı",
          background_color: "#ffffff",
          icon: "fuel-icon",
          description: "Test yanacaq kartı",
          category: fakeCategoryId,
          creator: fakeCreatorId,
          status: "active",
        });
      }

      // Əgər artıq transaction-lar varsa, təkrar yaratma
      const existing = await TransactionsUser.find({
        invoice: "MINV-12345678",
      });
      if (existing.length === 0) {
        await TransactionsUser.create([
          {
            invoice: "MINV-12345678",
            amount: 200,
            comission: 5,
            cards: yemekKart._id,
            status: "success",
            from: fakeFromId,
            to: fakeToId,
          },
          {
            invoice: "MINV-12345678",
            amount: 300,
            comission: 5,
            cards: yemekKart._id,
            status: "success",
            from: fakeFromId,
            to: fakeToId,
          },
          {
            invoice: "MINV-12345678",
            amount: 400,
            comission: 5,
            cards: yanacaqKart._id,
            status: "success",
            from: fakeFromId,
            to: fakeToId,
          },
        ]);
        console.log("✅ Demo kartlar və transaction-lar yaradıldı!");
      }
    } catch (error) {
      console.log("Demo data yaratmaqda xəta:", error);
    }
  }
};

const runDemoData = async () => {
  await createDemoData();
};

runDemoData();

// ✅ Details controller
export const details = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Hesablaşma məlumatlarını tap
    let hesablasma = await Hesablasma.findOne({ hesablasma_id: invoiceId });

    if (!hesablasma) {
      // Əgər hesablaşma tapılmasa, demo data yaradırıq
      hesablasma = {
        _id: new mongoose.Types.ObjectId(),
        hesablasma_id: invoiceId,
        status: i18n.__('hesablasmalar.status_list.wait')
      };
    }

    // Transaction-ları tap
    const transactions = await TransactionsUser.find({
      hesablasma_id: hesablasma._id,
    }).populate("cards");

    // Əgər transaction tapılmasa, demo data ilə davam et
    let transactionData = transactions;

    // Ümumi məlumatlar
    const totalTransactions = transactionData.length;
    const totalAmount = transactionData.reduce((sum, t) => sum + t.amount, 0);
    const totalCommission = transactionData.reduce(
      (sum, t) => sum + (t.amount * t.comission) / 100,
      0
    );
    const totalNetAmount = totalAmount - totalCommission;

    // Kartlara görə breakdown (komissiya çıxarılmış)
    const cardStats = {};
    for (const tx of transactionData) {
      const cardId = tx.cards?._id?.toString() || "unknown";
      const cardName = tx.cards?.name || "Naməlum kart";

      if (!cardStats[cardId]) {
        cardStats[cardId] = {
          cardId,
          cardName,
          count: 0,
          totalAmount: 0,
          totalNetAmount: 0,
        };
      }

      const netAmount = tx.amount * (1 - tx.comission / 100);

      cardStats[cardId].count += 1;
      cardStats[cardId].totalAmount += tx.amount;
      cardStats[cardId].totalNetAmount += netAmount;
    }

    // Faizləri hesabla
    const cardBreakdownWithPercentage = Object.values(cardStats).map(card => {
      const percentage = totalNetAmount > 0 ? ((card.totalNetAmount / totalNetAmount) * 100) : 0;
      return {
        ...card,
        percentage: percentage.toFixed(0), // Yuvarlaqlaşdırılmış faiz
        formattedAmount: card.totalNetAmount.toFixed(2)
      };
    });

    // Transaction-ları komissiya çıxarılmış şəkildə hazırla
    const processedTransactions = transactionData.map(tx => ({
      hesablasma_id: tx._id,
      sender: tx.cards?.name || "Naməlum kart",
      amount: (tx.amount * (1 - tx.comission / 100)).toFixed(2), // Komissiya çıxarılmış məbləğ
      date: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('az-AZ') : new Date().toLocaleDateString('az-AZ'),
      originalAmount: tx.amount,
      commission: tx.comission
    }));

    // Hesablaşma məlumatları (komissiya çıxarılmış)
    const hesablasmaData = {
      invoice: invoiceId,
      transactions: totalTransactions,
      amount: totalNetAmount.toFixed(2), // Komissiya çıxarılmış toplam
      commission: totalCommission.toFixed(2),
      total: totalNetAmount.toFixed(2),
      date: hesablasma.createdAt ? new Date(hesablasma.createdAt).toLocaleDateString('az-AZ') : new Date().toLocaleDateString('az-AZ'),
      status: hesablasma.status || "Gözləyir"
    };

    // Bütün kartlar - category populate YOX
    const allCards = await Cards.find({ status: "active" }).sort({ name: 1 });


    return res.render("pages/hesablasmalar/inside.ejs", {
      invoice: invoiceId,
      totalTransactions,
      data: [hesablasmaData], // Array şəklində göndər
      item: hesablasmaData,
      hesablasma: hesablasmaData,
      allCards,
      transactions: processedTransactions,
      totalAmount: totalNetAmount,
      recordsFiltered: totalTransactions,
      recordsTotal: totalTransactions,
      totalCommission,
      totalNetAmount,
      cardBreakdown: cardBreakdownWithPercentage,
      muessise_id: hesablasma._id, // DataTable üçün
      csrfToken: req.csrfToken()
    });
  } catch (error) {
    console.error("Xəta baş verdi:", error);
    res.status(500).json({ message: "Server xətası" });
  }
};

// DataTable üçün POST endpoint
export const detailsDataTable = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { 
      draw, 
      start = 0, 
      length = 10, 
      search,
      cards = [], // 🔥 Filter cards
      min_amount, // 🔥 Filter min amount
      max_amount  // 🔥 Filter max amount
    } = req.body;


    // Hesablaşma məlumatlarını tap
    let hesablasma = await Hesablasma.findOne({ hesablasma_id: invoiceId });

    if (!hesablasma) {
      // Əgər hesablaşma tapılmasa, demo data yaradırıq
      hesablasma = {
        _id: new mongoose.Types.ObjectId(),
        hesablasma_id: invoiceId,
        status: "Gözləyir"
      };
    }

    // 🔥 MongoDB aggregate pipeline istifadə edək ki, filtrlər düzgün işləsin
    const aggregatePipeline = [
      {
        $match: {
          hesablasma_id: hesablasma._id,
          deleted: false,
          status: "success", // Yalnız müvəffəqiyyətli tranzaksiyalar
        }
      },
      
      // 🔥 Cards populate
      {
        $lookup: {
          from: "cards",
          localField: "cards",
          foreignField: "_id",
          as: "cardInfo"
        }
      },
      
      // 🔥 Card məlumatını sadələşdir
      {
        $addFields: {
          card: { $arrayElemAt: ["$cardInfo", 0] },
          // Net amount hesabla (komissiya çıxılmış)
          netAmount: {
            $subtract: [
              "$amount",
              { $divide: [{ $multiply: ["$amount", "$comission"] }, 100] }
            ]
          }
        }
      },

      // 🔥 Cards filtri
      ...(Array.isArray(cards) && cards.length > 0 ? [
        {
          $match: {
            cards: { $in: cards.map(id => new mongoose.Types.ObjectId(id)) }
          }
        }
      ] : []),

      // 🔥 Amount range filtri
      {
        $match: {
          ...(min_amount !== undefined && min_amount !== null && min_amount !== ""
            ? { netAmount: { $gte: parseFloat(min_amount) } }
            : {}),
          ...(max_amount !== undefined && max_amount !== null && max_amount !== ""
            ? { netAmount: { $lte: parseFloat(max_amount) } }
            : {}),
        }
      },

      // 🔥 Search filtri
      ...(search && search.value ? [
        {
          $match: {
            $or: [
              { transaction_id: { $regex: search.value, $options: 'i' } },
              { "card.name": { $regex: search.value, $options: 'i' } },
              { subject: { $regex: search.value, $options: 'i' } },
            ]
          }
        }
      ] : []),

      // Sort
      {
        $sort: { createdAt: -1 }
      },

      // Count total və pagination
      {
        $facet: {
          paginatedResults: [
            { $skip: parseInt(start) },
            { $limit: parseInt(length) },
            {
              $project: {
                transaction_id: 1,
                amount: 1,
                netAmount: 1,
                comission: 1,
                createdAt: 1,
                card: {
                  _id: "$card._id",
                  name: "$card.name",
                  background_color: "$card.background_color",
                  icon: "$card.icon"
                },
                subject: 1
              }
            }
          ],
          totalCounts: [{ $count: "count" }]
        }
      }
    ];

    const [result] = await TransactionsUser.aggregate(aggregatePipeline);
    
    const paginatedTransactions = result?.paginatedResults || [];
    const recordsFiltered = result?.totalCounts?.[0]?.count || 0;
    
    // Total records (filtering olmadan)
    const recordsTotal = await TransactionsUser.countDocuments({
      hesablasma_id: hesablasma._id,
      deleted: false,
      status: "success"
    });

    // 🔥 DataTable formatında data hazırla - indi card obyektini də daxil edirik
    const data = paginatedTransactions.map(tx => ({
      id: tx.transaction_id,
      cardName: tx.card?.name || "Naməlum kart",
      // 🔥 Card obyektini qaytarırıq
      card: tx.card ? {
        _id: tx.card._id,
        name: tx.card.name,
        background_color: tx.card.background_color,
        icon: tx.card.icon
      } : null,
      amount: (tx.netAmount || 0).toFixed(2),
      createdAt: tx.createdAt
        ? new Date(tx.createdAt).toLocaleDateString("az-AZ")
        : "Tarix yoxdur"
    }));

    const response = {
      draw: parseInt(draw),
      recordsTotal,
      recordsFiltered,
      data
    };

    

    res.json(response);
  } catch (error) {
    console.error("DataTable xətası:", error);
    res.status(500).json({
      draw: parseInt(req.body.draw) || 1,
      recordsTotal: 0,
      recordsFiltered: 0,
      data: [],
      error: "Server xətası"
    });
  }
};

// export const detailsPost = (req, res) => {

// };
