import { Request, Response, NextFunction } from 'express';
import { CloudinaryService } from '../../services/cloudinary.service';
import { logger } from '../../utils/logger.utils';
import multer from 'multer';

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({
   storage,
   limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: 5, // Maximum 5 files per request
   },
   fileFilter: (req, file, cb) => {
      // Check file type
      const allowedMimes = [
         'image/jpeg',
         'image/jpg',
         'image/png',
         'image/webp',
      ];

      if (allowedMimes.includes(file.mimetype)) {
         cb(null, true);
      } else {
         cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
      }
   },
});

export const uploadMiddleware = upload.array('images', 5); // Allow up to 5 images

/**
 * Upload single or multiple images to Cloudinary
 */
export const uploadImages = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
         res.status(400).json({
            success: false,
            message: 'No images provided',
         });
         return;
      }

      // Validate each file
      for (const file of files) {
         const validation = CloudinaryService.validateImageFile(file);
         if (!validation.isValid) {
            res.status(400).json({
               success: false,
               message: validation.error,
            });
            return;
         }
      }

      // Upload images to Cloudinary
      const uploadResults = await CloudinaryService.uploadMultipleImages(
         files.map(file => file.buffer),
         {
            folder: 'toilet-reports', // Organize uploads in a folder
         }
      );

      // Return the image URLs
      const imageUrls = uploadResults.map(result => ({
         url: result.secure_url,
         publicId: result.public_id,
         width: result.width,
         height: result.height,
         format: result.format,
         bytes: result.bytes,
      }));

      logger.info(`Successfully uploaded ${imageUrls.length} images`);

      res.status(200).json({
         success: true,
         message: `Successfully uploaded ${imageUrls.length} image(s)`,
         data: {
            images: imageUrls,
            count: imageUrls.length,
         },
      });
   } catch (error) {
      logger.error('Image upload error:', error);
      next(error);
   }
};

/**
 * Delete an image from Cloudinary (admin only)
 */
export const deleteImage = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { publicId } = req.params;

      if (!publicId) {
         res.status(400).json({
            success: false,
            message: 'Public ID is required',
         });
         return;
      }

      const deleted = await CloudinaryService.deleteImage(publicId);

      if (deleted) {
         res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
         });
      } else {
         res.status(400).json({
            success: false,
            message: 'Failed to delete image',
         });
      }
   } catch (error) {
      logger.error('Image deletion error:', error);
      next(error);
   }
};
