export const getProfile = async (req, res) => {
    try {
        return res.render("pages/avankartProfile/avankart-profili", {
            error: "",
            csrfToken: req.csrfToken(),
        });
    } catch (error) {
        console.error("delete-ticket error:", error);
        return res.status(500).send("Internal Server Error");
    }
}