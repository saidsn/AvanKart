export const deleteTicket = async (req, res) => {
    try {
        return res.render("deleteTicket", {
            error: "",
            csrfToken: req.csrfToken(),
            layout: "./layouts/auth",
        });
    } catch (error) {
        console.error("delete-ticket error:", error);
        return res.status(500).send("Internal Server Error");
    }
}

export const deleteTicketPost = async (req, res) => {
    try {
        const { email = "", message = "" } = req.body;

        const cleanedEmail = email.trim();
        const cleanedMessage = message.trim();
        const errors = [];

        if (!cleanedEmail || !cleanedMessage) {
            errors.push("Email və mesaj boş ola bilməz.");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanedEmail)) {
            errors.push("Email formatı düzgün deyil.");
        }
        if (errors.length > 0) {
            return res.render("deleteTicket", {
                error: errors.join(" "),
                csrfToken: req.csrfToken(),
                layout: "./layouts/auth",
            });
        }

        return res.render("deleteTicket", {
            success: "Əlaqə saxlayacağıq və silmə prosesi haqqında məlumat verəcəyik.",
            error: "",
            csrfToken: req.csrfToken(),
            layout: "./layouts/auth",
        });
    } catch (error) {
        console.error("delete-ticket-post error:", error);
        return res.status(500).send("Internal Server Error");
    }
}