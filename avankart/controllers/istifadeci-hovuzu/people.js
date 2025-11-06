export const getPeople = async (req, res) => {
    try {
        return res.render("pages/istifadeci-hovuzu/people/people.ejs", {
            error: "",
            csrfToken: req.csrfToken(),
        });
    } catch (error) {
        console.error("delete-ticket error:", error);
        return res.status(500).send("Internal Server Error");
    }
}

export const getPeopleInside = async (req, res) => {
    try {
        const { people_id } = req.params;
        return res.render("pages/istifadeci-hovuzu/people/inside.ejs", {
            error: "",
            csrfToken: req.csrfToken(),
            people_id, // view üçün hidden input-a ötürülür
        });
    } catch (error) {
        console.error("delete-ticket error:", error);
        return res.status(500).send("Internal Server Error");
    }
}