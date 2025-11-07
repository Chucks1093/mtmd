import { z } from 'zod';

// Schema for image upload response
export const imageUploadResponseSchema = z.object({
   url: z.string().url(),
   publicId: z.string(),
   width: z.number(),
   height: z.number(),
   format: z.string(),
   bytes: z.number(),
});

// Schema for multiple image upload response
export const multipleImageUploadResponseSchema = z.object({
   images: z.array(imageUploadResponseSchema),
   count: z.number(),
});

// Schema for delete image request
export const deleteImageSchema = z.object({
   publicId: z.string().min(1, 'Public ID is required'),
});

// Types
export type ImageUploadResponse = z.infer<typeof imageUploadResponseSchema>;
export type MultipleImageUploadResponse = z.infer<
   typeof multipleImageUploadResponseSchema
>;
export type DeleteImageRequest = z.infer<typeof deleteImageSchema>;
