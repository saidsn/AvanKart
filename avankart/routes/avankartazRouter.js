import express from "express";
import blogRouter from "./avankartaz/blog.js";
import faqRouter from "./avankartaz/faq.js";
import applicationCategoryRouter from "./avankartaz/applicationCategory.js";
import blogCategoryRouter from "./avankartaz/blogCategory.js";
import companyApplicationRouter from "./avankartaz/companyApplication.js";
import contactMethodRouter from "./avankartaz/contactMethod.js";
import insititutionApplicationRouter from "./avankartaz/insititutionApplication.js";
import mobileAppLinkRouter from "./avankartaz/mobilAppLink.js";
import socialMediaRouter from "./avankartaz/socialMedia.js";
import subscriptionRouter from "./avankartaz/subscription.js";
import muracietlerRouter from "./avankartaz/muracietler.js";

const avankartazRouter = express.Router();

avankartazRouter.use('/blog', blogRouter)
avankartazRouter.use('/faq', faqRouter)
avankartazRouter.use('/muracietler-kateqoriya', applicationCategoryRouter)
avankartazRouter.use('/blogCategory', blogCategoryRouter)
avankartazRouter.use('/sirket-muracietler', companyApplicationRouter)
avankartazRouter.use('/elaqe', contactMethodRouter)
avankartazRouter.use('/muessise-muracietler', insititutionApplicationRouter)
avankartazRouter.use('/mobiltetbiq', mobileAppLinkRouter)
avankartazRouter.use('/sosial', socialMediaRouter)
avankartazRouter.use('/abunelikler', subscriptionRouter)
avankartazRouter.use('/muracietler', muracietlerRouter)

export default avankartazRouter;