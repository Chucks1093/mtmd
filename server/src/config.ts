import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export const envSchema = z.object({
   PORT: z.number().default(3000),
   MODE: z.enum(['development', 'production', 'test']).default('development'),
   DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL is required in the environment variables'),

   // Google OAuth
   GOOGLE_CLIENT_ID: z
      .string()
      .min(1, 'GOOGLE_CLIENT_ID is required for Google OAuth'),
   GOOGLE_CLIENT_SECRET: z
      .string()
      .min(1, 'GOOGLE_CLIENT_SECRET is required for Google OAuth'),

   // URLs
   BACKEND_URL: z.string().url(),
   FRONTEND_URL: z
      .string()
      .url('FRONTEND_URL must be a valid URL')
      .min(1, 'FRONTEND_URL is required'),

   // Admin Setup
   FIRST_ADMIN_SETUP_KEY: z
      .string()
      .min(1, 'FIRST_ADMIN_SETUP_KEY is required for initial admin setup'),

   // Cloudinary
   CLOUDINARY_CLOUD_NAME: z
      .string()
      .min(1, 'CLOUDINARY_CLOUD_NAME is required for image uploads'),
   CLOUDINARY_API_KEY: z
      .string()
      .min(1, 'CLOUDINARY_API_KEY is required for image uploads'),
   CLOUDINARY_API_SECRET: z
      .string()
      .min(1, 'CLOUDINARY_API_SECRET is required for image uploads'),

   // Email (Resend)
   RESEND_API_KEY: z
      .string()
      .min(1, 'RESEND_API_KEY is required for email functionality'),
   RESEND_FROM_EMAIL: z
      .string()
      .email('RESEND_FROM_EMAIL must be a valid email address')
      .min(1, 'RESEND_FROM_EMAIL is required'),
});

export const envConfig = envSchema.parse({
   PORT: Number(process.env.PORT),
   MODE: process.env.NODE_ENV || 'development',
   DATABASE_URL: process.env.DATABASE_URL,
   GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
   GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
   BACKEND_URL: process.env.BACKEND_URL,
   FRONTEND_URL: process.env.FRONTEND_URL,
   FIRST_ADMIN_SETUP_KEY: process.env.FIRST_ADMIN_SETUP_KEY,
   CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
   CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
   CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
   RESEND_API_KEY: process.env.RESEND_API_KEY,
   RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
});

export const appConfig = {
   allowedOrigins: [
      'http://localhost:5173',
      'http://localhost:3000',
      envConfig.FRONTEND_URL,
   ].filter(Boolean),
};
