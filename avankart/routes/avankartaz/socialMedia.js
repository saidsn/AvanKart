import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { socialMediaController } from "../../controllers/avankartaz/socialMedia.js";
import upload from "../../middlewares/uploadAvankartaz.js";

const csrfProtection = csrf({ cookie: true });
const socialMediaRouter = express.Router();

socialMediaRouter.get('/', [verifyToken, csrfProtection], socialMediaController.index);

socialMediaRouter.get('/list', [verifyToken, csrfProtection], socialMediaController.list);

socialMediaRouter.get('/create', [verifyToken, csrfProtection], socialMediaController.create);

socialMediaRouter.get('/:slug', [verifyToken, csrfProtection], socialMediaController.show);

socialMediaRouter.get('/:id/edit', [verifyToken, csrfProtection], socialMediaController.edit);

socialMediaRouter.post('/', [verifyToken, csrfProtection, upload.single('icon')], socialMediaController.store);

socialMediaRouter.put('/:id', [verifyToken, csrfProtection], socialMediaController.update);
socialMediaRouter.patch('/:id', [verifyToken, csrfProtection], socialMediaController.update);

socialMediaRouter.delete('/:id', [verifyToken, csrfProtection], socialMediaController.destroy);

export default socialMediaRouter;
