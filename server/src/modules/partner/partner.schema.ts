import { z } from 'zod';

export const PartnerStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'PENDING']);

export const PartnerTypeEnum = z.enum([
   'CORPORATE',
   'NGO',
   'GOVERNMENT',
   'INTERNATIONAL',
   'COMMUNITY',
   'ACADEMIC',
   'MEDIA',
]);

export const createPartnerSchema = z.object({
   name: z.string().min(2, 'Partner name is required'),
   description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .optional(),
   type: PartnerTypeEnum,
   logo: z.string().url('Invalid logo URL'),
   website: z.string().url('Invalid website URL').optional(),
   email: z.string().email('Invalid email address').optional(),
   phone: z.string().min(10, 'Valid phone number required').optional(),
   contactPerson: z.string().min(2, 'Contact person name required').optional(),
   contactPersonRole: z
      .string()
      .min(2, 'Contact person role required')
      .optional(),
   state: z.string().optional(),
   lga: z.string().optional(),
   address: z.string().optional(),
   socialMedia: z
      .object({
         facebook: z.string().url('Invalid Facebook URL').optional(),
         twitter: z.string().url('Invalid Twitter URL').optional(),
         linkedin: z.string().url('Invalid LinkedIn URL').optional(),
         instagram: z.string().url('Invalid Instagram URL').optional(),
      })
      .optional(),
   partnershipDetails: z
      .object({
         startDate: z.string().datetime('Invalid start date').optional(),
         endDate: z.string().datetime('Invalid end date').optional(),
         partnershipType: z.string().optional(),
         contributions: z.array(z.string()).optional(),
         benefits: z.array(z.string()).optional(),
      })
      .optional(),
   featured: z.boolean().default(false),
   displayOrder: z.number().int().min(0).default(0),
   status: PartnerStatusEnum.default('ACTIVE'),
});

export const updatePartnerSchema = z.object({
   id: z.string(),
   name: z.string().min(2).optional(),
   description: z.string().min(10).optional(),
   type: PartnerTypeEnum.optional(),
   logo: z.string().url().optional(),
   website: z.string().url().optional(),
   email: z.string().email().optional(),
   phone: z.string().min(10).optional(),
   contactPerson: z.string().min(2).optional(),
   contactPersonRole: z.string().min(2).optional(),
   state: z.string().optional(),
   lga: z.string().optional(),
   address: z.string().optional(),
   socialMedia: z
      .object({
         facebook: z.string().url().optional(),
         twitter: z.string().url().optional(),
         linkedin: z.string().url().optional(),
         instagram: z.string().url().optional(),
      })
      .optional(),
   partnershipDetails: z
      .object({
         startDate: z.string().datetime().optional(),
         endDate: z.string().datetime().optional(),
         partnershipType: z.string().optional(),
         contributions: z.array(z.string()).optional(),
         benefits: z.array(z.string()).optional(),
      })
      .optional(),
   featured: z.boolean().optional(),
   displayOrder: z.number().int().min(0).optional(),
   status: PartnerStatusEnum.optional(),
});

export const getPartnerSchema = z.object({
   id: z.string(),
});

export const filterPartnersSchema = z.object({
   page: z.number().int().positive().default(1),
   limit: z.number().int().positive().max(100).default(10),
   type: PartnerTypeEnum.optional(),
   status: PartnerStatusEnum.optional(),
   featured: z.boolean().optional(),
   state: z.string().optional(),
   search: z.string().optional(), // Search by name, description, or contact person
});

export type PartnerStatus = z.infer<typeof PartnerStatusEnum>;
export type PartnerType = z.infer<typeof PartnerTypeEnum>;
export type CreatePartner = z.infer<typeof createPartnerSchema>;
export type UpdatePartner = z.infer<typeof updatePartnerSchema>;
export type FilterPartners = z.infer<typeof filterPartnersSchema>;
