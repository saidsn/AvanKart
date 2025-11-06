import ApplicationCategory from "../../../shared/model/avankartaz/applicationCategory.js";

const index = async (req, res) => {
  try {
    const { lang } = req.query;
    const categories = await ApplicationCategory.find().sort({ createdAt: -1 });

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
        data: formattedCategories,
      });
    }

    res.status(200).json({
      success: true,
      data: categories,
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

export const applicationCategoryController = {
  index,
  show,
  store,
};
