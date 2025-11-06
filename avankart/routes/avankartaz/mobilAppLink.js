import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { mobileAppLinkController } from "../../controllers/avankartaz/mobileAppLink.js";
import upload from "../../middlewares/uploadAvankartaz.js";

const csrfProtection = csrf({ cookie: true });
const mobileAppLinkRouter = express.Router();

mobileAppLinkRouter.get('/', [verifyToken, csrfProtection], mobileAppLinkController.index);

mobileAppLinkRouter.get('/list', [verifyToken, csrfProtection], mobileAppLinkController.list);

mobileAppLinkRouter.get('/create', [verifyToken, csrfProtection], mobileAppLinkController.create);

mobileAppLinkRouter.get('/:slug', [verifyToken, csrfProtection], mobileAppLinkController.show);

mobileAppLinkRouter.get('/:id/edit', [verifyToken, csrfProtection], mobileAppLinkController.edit);

mobileAppLinkRouter.post('/', [verifyToken, csrfProtection, upload.single('icon')], mobileAppLinkController.store);

mobileAppLinkRouter.put('/:id', [verifyToken, csrfProtection], mobileAppLinkController.update);
mobileAppLinkRouter.patch('/:id', [verifyToken, csrfProtection], mobileAppLinkController.update);

mobileAppLinkRouter.delete('/:id', [verifyToken, csrfProtection], mobileAppLinkController.destroy);

export default mobileAppLinkRouter;
