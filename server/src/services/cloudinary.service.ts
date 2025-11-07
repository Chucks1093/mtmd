// src/services/cloudinary.service.ts
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
   public_id: string;
   secure_url: string;
   width: number;
   height: number;
   bytes: number;
   format: string;
}

export class CloudinaryService {
   /**
    * Upload image buffer to Cloudinary
    */
   static async uploadImage(
      buffer: Buffer,
      options?: {
         folder?: string;
         public_id?: string;
         transformation?: any;
      }
   ): Promise<CloudinaryUploadResult> {
      try {
         return new Promise((resolve, reject) => {
            const uploadOptions = {
               folder: options?.folder || 'mtmd',
               public_id: options?.public_id,
               resource_type: 'image' as const,
               quality: 'auto',
               fetch_format: 'auto',
               transformation: options?.transformation || [
                  { width: 1000, height: 1000, crop: 'limit' },
                  { quality: 'auto' },
               ],
            };

            const uploadStream = cloudinary.uploader.upload_stream(
               uploadOptions,
               (error, result) => {
                  if (error) {
                     console.error('Cloudinary upload error:', error);
                     reject(
                        new Error(`Failed to upload image: ${error.message}`)
                     );
                  } else if (result) {
                     resolve({
                        public_id: result.public_id,
                        secure_url: result.secure_url,
                        width: result.width,
                        height: result.height,
                        bytes: result.bytes,
                        format: result.format,
                     });
                  } else {
                     reject(new Error('Upload failed: No result returned'));
                  }
               }
            );

            // Create readable stream from buffer
            const readableStream = new Readable();
            readableStream.push(buffer);
            readableStream.push(null);

            // Pipe buffer to Cloudinary
            readableStream.pipe(uploadStream);
         });
      } catch (error) {
         console.error('Cloudinary service error:', error);
         throw new Error('Image upload service unavailable');
      }
   }

   /**
    * Upload multiple images
    */
   static async uploadMultipleImages(
      buffers: Buffer[],
      options?: { folder?: string }
   ): Promise<CloudinaryUploadResult[]> {
      try {
         const uploadPromises = buffers.map((buffer, index) =>
            this.uploadImage(buffer, {
               ...options,
               public_id: `${Date.now()}_${index}`,
            })
         );

         return await Promise.all(uploadPromises);
      } catch (error) {
         console.error('Multiple upload error:', error);
         throw new Error('Failed to upload one or more images');
      }
   }

   /**
    * Delete image from Cloudinary
    */
   static async deleteImage(publicId: string): Promise<boolean> {
      try {
         const result = await cloudinary.uploader.destroy(publicId);
         return result.result === 'ok';
      } catch (error) {
         console.error('Cloudinary delete error:', error);
         return false;
      }
   }

   /**
    * Get optimized image URL
    */
   static getOptimizedUrl(
      publicId: string,
      options?: {
         width?: number;
         height?: number;
         crop?: string;
         quality?: string;
      }
   ): string {
      return cloudinary.url(publicId, {
         width: options?.width || 500,
         height: options?.height || 500,
         crop: options?.crop || 'fill',
         quality: options?.quality || 'auto',
         fetch_format: 'auto',
      });
   }

   /**
    * Validate image file
    */
   static validateImageFile(file: Express.Multer.File): {
      isValid: boolean;
      error?: string;
   } {
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
         return {
            isValid: false,
            error: 'File size must be less than 5MB',
         };
      }

      // Check file type
      const allowedTypes = [
         'image/jpeg',
         'image/jpg',
         'image/png',
         'image/webp',
      ];
      if (!allowedTypes.includes(file.mimetype)) {
         return {
            isValid: false,
            error: 'Only JPEG, PNG, and WebP images are allowed',
         };
      }

      return { isValid: true };
   }
}

export default CloudinaryService;
