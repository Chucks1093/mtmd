import { Tspec } from 'tspec';

/** @tspec-description Image upload response object */
export interface ImageUploadResult {
   /** Secure URL of the uploaded image */
   url: string;
   /** Cloudinary public ID for future reference */
   publicId: string;
   /** Image width in pixels */
   width: number;
   /** Image height in pixels */
   height: number;
   /** Image format (jpg, png, webp, etc.) */
   format: string;
   /** File size in bytes */
   bytes: number;
}

/** @tspec-description Multiple image upload response */
export interface MultipleImageUploadResponse {
   /** Array of uploaded image objects */
   images: ImageUploadResult[];
   /** Total number of images uploaded */
   count: number;
}

/** @tspec-description Standard success response */
export interface SuccessResponse<T = any> {
   success: true;
   message: string;
   data?: T;
}

/** @tspec-description Standard error response */
export interface ErrorResponse {
   success: false;
   message: string;
   errors?: any[];
}

// Define Upload API using Tspec
export type UploadApiSpec = Tspec.DefineApiSpec<{
   tags: ['Upload'];
   paths: {
      /** Upload images for toilet reports */
      '/api/v1/upload/images': {
         post: {
            summary: 'Upload images';
            description: 'Upload one or more images for toilet reports. Accepts JPEG, PNG, and WebP formats. Maximum 5 images per request, 5MB per image.';
            tags: ['Upload'];
            requestBody: {
               content: {
                  'multipart/form-data': {
                     schema: {
                        type: 'object';
                        properties: {
                           /** Image files to upload (max 5 files, 5MB each) */
                           images: {
                              type: 'array';
                              items: {
                                 type: 'string';
                                 format: 'binary';
                              };
                           };
                        };
                        required: ['images'];
                     };
                  };
               };
            };
            responses: {
               /** Images uploaded successfully */
               200: SuccessResponse<MultipleImageUploadResponse>;
               /** Invalid file type or size, no images provided */
               400: ErrorResponse;
               /** Server error during upload */
               500: ErrorResponse;
            };
         };
      };

      /** Delete an image from Cloudinary */
      '/api/v1/upload/images/:publicId': {
         delete: {
            summary: 'Delete an image (Admin only)';
            description: 'Delete an image from Cloudinary storage using its public ID';
            tags: ['Upload'];
            security: 'bearerAuth';
            path: {
               /** Cloudinary public ID of the image to delete */
               publicId: string;
            };
            responses: {
               /** Image deleted successfully */
               200: SuccessResponse;
               /** Invalid public ID */
               400: ErrorResponse;
               /** Unauthorized */
               401: ErrorResponse;
               /** Admin access required */
               403: ErrorResponse;
               /** Server error during deletion */
               500: ErrorResponse;
            };
         };
      };
   };
}>;
