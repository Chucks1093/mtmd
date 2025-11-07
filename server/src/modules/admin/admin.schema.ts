import { z } from 'zod';

// Enums matching Prisma schema
export const AdminRoleEnum = z.enum(['SYSTEM_ADMIN', 'ADMIN']);
export const AdminStatusEnum = z.enum([
   'PENDING',
   'ACTIVE',
   'SUSPENDED',
   'DEACTIVATED',
]);

// Schema for inviting new admin
export const inviteAdminSchema = z.object({
   email: z.string().email('Invalid email address'),
   name: z.string().min(2, 'Name is required'),
   role: AdminRoleEnum.default('ADMIN'),
});

// Schema for accepting invitation (updated for AuthService)
export const acceptInviteSchema = z.object({
   inviteToken: z.string().min(1, 'Invite token is required'),
   googleId: z.string().min(1, 'Google ID token is required'), // This is actually the Google ID token
});

// Schema for Google OAuth login (simplified)
export const googleLoginSchema = z.object({
   googleToken: z.string().min(1, 'Google token is required'),
});

// Schema for updating admin
export const updateAdminSchema = z.object({
   id: z.string(),
   name: z.string().min(2).optional(),
   role: AdminRoleEnum.optional(),
   status: AdminStatusEnum.optional(),
   isActive: z.boolean().optional(),
});

// Schema for admin filters
export const filterAdminsSchema = z.object({
   page: z.number().int().positive().default(1),
   limit: z.number().int().positive().max(100).default(10),
   role: AdminRoleEnum.optional(),
   status: AdminStatusEnum.optional(),
   search: z.string().optional(),
});

// Schema for getting admin by ID
export const getAdminSchema = z.object({
   id: z.string(),
});

// Schema for revoking invitation
export const revokeInviteSchema = z.object({
   id: z.string(),
});

// First system admin setup (for initial deployment)
export const setupFirstAdminSchema = z.object({
   email: z.string().email('Invalid email address').optional(),
   name: z.string().min(2, 'Name is required').optional(),
   googleId: z.string().min(1, 'Google ID token is required'), // This is the Google ID token
   setupKey: z.string().min(1, 'Setup key is required'), // Secret key for first setup
});

// Types derived from Zod schemas
export type AdminRole = z.infer<typeof AdminRoleEnum>;
export type AdminStatus = z.infer<typeof AdminStatusEnum>;
export type InviteAdmin = z.infer<typeof inviteAdminSchema>;
export type AcceptInvite = z.infer<typeof acceptInviteSchema>;
export type GoogleLogin = z.infer<typeof googleLoginSchema>;
export type UpdateAdmin = z.infer<typeof updateAdminSchema>;
export type FilterAdmins = z.infer<typeof filterAdminsSchema>;
export type SetupFirstAdmin = z.infer<typeof setupFirstAdminSchema>;
