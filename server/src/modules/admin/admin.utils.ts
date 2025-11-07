import { prisma } from '../../utils/prisma.utils';
import { InviteAdmin, UpdateAdmin, FilterAdmins } from './admin.schema';
import crypto from 'crypto';

// Interface for Google credentials (since we removed GoogleAuth from schema)
export interface GoogleCredentials {
   googleId: string;
   email: string;
   name: string;
   profilePicture?: string;
   emailVerified?: boolean; // Made optional since not always needed
}

// Interface for first admin setup data
interface FirstAdminData {
   email: string;
   name: string;
   googleId: string;
   profilePicture?: string;
}

export async function createFirstSystemAdminRepository(data: FirstAdminData) {
   // Check if any system admin already exists
   const existingSystemAdmin = await prisma.admin.findFirst({
      where: { role: 'SYSTEM_ADMIN' },
   });

   if (existingSystemAdmin) {
      throw new Error('System admin already exists');
   }

   return await prisma.admin.create({
      data: {
         email: data.email,
         name: data.name,
         googleId: data.googleId,
         profilePicture: data.profilePicture,
         role: 'SYSTEM_ADMIN',
         status: 'ACTIVE',
         lastLoginAt: new Date(),
      },
   });
}

export async function inviteAdminRepository(
   data: InviteAdmin,
   invitedBy: string
) {
   // Check if admin with email already exists
   const existingAdmin = await prisma.admin.findUnique({
      where: { email: data.email },
   });

   if (existingAdmin) {
      throw new Error('Admin with this email already exists');
   }

   // Generate invite token and expiry (7 days)
   const inviteToken = crypto.randomBytes(32).toString('hex');
   const inviteExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

   return await prisma.admin.create({
      data: {
         email: data.email,
         name: data.name,
         role: data.role,
         status: 'PENDING',
         invitedBy,
         createdBy: invitedBy,
         inviteToken,
         inviteExpiry,
      },
   });
}

export async function getAdminByInviteTokenRepository(inviteToken: string) {
   return await prisma.admin.findUnique({
      where: {
         inviteToken,
         inviteExpiry: {
            gte: new Date(), // Not expired
         },
      },
   });
}

export async function activateAdminRepository(
   inviteToken: string,
   googleData: GoogleCredentials
) {
   return await prisma.admin.update({
      where: { inviteToken },
      data: {
         googleId: googleData.googleId,
         profilePicture: googleData.profilePicture,
         status: 'ACTIVE',
         inviteToken: null,
         inviteExpiry: null,
         lastLoginAt: new Date(),
      },
   });
}

export async function getAdminByGoogleIdRepository(googleId: string) {
   return await prisma.admin.findUnique({
      where: { googleId },
   });
}

export async function getAdminByEmailRepository(email: string) {
   return await prisma.admin.findUnique({
      where: { email },
   });
}

export async function getAdminByIdRepository(id: string) {
   return await prisma.admin.findUnique({
      where: { id },
   });
}

export async function updateAdminRepository(data: UpdateAdmin) {
   const { id, ...updateData } = data;

   return await prisma.admin.update({
      where: { id },
      data: updateData,
   });
}

export async function updateAdminLoginRepository(googleId: string) {
   return await prisma.admin.update({
      where: { googleId },
      data: {
         lastLoginAt: new Date(),
      },
   });
}

export async function getPaginatedAdminsRepository(filters: FilterAdmins) {
   const { page, limit, role, status, search } = filters;

   // Build where clause
   const whereClause: any = {};

   if (role) whereClause.role = role;
   if (status) whereClause.status = status;
   if (search) {
      whereClause.OR = [
         { name: { contains: search, mode: 'insensitive' } },
         { email: { contains: search, mode: 'insensitive' } },
      ];
   }

   const total = await prisma.admin.count({ where: whereClause });

   const skip = (page - 1) * limit;
   const totalPages = Math.ceil(total / limit);

   const admins = await prisma.admin.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
         id: true,
         email: true,
         name: true,
         profilePicture: true,
         role: true,
         status: true,
         lastLoginAt: true,
         createdAt: true,
         invitedBy: true,
         createdBy: true,
      },
   });

   return {
      admins,
      total,
      page,
      limit,
      totalPages,
   };
}

