import Faq from "../../../shared/model/avankartaz/faq.js";

const index = async (req, res) => {
    try {
        const locale = req.query.lang || "az";
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const searchFilter = search
            ? {
                $or: [
                    { question: { $regex: search, $options: "i" } },
                    { answer: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const filter = {
            localization: locale,
            ...searchFilter,
        };

        const total = await Faq.countDocuments(filter);

        const faqs = await Faq.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            message: "FAQ list fetched successfully",
            data: faqs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        console.error("error:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};

const show = async (req, res) => {
    try {
        const { id } = req.params;

        const faq = await Faq.findById(id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "FAQ fetched successfully",
            data: faq,
        });
    } catch (error) {
        console.error("error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const store = async (req, res) => {
    try {
        const { question, answer, localization, category } = req.body;

        if (!question || !answer || !localization || !category) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const newFaq = new Faq({
            question,
            answer,
            localization,
            category,
        });

        await newFaq.save();

        const populatedFaq = await Faq.findById(newFaq._id);

        return res.status(201).json({
            success: true,
            message: "FAQ created successfully",
            data: populatedFaq,
        });
    } catch (error) {
        console.error("error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, localization, category } = req.body;

        const faq = await Faq.findById(id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found",
            });
        }

        if (question) faq.question = question;
        if (answer) faq.answer = answer;
        if (localization) faq.localization = localization;
        if (category) faq.category = category;

        await faq.save();

        const updatedFaq = await Faq.findById(id);

        return res.status(200).json({
            success: true,
            message: "FAQ updated successfully",
            data: updatedFaq,
        });
    } catch (error) {
        console.error("error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;

        const faq = await Faq.findById(id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found",
            });
        }

        await Faq.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "FAQ deleted successfully",
        });
    } catch (error) {
        console.error("error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const faqController = {
    index,
    show,
    store,
    update,
    destroy
};