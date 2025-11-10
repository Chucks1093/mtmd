import { Request, Response, NextFunction } from 'express';
import {
   createReportSchema,
   getReportSchema,
   filterReportsSchema,
   updateReportStatusSchema,
   getReportsByLocationSchema,
   exportReportsSchema,
} from './report.schema';
import {
   createReportRepository,
   deleteReportRepository,
   getReportByIdRepository,
   getPaginatedReportsRepository,
   updateReportStatusRepository,
   getReportsByLocationRepository,
   getReportStatsRepository,
   getRecentReportsRepository,
   generateCSV,
   generateExcel,
   generatePDF,
} from './report.utils';
import { SendMail, SendMailAsync } from '../../utils/mail.utils';
import { logger } from '../../utils/logger.utils';

/**
 * Create a new toilet report submission
 */
export const createReport = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      // Validate request body against our schema
      const validatedData = createReportSchema.parse(req.body);

      // Create new report
      const newReport = await createReportRepository(validatedData);

      // Send confirmation email if email provided
      if (newReport.submitterEmail) {
         SendMailAsync({
            to: newReport.submitterEmail,
            subject:
               'Toilet Report Submission Received - National Toilet Campaign',
            html: `
          <h2>Thank you for your submission!</h2>
          <p>Dear ${newReport.submitterName},</p>
          <p>We have received your toilet report for <strong>${newReport.lga}, ${newReport.state}</strong>.</p>
          <p>Your report ID is: <strong>${newReport.id}</strong></p>
          <p>Our team will review your submission and update the status accordingly.</p>
          <p>Thank you for contributing to better sanitation in Nigeria!</p>
        `,
         });
      }

      res.status(201).json({
         success: true,
         message: 'Toilet report submitted successfully',
         data: newReport,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get a specific report by ID
 */
export const getReport = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { id } = getReportSchema.parse(req.params);

      const report = await getReportByIdRepository(id);

      if (!report) {
         res.status(404).json({
            success: false,
            message: 'Report not found',
         });
         return;
      }

      res.status(200).json({
         success: true,
         message: 'Report retrieved successfully',
         data: report,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get all reports with filtering and pagination
 */
export const getAllReports = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      // Parse query parameters with defaults
      const filter = filterReportsSchema.parse({
         page: req.query.page ? parseInt(req.query.page as string) : 1,
         limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
         status: req.query.status,
         state: req.query.state,
         lga: req.query.lga,
         facilityType: req.query.facilityType,
         toiletCondition: req.query.toiletCondition,
      });

      const paginatedData = await getPaginatedReportsRepository(filter);

      res.status(200).json({
         success: true,
         message: 'Reports retrieved successfully',
         data: paginatedData,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get reports by location for map visualization
 */
export const getReportsByLocation = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { state, lga } = getReportsByLocationSchema.parse(req.query);

      const reports = await getReportsByLocationRepository(state, lga);

      res.status(200).json({
         success: true,
         message: 'Location reports retrieved successfully',
         data: reports,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Update report status (Admin only)
 */
export const updateReportStatus = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { id } = getReportSchema.parse(req.params);
      const updateData = updateReportStatusSchema.parse({
         id,
         ...req.body,
      });

      const existingReport = await getReportByIdRepository(id);

      if (!existingReport) {
         res.status(404).json({
            success: false,
            message: 'Report not found',
         });
         return;
      }

      const updatedReport = await updateReportStatusRepository(updateData);

      // Send status update email if email provided
      if (existingReport.submitterEmail) {
         const statusMessage = {
            APPROVED: 'approved and will be displayed on our public map',
            REJECTED: 'reviewed but could not be approved at this time',
            PENDING: 'under review',
         };

         SendMail({
            to: existingReport.submitterEmail,
            subject: `Report Status Update - National Toilet Campaign`,
            html: `
          <h2>Report Status Update</h2>
          <p>Dear ${existingReport.submitterName},</p>
          <p>Your toilet report (ID: ${existingReport.id}) has been ${
             statusMessage[updateData.status]
          }.</p>
          ${
             updateData.adminNotes
                ? `<p><strong>Admin Notes:</strong> ${updateData.adminNotes}</p>`
                : ''
          }
          <p>Thank you for your contribution to improving sanitation in Nigeria!</p>
        `,
         });
      }

      res.status(200).json({
         success: true,
         message: 'Report status updated successfully',
         data: updatedReport,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Delete a report (Admin only)
 */
export const deleteReport = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { id } = getReportSchema.parse(req.params);

      const existingReport = await getReportByIdRepository(id);

      if (!existingReport) {
         res.status(404).json({
            success: false,
            message: 'Report not found',
         });
         return;
      }

      await deleteReportRepository(id);

      res.status(200).json({
         success: true,
         message: 'Report deleted successfully',
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get campaign statistics and analytics
 */
export const getReportStats = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      logger.info({
         message: 'checked',
      });
      const stats = await getReportStatsRepository();

      res.status(200).json({
         success: true,
         message: 'Report statistics retrieved successfully',
         data: stats,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get recent reports for dashboard
 */
export const getRecentReports = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const reports = await getRecentReportsRepository(limit);

      res.status(200).json({
         success: true,
         message: 'Recent reports retrieved successfully',
         data: reports,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Export reports data in various formats (Admin only)
 */
export const exportReports = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      // Validate query parameters
      const validatedParams = exportReportsSchema.parse({
         format: req.query.format,
         status: req.query.status,
         state: req.query.state,
         lga: req.query.lga,
         facilityType: req.query.facilityType,
         toiletCondition: req.query.toiletCondition,
         page: req.query.page ? parseInt(req.query.page as string) : undefined,
         limit: req.query.limit ? parseInt(req.query.limit as string) : 1000, // Default to larger limit for exports
      });

      logger.info('Exporting reports', {
         format: validatedParams.format,
         filters: validatedParams,
         adminId: req.admin?.id,
      });

      // Get all reports based on filters (use large limit for export)
      const reportsData = await getPaginatedReportsRepository({
         page: validatedParams.page || 1,
         limit: validatedParams.limit || 1000,
         status: validatedParams.status,
         state: validatedParams.state,
         lga: validatedParams.lga,
         facilityType: validatedParams.facilityType,
         toiletCondition: validatedParams.toiletCondition,
      });

      const { format } = validatedParams;
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `toilet_reports_${timestamp}`;

      // Set appropriate headers based on format
      switch (format) {
         case 'csv':
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader(
               'Content-Disposition',
               `attachment; filename="${filename}.csv"`
            );

            // Generate CSV
            const csvData = generateCSV(reportsData.reports);
            res.send(csvData);
            break;

         case 'excel':
            res.setHeader(
               'Content-Type',
               'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
               'Content-Disposition',
               `attachment; filename="${filename}.xlsx"`
            );

            // Generate Excel (you'll need to install xlsx package)
            const excelBuffer = await generateExcel(reportsData.reports);
            res.send(excelBuffer);
            break;

         case 'pdf':
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
               'Content-Disposition',
               `attachment; filename="${filename}.pdf"`
            );

            // Generate PDF (you'll need to install pdfkit or similar)
            const pdfBuffer = await generatePDF(reportsData.reports);
            console.log('GENERATING PDF');
            res.send(pdfBuffer);
            break;

         default:
            res.status(400).json({
               success: false,
               message: 'Unsupported export format',
            });
      }

      logger.info('Reports export completed', {
         format,
         recordCount: reportsData.reports.length,
         adminId: req.admin?.id,
      });
   } catch (error) {
      logger.error('Export reports error:', error);
      next(error);
   }
};
