import ApplicationCategory from "../../../shared/model/avankartaz/applicationCategory.js";

const index = async (req, res) => {
  try {
    const {
      lang,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    // Filter object
    const filter = {};

    // Date range filter
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

    // Search filter - axtarış bütün dillərdə
    if (search) {
      filter.$or = [
        { "title.az": { $regex: search, $options: "i" } },
        { "title.tr": { $regex: search, $options: "i" } },
        { "title.en": { $regex: search, $options: "i" } },
        { "title.ru": { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await ApplicationCategory.countDocuments(filter);
    const categories = await ApplicationCategory.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    if (lang && ["az", "tr", "en", "ru"].includes(lang)) {
      const formattedCategories = categories.map((cat) => ({
        _id: cat._id,
        title: cat.title[lang],
        slug: cat.slug,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      }));

      return res.status(200).json({
        success: true,
        message: "Kateqoriyalar uğurla əldə edildi",
        data: formattedCategories,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Kateqoriyalar uğurla əldə edildi",
      data: categories,
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
      message: "Kateqoriyalar əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const show = async (req, res) => {
  try {
    const { slug } = req.params;
    const { lang } = req.query;
    const category = await ApplicationCategory.findOne({ slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kateqoriya tapılmadı",
      });
    }

    if (lang && ["az", "tr", "en", "ru"].includes(lang)) {
      return res.status(200).json({
        success: true,
        message: "Kateqoriya uğurla əldə edildi",
        data: {
          _id: category._id,
          title: category.title[lang],
          slug: category.slug,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Kateqoriya uğurla əldə edildi",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Kateqoriya əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const create = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Form məlumatları uğurla əldə edildi",
      data: {
        languages: ["az", "tr", "en", "ru"]
      }
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
    const { title, slug } = req.body;

    if (!title || !title.az || !title.tr || !title.en || !title.ru) {
      return res.status(400).json({
        success: false,
        message: "Bütün dil variantları daxil edilməlidir (az, tr, en, ru)",
      });
    }

    if (slug && slug.trim() !== "") {
      const existingCategory = await ApplicationCategory.findOne({ slug });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Bu slug artıq mövcuddur",
        });
      }
    }

    const newCategory = new ApplicationCategory({
      title,
      slug: slug || undefined,
    });

    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Kateqoriya uğurla yaradıldı",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Kateqoriya yaradılarkən xəta baş verdi",
      error: error.message,
    });
  }
};

const edit = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await ApplicationCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kateqoriya tapılmadı",
      });
    }

    res.status(200).json({
      success: true,
      message: "Kateqoriya və form məlumatları uğurla əldə edildi",
      data: {
        category,
        languages: ["az", "tr", "en", "ru"]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Kateqoriya məlumatları əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug } = req.body;

    const category = await ApplicationCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kateqoriya tapılmadı",
      });
    }

    if (slug && slug !== category.slug) {
      const existingCategory = await ApplicationCategory.findOne({ slug });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Bu slug artıq mövcuddur",
        });
      }
    }

    if (title) category.title = title;
    if (slug) category.slug = slug;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Kateqoriya uğurla yeniləndi",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Kateqoriya yenilənərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await ApplicationCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kateqoriya tapılmadı",
      });
    }

    await ApplicationCategory.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Kateqoriya uğurla silindi",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Kateqoriya silinərkən xəta baş verdi",
      error: error.message,
    });
  }
};

export const applicationCategoryController = {
  index,
  show,
  create,
  store,
  edit,
  update,
  destroy,
};
