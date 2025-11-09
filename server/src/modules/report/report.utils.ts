import { prisma } from '../../utils/prisma.utils';
import {
   CreateReport,
   FilterReports,
   UpdateReportStatus,
} from './report.schema';
import { logger } from '../../utils/logger.utils';
import puppeteer from 'puppeteer';

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

/**
 * Generate CSV from reports data
 */
export function generateCSV(reports: any[]): string {
   if (reports.length === 0) {
      return 'No data available';
   }

   // CSV headers
   const headers = [
      'ID',
      'Submitter Name',
      'Submitter Email',
      'Submitter Phone',
      'State',
      'LGA',
      'Ward',
      'Specific Address',
      'Coordinates',
      'Toilet Condition',
      'Facility Type',
      'Status',
      'Description',
      'Admin Notes',
      'Images Count',
      'Created At',
      'Updated At',
      'Reviewed At',
      'Reviewed By',
   ];

   // Convert reports to CSV rows
   const csvRows = reports.map(report => [
      report.id,
      report.submitterName,
      report.submitterEmail || '',
      report.submitterPhone || '',
      report.state,
      report.lga,
      report.ward || '',
      report.specificAddress,
      report.coordinates || '',
      report.toiletCondition,
      report.facilityType,
      report.status,
      report.description || '',
      report.adminNotes || '',
      report.images?.length || 0,
      report.createdAt,
      report.updatedAt,
      report.reviewedAt || '',
      report.reviewedBy || '',
   ]);

   // Combine headers and rows
   const allRows = [headers, ...csvRows];

   // Convert to CSV string
   return allRows
      .map(row =>
         row
            .map(field =>
               typeof field === 'string' && field.includes(',')
                  ? `"${field.replace(/"/g, '""')}"`
                  : field
            )
            .join(',')
      )
      .join('\n');
}

/**
 * Generate Excel from reports data
 * Note: You'll need to install the 'xlsx' package: npm install xlsx @types/xlsx
 */
export async function generateExcel(reports: any[]): Promise<Buffer> {
   try {
      const XLSX = require('xlsx');

      // Prepare data for Excel
      const excelData = reports.map(report => ({
         ID: report.id,
         'Submitter Name': report.submitterName,
         'Submitter Email': report.submitterEmail || '',
         'Submitter Phone': report.submitterPhone || '',
         State: report.state,
         LGA: report.lga,
         Ward: report.ward || '',
         'Specific Address': report.specificAddress,
         Coordinates: report.coordinates || '',
         'Toilet Condition': report.toiletCondition,
         'Facility Type': report.facilityType,
         Status: report.status,
         Description: report.description || '',
         'Admin Notes': report.adminNotes || '',
         'Images Count': report.images?.length || 0,
         'Created At': report.createdAt,
         'Updated At': report.updatedAt,
         'Reviewed At': report.reviewedAt || '',
         'Reviewed By': report.reviewedBy || '',
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Toilet Reports');

      // Generate buffer
      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
   } catch (error) {
      logger.error('Excel generation error:', error);
      throw new Error('Failed to generate Excel file');
   }
}

/**
 * Generate PDF from reports data
 * Note: You'll need to install a PDF library like 'pdfkit': npm install pdfkit @types/pdfkit
 */
export async function generatePDF(reports: any[]): Promise<Buffer> {
   const browser = await puppeteer.launch();
   const page = await browser.newPage();

   const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Toilet Reports Export</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <p>Total Reports: ${reports.length}</p>
        <table>
          <thead>
            <tr>
              <th>Submitter</th>
              <th>Location</th>
              <th>Condition</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${reports
               .map(
                  report => `
              <tr>
                <td>${report.submitterName}</td>
                <td>${report.state}, ${report.lga}</td>
                <td>${report.toiletCondition}</td>
                <td>${report.status}</td>
                <td>${new Date(report.createdAt).toLocaleDateString()}</td>
              </tr>
            `
               )
               .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

   await page.setContent(htmlContent);
   const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
   });

   await browser.close();

   // Convert Uint8Array to Buffer - this fixes the TypeScript error
   return Buffer.from(pdfUint8Array);
}
