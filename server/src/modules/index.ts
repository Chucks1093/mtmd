import { Router } from 'express';
import adminRouter from './admin/admin.route';
import reportRouter from './report/report.route';
import uploadRouter from './upload/upload.route';
import donationRouter from './donation/donation.route';
import partnerRouter from './partner/partner.route';

const router = Router();

router.use('/upload', uploadRouter);
router.use('/admin', adminRouter);
router.use('/report', reportRouter);
router.use('/donation', donationRouter);
router.use('/partner', partnerRouter);

export default router;