export async function deleteAdminRepository(id: string) {
   return await prisma.admin.delete({
      where: { id },
   });
}

export async function revokeInviteRepository(id: string) {
   return await prisma.admin.update({
      where: { id },
      data: {
         inviteToken: null,
         inviteExpiry: null,
         status: 'DEACTIVATED',
      },
   });
}

// Session management
export async function createAdminSessionRepository(
   adminId: string,
   userAgent?: string,
   ipAddress?: string
) {
   const token = crypto.randomBytes(64).toString('hex');
   const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

   return await prisma.adminSession.create({
      data: {
         adminId,
         token,
         expiresAt,
         userAgent,
         ipAddress,
      },
   });
}

// Now this will work properly with the relation defined in schema
export async function getAdminSessionRepository(token: string) {
   try {
      const session = await prisma.adminSession.findUnique({
         where: { token },
         include: {
            admin: true, // ✅ This works now with proper relation
         },
      });

      // Check if session exists and is not expired
      if (!session || session.expiresAt < new Date()) {
         return null;
      }

      // Check if admin is active
      if (
         !session.admin ||
         session.admin.status !== 'ACTIVE' ||
         !session.admin.isActive
      ) {
         return null;
      }

      return session;
   } catch (error) {
      return null; // Return null if session not found or any error occurs
   }
}

export async function deleteAdminSessionRepository(token: string) {
   try {
      return await prisma.adminSession.delete({
         where: { token },
      });
   } catch (error) {
      return null; // Session might not exist, that's okay
   }
}

export async function deleteExpiredSessionsRepository() {
   return await prisma.adminSession.deleteMany({
      where: {
         expiresAt: {
            lt: new Date(),
         },
      },
   });
}

// Utility function to clean up expired sessions (can be called periodically)
export async function cleanupExpiredSessionsRepository() {
   const deletedSessions = await deleteExpiredSessionsRepository();
   return deletedSessions;
}

export async function getAdminStatsRepository() {
   const totalAdmins = await prisma.admin.count();
   const activeAdmins = await prisma.admin.count({
      where: { status: 'ACTIVE' },
   });
   const pendingInvites = await prisma.admin.count({
      where: { status: 'PENDING' },
   });
   const systemAdmins = await prisma.admin.count({
      where: { role: 'SYSTEM_ADMIN' },
   });

   const recentLogins = await prisma.admin.findMany({
      where: {
         status: 'ACTIVE',
         lastLoginAt: { not: null },
      },
      orderBy: { lastLoginAt: 'desc' },
      take: 5,
      select: {
         id: true,
         name: true,
         email: true,
         lastLoginAt: true,
      },
   });

   return {
      totalAdmins,
      activeAdmins,
      pendingInvites,
      systemAdmins,
      recentLogins,
   };
}

// Check if any system admin exists (for setup check)
export async function hasSystemAdminRepository(): Promise<boolean> {
   const count = await prisma.admin.count({
      where: {
         role: 'SYSTEM_ADMIN',
         status: 'ACTIVE',
      },
   });
   return count > 0;
}

// Get all active sessions for an admin (for security dashboard)
export async function getAdminActiveSessionsRepository(adminId: string) {
   return await prisma.adminSession.findMany({
      where: {
         adminId,
         expiresAt: {
            gte: new Date(),
         },
      },
      select: {
         id: true,
         token: true,
         createdAt: true,
         expiresAt: true,
         userAgent: true,
         ipAddress: true,
      },
      orderBy: { createdAt: 'desc' },
   });
}

// Revoke all sessions for an admin (for security)
export async function revokeAllAdminSessionsRepository(adminId: string) {
   return await prisma.adminSession.deleteMany({
      where: { adminId },
   });
}
