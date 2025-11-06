import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { faqController } from "../../controllers/avankartaz/faq.js";

const csrfProtection = csrf({ cookie: true });
const faqRouter = express.Router();


faqRouter.get('/', [verifyToken, csrfProtection], faqController.index);

faqRouter.get('/list', [verifyToken, csrfProtection], faqController.list);

faqRouter.get('/create', [verifyToken, csrfProtection], faqController.create);

faqRouter.get('/:slug', [verifyToken, csrfProtection], faqController.show);

faqRouter.get('/:id/edit', [verifyToken, csrfProtection], faqController.edit);

faqRouter.post('/', [verifyToken, csrfProtection], faqController.store);

faqRouter.put('/:id', [verifyToken, csrfProtection], faqController.update);
faqRouter.patch('/:id', [verifyToken, csrfProtection], faqController.update);

faqRouter.delete('/:id', [verifyToken, csrfProtection], faqController.destroy);

export default faqRouter;
