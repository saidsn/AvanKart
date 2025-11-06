import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { contactMethodController } from "../../controllers/avankartaz/contactMethod.js";
import upload from "../../middlewares/uploadAvankartaz.js";

const csrfProtection = csrf({ cookie: true });
const contactMethodRouter = express.Router();

contactMethodRouter.get('/', [verifyToken, csrfProtection], contactMethodController.index);

contactMethodRouter.get('/list', [verifyToken, csrfProtection], contactMethodController.list);

contactMethodRouter.get('/create', [verifyToken, csrfProtection], contactMethodController.create);

contactMethodRouter.get('/:slug', [verifyToken, csrfProtection], contactMethodController.show);

contactMethodRouter.get('/:id/edit', [verifyToken, csrfProtection], contactMethodController.edit);

contactMethodRouter.post('/', [verifyToken, csrfProtection, upload.single('icon')], contactMethodController.store);

contactMethodRouter.put('/:id', [verifyToken, csrfProtection], contactMethodController.update);
contactMethodRouter.patch('/:id', [verifyToken, csrfProtection], contactMethodController.update);

contactMethodRouter.delete('/:id', [verifyToken, csrfProtection], contactMethodController.destroy);

export default contactMethodRouter;
