import Blog from "../../../shared/model/avankartaz/blog.js";
import BlogCategory from "../../../shared/model/avankartaz/blogCategory.js";


const index = async (req, res) => {
  try {
    return res.render("pages/avankartaz/blog", {
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
      category,
      start_date,
      end_date,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (lang && ["az", "tr", "en", "ru"].includes(lang)) {
      filter.lang = lang;
    }

    if (category) {
      // Support both single ID and comma-separated IDs
      if (category.includes(',')) {
        // Multiple categories
        filter.category = { $in: category.split(',') };
      } else {
        // Single category
        filter.category = category;
      }
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
      message: "Bloglar uğurla əldə edildi",
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
      message: "Blog uğurla əldə edildi",
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

const create = async (req, res) => {
  try {
    const categories = await BlogCategory.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Form məlumatları uğurla əldə edildi",
      data: {
        categories,
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

const edit = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id).populate("category");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog tapılmadı",
      });
    }

    const categories = await BlogCategory.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Blog və form məlumatları uğurla əldə edildi",
      data: {
        blog,
        categories,
        languages: ["az", "tr", "en", "ru"]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Blog məlumatları əldə edilərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, lang, category, content } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog tapılmadı",
      });
    }

    if (lang && !["az", "tr", "en", "ru"].includes(lang)) {
      return res.status(400).json({
        success: false,
        message: "Dil yalnız az, tr, en və ya ru ola bilər",
      });
    }

    if (slug && slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ slug });
      if (existingBlog) {
        return res.status(400).json({
          success: false,
          message: "Bu slug artıq mövcuddur",
        });
      }
    }

    if (title) blog.title = title;
    if (slug) blog.slug = slug;
    if (lang) blog.lang = lang;
    if (category) blog.category = category;
    if (content) blog.content = content;

    if (req.files) {
      if (req.files.coverImage) {
        blog.coverImage = `/image/avankartaz/${req.files.coverImage[0].filename}`;
      }
      if (req.files.detailImage) {
        blog.detailImage = `/image/avankartaz/${req.files.detailImage[0].filename}`;
      }
    }

    await blog.save();

    const populatedBlog = await Blog.findById(blog._id).populate("category");

    res.status(200).json({
      success: true,
      message: "Blog uğurla yeniləndi",
      data: populatedBlog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Blog yenilənərkən xəta baş verdi",
      error: error.message,
    });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog tapılmadı",
      });
    }

    await Blog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Blog uğurla silindi",
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Blog silinərkən xəta baş verdi",
      error: error.message,
    });
  }
};

export const blogController = {
  index,
  list,
  show,
  create,
  store,
  edit,
  update,
  destroy,
};
