import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { blogController } from "../../controllers/avankartaz/blog.js";
import upload from "../../middlewares/uploadAvankartaz.js";

const csrfProtection = csrf({ cookie: true });
const blogRouter = express.Router();


blogRouter.get('/', [verifyToken, csrfProtection], blogController.index);

blogRouter.get('/list', [verifyToken, csrfProtection], blogController.list);

blogRouter.get('/create', [verifyToken, csrfProtection], blogController.create);

blogRouter.get('/:slug', [verifyToken, csrfProtection], blogController.show);

blogRouter.get('/:id/edit', [verifyToken, csrfProtection], blogController.edit);

blogRouter.post('/', [verifyToken, csrfProtection, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'detailImage', maxCount: 1 }
])], blogController.store);

// Update route also needs upload middleware for file handling
blogRouter.put('/:id', [verifyToken, csrfProtection, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'detailImage', maxCount: 1 }
])], blogController.update);

blogRouter.patch('/:id', [verifyToken, csrfProtection, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'detailImage', maxCount: 1 }
])], blogController.update);

// POST route for update (method override support)
blogRouter.post('/:id', [verifyToken, csrfProtection, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'detailImage', maxCount: 1 }
])], (req, res, next) => {
  // Check if this is a PUT request disguised as POST
  if (req.body._method === 'PUT') {
    req.method = 'PUT';
    delete req.body._method;
  }
  blogController.update(req, res, next);
});

blogRouter.delete('/:id', [verifyToken, csrfProtection], blogController.destroy);

export default blogRouter;
