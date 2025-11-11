import { Router } from 'express';
import {
   createPartner,
   getAllPartners,
   getPublicPartners,
   getPartner,
   updatePartner,
   deletePartner,
   getFeaturedPartners,
   getPartnersByType,
   getPartnerStats,
   updatePartnerDisplayOrder,
   bulkUpdatePartnerStatus,
} from './partner.controller';
import {
   authenticateAdmin,
   optionalAuth,
} from '../../middlewares/auth.middleware';

const partnerRouter = Router();

// Public routes (no authentication required)
partnerRouter.get('/public', getPublicPartners);
partnerRouter.get('/featured', getFeaturedPartners);
partnerRouter.get('/type/:type', getPartnersByType);

// Mixed routes (optional authentication - different data based on auth)
partnerRouter.get('/:id', optionalAuth, getPartner);

// Admin routes (authentication required)
partnerRouter.post('/', authenticateAdmin, createPartner);
partnerRouter.get('/', authenticateAdmin, getAllPartners);
partnerRouter.patch('/:id', authenticateAdmin, updatePartner);
partnerRouter.delete('/:id', authenticateAdmin, deletePartner);
partnerRouter.get('/stats/analytics', authenticateAdmin, getPartnerStats);
partnerRouter.patch(
   '/:id/display-order',
   authenticateAdmin,
   updatePartnerDisplayOrder
);
partnerRouter.patch('/bulk/status', authenticateAdmin, bulkUpdatePartnerStatus);

export default partnerRouter;
