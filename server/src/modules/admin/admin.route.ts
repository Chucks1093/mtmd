import { Router } from 'express';
import {
   setupFirstAdmin,
   setupFirstAdminWithOAuth,
   inviteAdmin,
   acceptInvite,
   googleLogin,
   initiateGoogleAuth,
   googleAuthCallback,
   logout,
   getAllAdmins,
   updateAdmin,
   deleteAdmin,
   getAdminStats,
   getProfile,
} from './admin.controller';
import {
   authenticateAdmin,
   requireSystemAdmin,
} from '../../middlewares/auth.middleware';

const adminRouter = Router();

// OAuth routes (new)
adminRouter.get('/auth/google', initiateGoogleAuth);
adminRouter.get('/auth/google/callback', googleAuthCallback);

// Setup routes
// TODO: REMOVE THIS UNNECCEARY ENDPOINTS
adminRouter.post('/setup/first-admin', setupFirstAdmin); // Keep for backward compatibility
adminRouter.post('/setup/first-admin-oauth', setupFirstAdminWithOAuth); // New OAuth setup

// Authentication routes
adminRouter.post('/accept-invite', acceptInvite);
adminRouter.post('/login/google', googleLogin); // Keep for backward compatibility
adminRouter.post('/logout', authenticateAdmin, logout);

// Profile and stats
adminRouter.get('/profile', authenticateAdmin, getProfile);
adminRouter.get('/stats', authenticateAdmin, getAdminStats);

// Admin management (System Admin only)
adminRouter.post('/invite', requireSystemAdmin, inviteAdmin);
adminRouter.get('/', requireSystemAdmin, getAllAdmins);
adminRouter.patch('/:id', requireSystemAdmin, updateAdmin);
adminRouter.delete('/:id', requireSystemAdmin, deleteAdmin);

export default adminRouter;
