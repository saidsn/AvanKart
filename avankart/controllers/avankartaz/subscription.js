import Subscription from "../../../shared/model/avankartaz/subscription.js";

const index = async (req, res) => {
  try {
    return res.render("pages/avankartaz/abunelikler", {
      error: "",
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const list = async (req, res) => {
  try {
    const {
      search,
      start_date,
      end_date,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (search) {
      filter.email = { $regex: search, $options: "i" };
    }

    if (start_date || end_date) {
      filter.createdAt = {};
      if (start_date) {
        filter.createdAt.$gte = new Date(start_date);
      }
      if (end_date) {
        const end = new Date(end_date);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    console.log('Subscription list filters:', JSON.stringify(filter, null, 2));
    console.log('Date range:', { start_date, end_date });

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
      message: "Abunəliklər uğurla əldə edildi",
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
      message: "Abunəlik uğurla əldə edildi",
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

const create = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Form məlumatları uğurla əldə edildi",
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Form məlumatları əldə edilərkən xəta baş verdi",
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

const edit = async (req, res) => {
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
      message: "Abunəlik və form məlumatları uğurla əldə edildi",
      data: {
        subscription
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Abunəlik məlumatları əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Abunəlik tapılmadı",
      });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Düzgün email formatı daxil edin",
        });
      }

      const existingSubscription = await Subscription.findOne({ email });
      if (existingSubscription && existingSubscription._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: "Bu email artıq abunə olub",
        });
      }

      subscription.email = email;
    }

    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Abunəlik uğurla yeniləndi",
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Abunəlik yenilənərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Abunəlik tapılmadı",
      });
    }

    await Subscription.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Abunəlik uğurla silindi",
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Abunəlik silinərkən xəta baş verdi",
      error: error.message,
    });
  }
};

export const subscriptionController = {
  index,
  list,
  show,
  create,
  store,
  edit,
  update,
  destroy,
};
