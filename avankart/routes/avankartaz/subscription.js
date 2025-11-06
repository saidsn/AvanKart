import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { subscriptionController } from "../../controllers/avankartaz/subscription.js";

const csrfProtection = csrf({ cookie: true });
const subscriptionRouter = express.Router();

subscriptionRouter.get('/', [verifyToken, csrfProtection], subscriptionController.index);

subscriptionRouter.get('/list', [verifyToken, csrfProtection], subscriptionController.list);

subscriptionRouter.get('/create', [verifyToken, csrfProtection], subscriptionController.create);

subscriptionRouter.get('/:slug', [verifyToken, csrfProtection], subscriptionController.show);

subscriptionRouter.get('/:id/edit', [verifyToken, csrfProtection], subscriptionController.edit);

subscriptionRouter.post('/', [verifyToken, csrfProtection], subscriptionController.store);

subscriptionRouter.put('/:id', [verifyToken, csrfProtection], subscriptionController.update);
subscriptionRouter.patch('/:id', [verifyToken, csrfProtection], subscriptionController.update);

subscriptionRouter.delete('/:id', [verifyToken, csrfProtection], subscriptionController.destroy);

export default subscriptionRouter;
