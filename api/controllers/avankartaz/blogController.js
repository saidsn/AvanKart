import Blog from "../../../shared/model/avankartaz/blog.js";

const index = async (req, res) => {
  try {
    const {
      lang,
      category,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (lang && ["az", "tr", "en", "ru"].includes(lang)) {
      filter.lang = lang;
    }

    if (category) {
      filter.category = category;
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

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Blog.countDocuments(filter);

    const blogs = await Blog.find(filter)
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    let responseData = blogs;
    if (lang && ["az", "tr", "en", "ru"].includes(lang)) {
      responseData = blogs.map((blog) => {
        const blogObj = blog.toObject();
        if (blogObj.category && blogObj.category.title) {
          blogObj.category.title = blogObj.category.title[lang];
        }
        return blogObj;
      });
    }

    res.status(200).json({
      success: true,
      data: responseData,
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
      message: "Bloglar əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const show = async (req, res) => {
  try {
    const { slug } = req.params;
    const { lang } = req.query;
    const blog = await Blog.findOne({ slug }).populate("category");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog tapılmadı",
      });
    }

    let responseData = blog;
    if (lang && ["az", "tr", "en", "ru"].includes(lang)) {
      const blogObj = blog.toObject();
      if (blogObj.category && blogObj.category.title) {
        blogObj.category.title = blogObj.category.title[lang];
      }
      responseData = blogObj;
    }

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Blog əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const store = async (req, res) => {
  try {
    const { title, slug, lang, category, content } = req.body;

    if (!title || !lang || !category || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, lang, category və content daxil edilməlidir",
      });
    }

    if (!req.files || !req.files.coverImage || !req.files.detailImage) {
      return res.status(400).json({
        success: false,
        message: "CoverImage və detailImage yüklənməlidir",
      });
    }

    if (!["az", "tr", "en", "ru"].includes(lang)) {
      return res.status(400).json({
        success: false,
        message: "Dil yalnız az, tr, en və ya ru ola bilər",
      });
    }

    if (slug && slug.trim() !== "") {
      const existingBlog = await Blog.findOne({ slug });
      if (existingBlog) {
        return res.status(400).json({
          success: false,
          message: "Bu slug artıq mövcuddur",
        });
      }
    }

    const coverImagePath = `/image/avankartaz/${req.files.coverImage[0].filename}`;
    const detailImagePath = `/image/avankartaz/${req.files.detailImage[0].filename}`;

    const newBlog = new Blog({
      title,
      slug: slug || undefined, 
      lang,
      coverImage: coverImagePath,
      detailImage: detailImagePath,
      category,
      content,
    });

    await newBlog.save();

    const populatedBlog = await Blog.findById(newBlog._id).populate("category");

    res.status(201).json({
      success: true,
      message: "Blog uğurla yaradıldı",
      data: populatedBlog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Blog yaradılarkən xəta baş verdi",
      error: error.message,
    });
  }
};

export const blogController = {
  index,
  show,
  store,
};
