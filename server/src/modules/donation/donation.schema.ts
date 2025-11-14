import { z } from 'zod';

export const DonationStatusEnum = z.enum([
   'PENDING',
   'SUCCESS',
   'FAILED',
   'CANCELLED',
]);

export const DonationTypeEnum = z.enum(['ONE_TIME', 'MONTHLY', 'ANNUAL']);

export const createDonationSchema = z.object({
   donorName: z.string().min(2, 'Donor name is required'),
   donorEmail: z.string().email('Invalid email address'),
   donorPhone: z.string().min(10, 'Valid phone number is required').optional(),
   amount: z.number().min(100, 'Minimum donation is ₦100'), // Amount in kobo for Paystack
   currency: z.string().default('NGN'),
   type: DonationTypeEnum.default('ONE_TIME'),
   message: z
      .string()
      .max(500, 'Message cannot exceed 500 characters')
      .optional(),
   isAnonymous: z.boolean().default(false),
   state: z.string().optional(),
   lga: z.string().optional(),
   cooridnates: z.string().optional(),
   ward: z.string().optional(),
});

export const initializePaymentSchema = z.object({
   donationId: z.string(),
   callbackUrl: z.string().url('Invalid callback URL').optional(),
});

export const verifyPaymentSchema = z.object({
   reference: z.string().min(1, 'Payment reference is required'),
});

export const getDonationSchema = z.object({
   id: z.string(),
});

export const filterDonationsSchema = z.object({
   page: z.number().int().positive().default(1),
   limit: z.number().int().positive().max(100).default(10),
   status: DonationStatusEnum.optional(),
   type: DonationTypeEnum.optional(),
   minAmount: z.number().positive().optional(),
   maxAmount: z.number().positive().optional(),
   startDate: z.string().datetime().optional(),
   endDate: z.string().datetime().optional(),
   state: z.string().optional(),
   search: z.string().optional(), // Search by donor name or email
});

export const updateDonationSchema = z.object({
   id: z.string(),
   status: DonationStatusEnum.optional(),
   paystackReference: z.string().optional(),
   paystackResponse: z.any().optional(),
});

export const getDonationStatsSchema = z.object({
   period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
   year: z.number().int().min(2020).max(2030).optional(),
});

export type DonationStatus = z.infer<typeof DonationStatusEnum>;
export type DonationType = z.infer<typeof DonationTypeEnum>;
export type CreateDonation = z.infer<typeof createDonationSchema>;
export type InitializePayment = z.infer<typeof initializePaymentSchema>;
export type VerifyPayment = z.infer<typeof verifyPaymentSchema>;
export type FilterDonations = z.infer<typeof filterDonationsSchema>;
export type UpdateDonation = z.infer<typeof updateDonationSchema>;
export type GetDonationStats = z.infer<typeof getDonationStatsSchema>;
