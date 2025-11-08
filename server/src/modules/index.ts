import { Router } from 'express';
import adminRouter from './admin/admin.route';
import reportRouter from './report/report.route';
import uploadRouter from './upload/upload.route';

const router = Router();

// Register all feature routes under the /v1 prefix
router.use('/upload', uploadRouter);
router.use('/admin', adminRouter);
router.use('/report', reportRouter);

export default router;
