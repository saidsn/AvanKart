import Subscription from "../../../shared/model/avankartaz/subscription.js";

const index = async (req, res) => {
  try {
    const {
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (search) {
      filter.email = { $regex: search, $options: "i" };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Subscription.countDocuments(filter);

    const subscriptions = await Subscription.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: subscriptions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Abunəliklər əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const show = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Abunəlik tapılmadı",
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Abunəlik əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const store = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email daxil edilməlidir",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Düzgün email formatı daxil edin",
      });
    }

    const existingSubscription = await Subscription.findOne({ email });
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: "Bu email artıq abunə olub",
      });
    }

    const newSubscription = new Subscription({
      email,
    });

    await newSubscription.save();

    res.status(201).json({
      success: true,
      message: "Abunəlik uğurla yaradıldı",
      data: newSubscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Abunəlik yaradılarkən xəta baş verdi",
      error: error.message,
    });
  }
};

export const subscriptionController = {
  index,
  show,
  store,
};
