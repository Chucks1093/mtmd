import { z } from 'zod';

// Enums matching Prisma schema
export const ReportStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

export const ToiletConditionEnum = z.enum([
   'EXCELLENT',
   'GOOD',
   'FAIR',
   'POOR',
   'VERY_POOR',
]);

export const FacilityTypeEnum = z.enum([
   'PUBLIC',
   'PRIVATE',
   'SCHOOL',
   'HOSPITAL',
   'MARKET',
   'OFFICE',
   'RESIDENTIAL',
   'OTHER',
]);

// Schema for creating a new report
export const createReportSchema = z.object({
   // Submitter Information
   submitterName: z.string().min(2, 'Submitter name is required'),
   submitterEmail: z.string().email('Invalid email address').optional(),
   submitterPhone: z
      .string()
      .min(10, 'Valid phone number is required')
      .optional(),

   // Location Information
   state: z.string().min(2, 'State is required'),
   lga: z.string().min(2, 'Local Government Area is required'),
   ward: z.string().optional(),
   specificAddress: z.string().min(5, 'Specific address is required'),
   coordinates: z.string().optional(),

   // Toilet Report Details
   images: z
      .array(z.string().url('Invalid image URL'))
      .min(1, 'At least one image is required'),
   description: z.string().optional(),
   toiletCondition: ToiletConditionEnum,
   facilityType: FacilityTypeEnum,
});

// Schema for updating report status (admin only)
export const updateReportStatusSchema = z.object({
   id: z.string(),
   status: ReportStatusEnum,
   adminNotes: z.string().optional(),
   reviewedBy: z.string().optional(),
});

// Schema for getting a report by ID
export const getReportSchema = z.object({
   id: z.string(),
});

// Schema for filtering reports
export const filterReportsSchema = z.object({
   page: z.number().int().positive().default(1),
   limit: z.number().int().positive().max(100).default(10),
   status: ReportStatusEnum.optional(),
   state: z.string().optional(),
   lga: z.string().optional(),
   facilityType: FacilityTypeEnum.optional(),
   toiletCondition: ToiletConditionEnum.optional(),
});

// Schema for getting reports by location
export const getReportsByLocationSchema = z.object({
   state: z.string(),
   lga: z.string().optional(),
});

// Export schema validation
export const exportReportsSchema = z.object({
   format: z.enum(['csv', 'excel', 'pdf'], {
      required_error: 'Export format is required',
      invalid_type_error: 'Format must be csv, excel, or pdf',
   }),
   status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
   state: z.string().optional(),
   lga: z.string().optional(),
   facilityType: z
      .enum([
         'PUBLIC',
         'PRIVATE',
         'SCHOOL',
         'HOSPITAL',
         'MARKET',
         'OFFICE',
         'RESIDENTIAL',
         'OTHER',
      ])
      .optional(),
   toiletCondition: z
      .enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'VERY_POOR'])
      .optional(),
   page: z.number().int().positive().optional(),
   limit: z.number().int().positive().max(1000).optional(),
});

// Types derived from Zod schemas
export type ReportStatus = z.infer<typeof ReportStatusEnum>;
export type ToiletCondition = z.infer<typeof ToiletConditionEnum>;
export type FacilityType = z.infer<typeof FacilityTypeEnum>;
export type CreateReport = z.infer<typeof createReportSchema>;
export type UpdateReportStatus = z.infer<typeof updateReportStatusSchema>;
export type FilterReports = z.infer<typeof filterReportsSchema>;
