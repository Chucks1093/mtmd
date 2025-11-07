import { Router } from 'express';
import {
   uploadImages,
   deleteImage,
   uploadMiddleware,
} from './upload.controller';
import { authenticateAdmin } from '../../middlewares/auth.middleware';

const uploadRouter = Router();

// Public route for uploading images (used by citizens when submitting reports)
uploadRouter.post('/images', uploadMiddleware, uploadImages);

// Admin route for deleting images
uploadRouter.delete('/images/:publicId', authenticateAdmin, deleteImage);

export default uploadRouter;
