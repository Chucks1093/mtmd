import { PartnerStatus, PartnerType } from '@prisma/client';
import { prisma } from '../../utils/prisma.utils';
import { CreatePartner, UpdatePartner, FilterPartners } from './partner.schema';
import crypto from 'crypto';

/**
 * Create a new partner
 */
export async function createPartnerRepository(
   data: CreatePartner,
   createdById: string
) {
   const partnerId = crypto.randomBytes(16).toString('hex');

   return await prisma.partner.create({
      data: {
         id: partnerId,
         name: data.name,
         description: data.description,
         type: data.type,
         logo: data.logo,
         website: data.website,
         email: data.email,
         phone: data.phone,
         contactPerson: data.contactPerson,
         contactPersonRole: data.contactPersonRole,
         state: data.state,
         lga: data.lga,
         address: data.address,
         socialMedia: data.socialMedia,
         partnershipDetails: data.partnershipDetails,
         featured: data.featured,
         displayOrder: data.displayOrder,
         status: data.status,
         createdById,
      },
   });
}

/**
 * Get partner by ID
 */
export async function getPartnerByIdRepository(id: string) {
   return await prisma.partner.findUnique({
      where: { id },
   });
}

/**
 * Update partner
 */
export async function updatePartnerRepository(
   data: UpdatePartner,
   updatedById: string
) {
   const { id, ...updateData } = data;

   return await prisma.partner.update({
      where: { id },
      data: {
         ...updateData,
         updatedById,
         updatedAt: new Date(),
      },
   });
}

/**
 * Delete partner
 */
export async function deletePartnerRepository(id: string) {
   return await prisma.partner.delete({
      where: { id },
   });
}

/**
 * Get paginated partners with filtering (Admin view)
 */
export async function getPaginatedPartnersRepository(filters: FilterPartners) {
   const { page, limit, type, status, featured, state, search } = filters;

   const whereClause: any = {};

   if (type) whereClause.type = type;
   if (status) whereClause.status = status;
   if (featured !== undefined) whereClause.featured = featured;
   if (state) whereClause.state = state;

   if (search) {
      whereClause.OR = [
         { name: { contains: search, mode: 'insensitive' } },
         { description: { contains: search, mode: 'insensitive' } },
         { contactPerson: { contains: search, mode: 'insensitive' } },
      ];
   }

   const total = await prisma.partner.count({ where: whereClause });
   const skip = (page - 1) * limit;
   const totalPages = Math.ceil(total / limit);

   const partners = await prisma.partner.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [
         { featured: 'desc' },
         { displayOrder: 'asc' },
         { createdAt: 'desc' },
      ],
   });

   return {
      partners,
      total,
      page,
      limit,
      totalPages,
   };
}

/**
 * Get public partners (only active partners for public display)
 */
export async function getPublicPartnersRepository() {
   const whereClause: any = {
      status: 'ACTIVE', // Only show active partners to public
   };

   const total = await prisma.partner.count({ where: whereClause });

   const partners = await prisma.partner.findMany({
      where: whereClause,
      orderBy: [
         { featured: 'desc' },
         { displayOrder: 'asc' },
         { createdAt: 'desc' },
      ],
      select: {
         id: true,
         name: true,
         type: true,
         logo: true,
         website: true,
         displayOrder: true,
         createdAt: true,
      },
   });

   return {
      partners,
      total,
   };
}

/**
 * Get featured partners for homepage display
 */
export async function getFeaturedPartnersRepository(limit: number = 8) {
   return await prisma.partner.findMany({
      where: {
         status: 'ACTIVE',
         featured: true,
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      select: {
         id: true,
         name: true,
         description: true,
         type: true,
         logo: true,
         website: true,
         createdAt: true,
      },
   });
}

/**
 * Get partner statistics
 */
export async function getPartnerStatsRepository() {
   const totalPartners = await prisma.partner.count();

   const activePartners = await prisma.partner.count({
      where: { status: 'ACTIVE' },
   });

   const featuredPartners = await prisma.partner.count({
      where: {
         status: 'ACTIVE',
         featured: true,
      },
   });

   const pendingPartners = await prisma.partner.count({
      where: { status: 'PENDING' },
   });

   // Partners by type
   const partnersByType = await prisma.partner.groupBy({
      by: ['type'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
   });

   const formattedByType = partnersByType.map(item => ({
      type: item.type,
      count: item._count.id,
   }));

   // Partners by state (top 10)
   const partnersByState = await prisma.partner.groupBy({
      by: ['state'],
      where: {
         status: 'ACTIVE',
         state: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
   });

   const formattedByState = partnersByState.map(item => ({
      state: item.state,
      count: item._count.id,
   }));

   // Recent partners
   const recentPartners = await prisma.partner.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
         id: true,
         name: true,
         type: true,
         logo: true,
         createdAt: true,
      },
   });

   return {
      totalPartners,
      activePartners,
      featuredPartners,
      pendingPartners,
      partnersByType: formattedByType,
      partnersByState: formattedByState,
      recentPartners,
   };
}

/**
 * Check if partner name already exists
 */
export async function checkPartnerNameExistsRepository(
   name: string,
   excludeId?: string
) {
   const whereClause: any = {
      name: {
         equals: name,
         mode: 'insensitive',
      },
   };

   if (excludeId) {
      whereClause.id = { not: excludeId };
   }

   const existingPartner = await prisma.partner.findFirst({
      where: whereClause,
   });

   return !!existingPartner;
}

/**
 * Update partner display order
 */
export async function updatePartnerDisplayOrderRepository(
   partnerId: string,
   newOrder: number,
   updatedById: string
) {
   return await prisma.partner.update({
      where: { id: partnerId },
      data: {
         displayOrder: newOrder,
         updatedById,
         updatedAt: new Date(),
      },
   });
}

/**
 * Bulk update partner status
 */
export async function bulkUpdatePartnerStatusRepository(
   partnerIds: string[],
   status: PartnerStatus,
   updatedById: string
) {
   return await prisma.partner.updateMany({
      where: {
         id: { in: partnerIds },
      },
      data: {
         status,
         updatedAt: new Date(),
      },
   });
}

/**
 * Get partners by type for public display
 */
export async function getPartnersByTypeRepository(
   type: PartnerType,
   limit: number = 12
) {
   return await prisma.partner.findMany({
      where: {
         type,
         status: 'ACTIVE',
      },
      orderBy: [
         { featured: 'desc' },
         { displayOrder: 'asc' },
         { createdAt: 'desc' },
      ],
      take: limit,
      select: {
         id: true,
         name: true,
         description: true,
         type: true,
         logo: true,
         website: true,
         featured: true,
         createdAt: true,
      },
   });
}
