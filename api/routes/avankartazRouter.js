import express from "express";
import { faqController } from "../controllers/avankartaz/faqController.js";
import { blogCategoryController } from "../controllers/avankartaz/blogCategoryController.js";
import { blogController } from "../controllers/avankartaz/blogController.js";
import { uploadController } from "../controllers/avankartaz/uploadController.js";
import { applicationCategoryController } from "../controllers/avankartaz/applicationCategoryController.js";
import { companyApplicationController } from "../controllers/avankartaz/companyApplicationController.js";
import { institutionApplicationController } from "../controllers/avankartaz/institutionApplicationController.js";
import { subscriptionController } from "../controllers/avankartaz/subscriptionController.js";
import { socialMediaController } from "../controllers/avankartaz/socialMediaController.js";
import { contactMethodController } from "../controllers/avankartaz/contactMethodController.js";
import { mobileAppLinkController } from "../controllers/avankartaz/mobileAppLinkController.js";
import upload from "../middleware/uploadAvankartaz.js";

const router = express.Router();

router.get('/faqs', faqController.index);
router.get('/faqs/:id', faqController.show);
router.post('/faqs', faqController.store);
router.put('/faqs/:id', faqController.update);
router.delete('/faqs/:id', faqController.destroy);

router.get('/blog-categories', blogCategoryController.index);
router.get('/blog-categories/:slug', blogCategoryController.show);
router.post('/blog-categories', blogCategoryController.store);

router.get('/blogs', blogController.index);
router.get('/blogs/:slug', blogController.show);
router.post('/blogs', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'detailImage', maxCount: 1 }
]), blogController.store);

router.post('/upload-image', upload.single('image'), uploadController.uploadSingle);
router.post('/upload-images', upload.array('images', 10), uploadController.uploadMultiple);

router.get('/application-categories', applicationCategoryController.index);
router.get('/application-categories/:slug', applicationCategoryController.show);
router.post('/application-categories', applicationCategoryController.store);

router.get('/company-applications', companyApplicationController.index);
router.get('/company-applications/:id', companyApplicationController.show);
router.post('/company-applications', companyApplicationController.store);

router.get('/institution-applications', institutionApplicationController.index);
router.get('/institution-applications/:id', institutionApplicationController.show);
router.post('/institution-applications', institutionApplicationController.store);

router.get('/subscriptions', subscriptionController.index);
router.get('/subscriptions/:id', subscriptionController.show);
router.post('/subscriptions', subscriptionController.store);

router.get('/social-medias', socialMediaController.index);
router.get('/social-medias/:id', socialMediaController.show);
router.post('/social-medias', upload.single('icon'), socialMediaController.store);

router.get('/contact-methods', contactMethodController.index);
router.get('/contact-methods/:id', contactMethodController.show);
router.post('/contact-methods', upload.single('icon'), contactMethodController.store);

router.get('/mobile-app-links', mobileAppLinkController.index);
router.get('/mobile-app-links/:id', mobileAppLinkController.show);
router.post('/mobile-app-links', upload.single('icon'), mobileAppLinkController.store);

export default router;
