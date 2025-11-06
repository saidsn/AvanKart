import BlogCategory from "../../../shared/model/avankartaz/blogCategory.js";

const index = async (req, res) => {
  try {
    return res.render("pages/avankartaz/blogCategory", {
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
      lang,
      start_date,
      end_date,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

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

    if (search) {
      // Search in all language fields
      filter.$or = [
        { 'title.az': { $regex: search, $options: 'i' } },
        { 'title.tr': { $regex: search, $options: 'i' } },
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.ru': { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await BlogCategory.countDocuments(filter);

    const categories = await BlogCategory.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    let responseData = categories;
    if (lang && ["az", "tr", "en", "ru"].includes(lang)) {
      responseData = categories.map((cat) => {
        const catObj = cat.toObject();
        return {
          _id: catObj._id,
          title: catObj.title[lang] || catObj.title,
          titleFull: catObj.title, // Keep full title for edit
          slug: catObj.slug,
          createdAt: catObj.createdAt,
          updatedAt: catObj.updatedAt,
        };
      });
    }

    res.status(200).json({
      success: true,
      message: "Kateqoriyalar uğurla əldə edildi",
      data: responseData,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
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
    const category = await BlogCategory.findOne({ slug });

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
      const existingCategory = await BlogCategory.findOne({ slug });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Bu slug artıq mövcuddur",
        });
      }
    }

    const newCategory = new BlogCategory({
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

    const category = await BlogCategory.findById(id);

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

    const category = await BlogCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kateqoriya tapılmadı",
      });
    }

    if (slug && slug !== category.slug) {
      const existingCategory = await BlogCategory.findOne({ slug });
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

    const category = await BlogCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kateqoriya tapılmadı",
      });
    }

    await BlogCategory.findByIdAndDelete(id);

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

export const blogCategoryController = {
  index,
  list,
  show,
  create,
  store,
  edit,
  update,
  destroy,
};
