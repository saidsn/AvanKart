import AdminUser from "../../../shared/models/adminUsersModel.js";
import argon2 from 'argon2';

export const changePasswordDetails = async (req, res) => {
    const { old_password, new_password } = req.body;
    const userId = req.user.id;

    try {
        const user = await AdminUser.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: "User Not Found.",
                csrfToken: req.csrfToken(),
            });
        }


        const comparePass = await argon2.verify(user.password, old_password);
        if (!comparePass) {
            return res.status(400).json({
                error: "Username and password is wrong",
                csrfToken: req.csrfToken(),
            });
        }

        const hashedPass = await argon2.hash(new_password);
        user.password = hashedPass;
        await user.save();

        return res.status(200).json({
            message: "Login successful",
            success: true,
            csrfToken: req.csrfToken(),
            redirect: "/settings",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to change password. Please try again.",
            csrfToken: req.csrfToken(),
        });
    }
}