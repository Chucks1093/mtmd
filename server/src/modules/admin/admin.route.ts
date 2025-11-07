import { Router } from 'express';
import {
   setupFirstAdmin,
   inviteAdmin,
   acceptInvite,
   googleLogin,
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

// Public routes (no authentication required)
adminRouter.post('/setup/first-admin', setupFirstAdmin); // Setup first system admin
adminRouter.post('/accept-invite', acceptInvite); // Accept invitation
adminRouter.post('/login/google', googleLogin); // Google OAuth login

// Protected routes (require admin authentication)
adminRouter.post('/logout', authenticateAdmin, logout);
adminRouter.get('/profile', authenticateAdmin, getProfile);
adminRouter.get('/stats', authenticateAdmin, getAdminStats);

// System admin only routes
adminRouter.post('/invite', requireSystemAdmin, inviteAdmin); // Invite new admin
adminRouter.get('/', requireSystemAdmin, getAllAdmins); // Get all admins
adminRouter.patch('/:id', requireSystemAdmin, updateAdmin); // Update admin
adminRouter.delete('/:id', requireSystemAdmin, deleteAdmin); // Delete admin

export default adminRouter;
