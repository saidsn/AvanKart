import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { companyApplicationController } from "../../controllers/avankartaz/companyApplication.js";

const csrfProtection = csrf({ cookie: true });
const companyApplicationRouter = express.Router();

companyApplicationRouter.get('/', [verifyToken, csrfProtection], companyApplicationController.index);

companyApplicationRouter.get('/create', [verifyToken, csrfProtection], companyApplicationController.create);

companyApplicationRouter.get('/:slug', [verifyToken, csrfProtection], companyApplicationController.show);

companyApplicationRouter.get('/:id/edit', [verifyToken, csrfProtection], companyApplicationController.edit);

companyApplicationRouter.post('/', [verifyToken, csrfProtection], companyApplicationController.store);

companyApplicationRouter.put('/:id', [verifyToken, csrfProtection], companyApplicationController.update);
companyApplicationRouter.patch('/:id', [verifyToken, csrfProtection], companyApplicationController.update);

companyApplicationRouter.delete('/:id', [verifyToken, csrfProtection], companyApplicationController.destroy);

export default companyApplicationRouter;
