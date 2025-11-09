import { Router } from 'express';
import {
   createReport,
   getReport,
   getAllReports,
   getReportsByLocation,
   updateReportStatus,
   deleteReport,
   getReportStats,
   getRecentReports,
   exportReports,
} from './report.controller';
import { authenticateAdmin } from '../../middlewares/auth.middleware'; // Assuming you have auth middleware

const reportRouter = Router();

// Public routes (for citizens to submit reports and view approved reports)
reportRouter.post('/', createReport);
reportRouter.get('/location', getReportsByLocation); // For map visualization
reportRouter.get('/stats', getReportStats); // For public statistics
reportRouter.get('/recent', getRecentReports); // For recent approved reports

// Admin routes (protected)
reportRouter.get('/export', authenticateAdmin, exportReports);
reportRouter.get('/', authenticateAdmin, getAllReports); // Get all reports with filters
reportRouter.get('/:id', authenticateAdmin, getReport); // Get specific report
reportRouter.patch('/:id/status', authenticateAdmin, updateReportStatus); // Update report status
reportRouter.delete('/:id', authenticateAdmin, deleteReport); // Delete report

export default reportRouter;
