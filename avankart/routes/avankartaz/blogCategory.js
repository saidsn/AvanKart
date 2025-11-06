import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { blogCategoryController } from "../../controllers/avankartaz/blogCategory.js";

const csrfProtection = csrf({ cookie: true });
const blogCategoryRouter = express.Router();

blogCategoryRouter.get('/', [verifyToken, csrfProtection], blogCategoryController.index);

blogCategoryRouter.get('/list', [verifyToken, csrfProtection], blogCategoryController.list);

blogCategoryRouter.get('/create', [verifyToken, csrfProtection], blogCategoryController.create);

blogCategoryRouter.get('/:slug', [verifyToken, csrfProtection], blogCategoryController.show);

blogCategoryRouter.get('/:id/edit', [verifyToken, csrfProtection], blogCategoryController.edit);

blogCategoryRouter.post('/', [verifyToken, csrfProtection], blogCategoryController.store);

blogCategoryRouter.put('/:id', [verifyToken, csrfProtection], blogCategoryController.update);
blogCategoryRouter.patch('/:id', [verifyToken, csrfProtection], blogCategoryController.update);

blogCategoryRouter.delete('/:id', [verifyToken, csrfProtection], blogCategoryController.destroy);

export default blogCategoryRouter;
