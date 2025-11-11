import { Router } from 'express';
import {
   createDonation,
   verifyPayment,
   getDonation,
   getAllDonations,
   getDonationStats,
   getPublicDonationStats,
   paystackWebhook,
   cleanupExpiredDonations,
} from './donation.controller';
import {
   authenticateAdmin,
   optionalAuth,
} from '../../middlewares/auth.middleware';

const donationRouter = Router();

// Public routes (no authentication required)
donationRouter.post('/', createDonation);
donationRouter.post('/verify', verifyPayment);
donationRouter.get('/stats/public', getPublicDonationStats);
// TODO: Register on  Paystack
donationRouter.post('/webhook/paystack', paystackWebhook);

// Admin routes (authentication required)
donationRouter.get('/stats', authenticateAdmin, getDonationStats);
donationRouter.get('/', authenticateAdmin, getAllDonations);
donationRouter.get('/:id', authenticateAdmin, getDonation);

// Utility routes (for cron jobs/maintenance)
donationRouter.post('/cleanup', authenticateAdmin, cleanupExpiredDonations);

export default donationRouter;
