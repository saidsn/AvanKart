import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { muracietlerController } from "../../controllers/avankartaz/muracietler.js";

const csrfProtection = csrf({ cookie: true });
const muracietlerRouter = express.Router();

muracietlerRouter.get('/', [verifyToken, csrfProtection], muracietlerController.index);

export default muracietlerRouter;
