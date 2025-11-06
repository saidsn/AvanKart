import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { institutionApplicationController } from "../../controllers/avankartaz/institutionApplication.js";

const csrfProtection = csrf({ cookie: true });
const insititutionApplicationRouter = express.Router();

insititutionApplicationRouter.get('/', [verifyToken, csrfProtection], institutionApplicationController.index);

insititutionApplicationRouter.get('/create', [verifyToken, csrfProtection], institutionApplicationController.create);

insititutionApplicationRouter.get('/:slug', [verifyToken, csrfProtection], institutionApplicationController.show);

insititutionApplicationRouter.get('/:id/edit', [verifyToken, csrfProtection], institutionApplicationController.edit);

insititutionApplicationRouter.post('/', [verifyToken, csrfProtection], institutionApplicationController.store);

insititutionApplicationRouter.put('/:id', [verifyToken, csrfProtection], institutionApplicationController.update);
insititutionApplicationRouter.patch('/:id', [verifyToken, csrfProtection], institutionApplicationController.update);

insititutionApplicationRouter.delete('/:id', [verifyToken, csrfProtection], institutionApplicationController.destroy);

export default insititutionApplicationRouter;
