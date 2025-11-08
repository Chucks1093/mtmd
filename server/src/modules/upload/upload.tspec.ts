import { Tspec } from 'tspec';

/** @tspec-description Image upload response object */
export interface ImageUploadResult {
   url: string;
   publicId: string;
   width: number;
   height: number;
   format: string;
   bytes: number;
}

/** @tspec-description Multiple image upload response */
export interface MultipleImageUploadResponse {
   images: ImageUploadResult[];
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

export type UploadApiSpec = Tspec.DefineApiSpec<{
   tags: ['Upload'];
   paths: {
      '/api/v1/upload/images': {
         post: {
            summary: 'Upload images';
            description: 'Upload one or more images for toilet reports. Accepts JPEG, PNG, and WebP formats. Maximum 5 images per request, 5MB per image.';
            tags: ['Upload'];
            /** @mediaType multipart/form-data */
            body: {
               images: Tspec.BinaryStringArray;
            };
            responses: {
               200: SuccessResponse<MultipleImageUploadResponse>;
               400: ErrorResponse;
               500: ErrorResponse;
            };
         };
      };

      '/api/v1/upload/images/:publicId': {
         delete: {
            summary: 'Delete an image (Admin only)';
            description: 'Delete an image from Cloudinary storage using its public ID';
            tags: ['Upload'];
            security: 'bearerAuth';
            path: {
               publicId: string;
            };
            responses: {
               200: SuccessResponse;
               400: ErrorResponse;
               401: ErrorResponse;
               403: ErrorResponse;
               500: ErrorResponse;
            };
         };
      };
   };
}>;
