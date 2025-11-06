import ApplicationCategory from "../../../shared/model/avankartaz/applicationCategory.js";

const index = async (req, res) => {
  try {
    const categories = await ApplicationCategory.find().sort({ createdAt: -1 });

    // Kateqoriyaları Azərbaycan dilində formatlayırıq
    const formattedCategories = categories.map(cat => ({
      _id: cat._id,
      title: cat.title.az || cat.title.en || cat.title.tr || cat.title.ru,
      titleAll: cat.title
    }));

    res.render("pages/avankartaz/muracietler", {
      layout: "./layouts/main.ejs",
      title: "Müraciətlər",
      csrfToken: req.csrfToken(),
      currentPath: req.path,
      categories: formattedCategories
    });
  } catch (error) {
    console.error("Müraciətlər səhifəsi yüklənərkən xəta:", error);
    res.status(500).render("error", {
      layout: "./layouts/main.ejs",
      message: "Səhifə yüklənərkən xəta baş verdi",
      error: error
    });
  }
};

export const muracietlerController = {
  index
};
