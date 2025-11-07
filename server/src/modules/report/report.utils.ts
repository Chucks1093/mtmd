import { prisma } from '../../utils/prisma.utils';
import {
   CreateReport,
   FilterReports,
   UpdateReportStatus,
} from './report.schema';

export async function createReportRepository(data: CreateReport) {
   return await prisma.report.create({
      data: {
         ...data,
         images: data.images,
      },
   });
}

export async function getReportByIdRepository(id: string) {
   return await prisma.report.findUnique({
      where: { id },
   });
}

export async function getAllReportsRepository() {
   return await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
   });
}

export async function getPaginatedReportsRepository(filters: FilterReports) {
   const { page, limit, status, state, lga, facilityType, toiletCondition } =
      filters;

   // Build where clause based on filters
   const whereClause: any = {};

   if (status) whereClause.status = status;
   if (state) whereClause.state = state;
   if (lga) whereClause.lga = lga;
   if (facilityType) whereClause.facilityType = facilityType;
   if (toiletCondition) whereClause.toiletCondition = toiletCondition;

   const total = await prisma.report.count({
      where: whereClause,
   });

   // Calculate pagination
   const skip = (page - 1) * limit;
   const totalPages = Math.ceil(total / limit);

   // Get paginated reports
   const reports = await prisma.report.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
   });

   return {
      reports,
      total,
      page,
      limit,
      totalPages,
   };
}

export async function getReportsByLocationRepository(
   state: string,
   lga?: string
) {
   const whereClause: any = {
      state: state,
      status: 'APPROVED', // Only show approved reports on public map
   };

   if (lga) {
      whereClause.lga = lga;
   }

   return await prisma.report.findMany({
      where: whereClause,
      select: {
         id: true,
         state: true,
         lga: true,
         ward: true,
         specificAddress: true,
         coordinates: true,
         toiletCondition: true,
         facilityType: true,
         images: true,
         createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
   });
}

export async function updateReportStatusRepository(data: UpdateReportStatus) {
   const { id, status, adminNotes, reviewedBy } = data;

   return await prisma.report.update({
      where: { id },
      data: {
         status,
         adminNotes,
         reviewedBy,
         reviewedAt: new Date(),
      },
   });
}

export async function deleteReportRepository(id: string) {
   return await prisma.report.delete({
      where: { id },
   });
}

export async function getReportStatsRepository() {
   const totalReports = await prisma.report.count();
   const approvedReports = await prisma.report.count({
      where: { status: 'APPROVED' },
   });
   const pendingReports = await prisma.report.count({
      where: { status: 'PENDING' },
   });
   const rejectedReports = await prisma.report.count({
      where: { status: 'REJECTED' },
   });

   // Get reports by state
   const reportsByState = await prisma.report.groupBy({
      by: ['state'],
      where: { status: 'APPROVED' },
      _count: {
         id: true,
      },
      orderBy: {
         _count: {
            id: 'desc',
         },
      },
   });

   // Get reports by toilet condition
   const reportsByCondition = await prisma.report.groupBy({
      by: ['toiletCondition'],
      where: { status: 'APPROVED' },
      _count: {
         id: true,
      },
   });

   return {
      totalReports,
      approvedReports,
      pendingReports,
      rejectedReports,
      reportsByState,
      reportsByCondition,
   };
}

export async function getRecentReportsRepository(limit: number = 10) {
   return await prisma.report.findMany({
      where: { status: 'APPROVED' },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
         id: true,
         submitterName: true,
         state: true,
         lga: true,
         toiletCondition: true,
         facilityType: true,
         createdAt: true,
      },
   });
}
