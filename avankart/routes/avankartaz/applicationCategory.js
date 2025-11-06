import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { applicationCategoryController } from "../../controllers/avankartaz/applicationCategory.js";

const csrfProtection = csrf({ cookie: true });
const applicationCategoryRouter = express.Router();

applicationCategoryRouter.get('/', [verifyToken, csrfProtection], applicationCategoryController.index);

applicationCategoryRouter.get('/create', [verifyToken, csrfProtection], applicationCategoryController.create);

applicationCategoryRouter.get('/:slug', [verifyToken, csrfProtection], applicationCategoryController.show);

applicationCategoryRouter.get('/:id/edit', [verifyToken, csrfProtection], applicationCategoryController.edit);

applicationCategoryRouter.post('/', [verifyToken, csrfProtection], applicationCategoryController.store);

applicationCategoryRouter.put('/:id', [verifyToken, csrfProtection], applicationCategoryController.update);
applicationCategoryRouter.patch('/:id', [verifyToken, csrfProtection], applicationCategoryController.update);

applicationCategoryRouter.delete('/:id', [verifyToken, csrfProtection], applicationCategoryController.destroy);

export default applicationCategoryRouter;
