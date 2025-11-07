import { Request, Response, NextFunction } from 'express';
import {
   inviteAdminSchema,
   acceptInviteSchema,
   updateAdminSchema,
   getAdminSchema,
   filterAdminsSchema,
   setupFirstAdminSchema,
} from './admin.schema';
import {
   createFirstSystemAdminRepository,
   inviteAdminRepository,
   getAdminByInviteTokenRepository,
   activateAdminRepository,
   getAdminByGoogleIdRepository,
   getPaginatedAdminsRepository,
   updateAdminRepository,
   deleteAdminRepository,
   getAdminStatsRepository,
   getAdminByIdRepository,
} from './admin.utils';
import AuthService from '../../services/auth.service';
import { logger } from '../../utils/logger.utils';
import { SendMail } from '../../utils/mail.util';

/**
 * Setup first system admin (only works if no system admin exists)
 */
export const setupFirstAdmin = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const validatedData = setupFirstAdminSchema.parse(req.body);

      // Verify setup key
      const expectedSetupKey = process.env.FIRST_ADMIN_SETUP_KEY;
      if (!expectedSetupKey || validatedData.setupKey !== expectedSetupKey) {
         res.status(401).json({
            success: false,
            message: 'Invalid setup key',
         });
         return;
      }

      // Verify Google token first
      const googleCredentials = await AuthService.verifyGoogleToken(
         validatedData.googleId
      );

      console.log('GOOGLE_CREDENTIALS', googleCredentials);

      await createFirstSystemAdminRepository({
         ...validatedData,
         googleId: googleCredentials.googleId,
         email: googleCredentials.email,
         name: validatedData.name || googleCredentials.name,
         profilePicture: googleCredentials.profilePicture,
      });

      // Authenticate with Google to create session
      const loginResult = await AuthService.authenticateWithGoogle(
         googleCredentials,
         req.headers['user-agent'],
         req.ip
      );

      if (!loginResult.success) {
         res.status(500).json({
            success: false,
            message: 'Failed to create admin session',
         });
         return;
      }

      res.status(201).json({
         success: true,
         message: 'First system admin created successfully',
         data: {
            admin: loginResult.admin,
            token: loginResult.token,
         },
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Invite new admin (System Admin only)
 */
export const inviteAdmin = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const validatedData = inviteAdminSchema.parse(req.body);
      const invitedBy = req.admin!.id;

      // System admins can invite anyone, regular admins can only invite other regular admins
      if (
         req.admin!.role !== 'SYSTEM_ADMIN' &&
         validatedData.role === 'SYSTEM_ADMIN'
      ) {
         res.status(403).json({
            success: false,
            message: 'Only system admins can invite other system admins',
         });
         return;
      }

      const newAdmin = await inviteAdminRepository(validatedData, invitedBy);

      // Generate invitation URL using AuthService
      const inviteLink = AuthService.generateInviteUrl(newAdmin.inviteToken!);

      SendMail({
         to: newAdmin.email,
         subject: 'Admin Invitation - National Toilet Campaign',
         html: `
        <h2>You've been invited to join as an admin</h2>
        <p>Dear ${newAdmin.name},</p>
        <p>You have been invited by ${
           req.admin!.name
        } to join the National Toilet Campaign admin panel as a <strong>${
           newAdmin.role
        }</strong>.</p>
        <p>Click the link below to accept your invitation:</p>
        <p><a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Accept Invitation</a></p>
        <p>This invitation will expire in 7 days.</p>
        <p>If you didn't expect this invitation, you can safely ignore this email.</p>
      `,
      });

      res.status(201).json({
         success: true,
         message: 'Admin invitation sent successfully',
         data: {
            id: newAdmin.id,
            email: newAdmin.email,
            name: newAdmin.name,
            role: newAdmin.role,
            status: newAdmin.status,
            inviteUrl: inviteLink,
         },
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Accept invitation and activate admin account
 */
export const acceptInvite = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const validatedData = acceptInviteSchema.parse(req.body);

      // Verify invite token
      const pendingAdmin = await getAdminByInviteTokenRepository(
         validatedData.inviteToken
      );
      if (!pendingAdmin) {
         res.status(400).json({
            success: false,
            message: 'Invalid or expired invitation token',
         });
         return;
      }

      // Verify Google token
      const googleCredentials = await AuthService.verifyGoogleToken(
         validatedData.googleId
      );

      // Check if Google account is already used by another admin
      const existingAdmin = await getAdminByGoogleIdRepository(
         googleCredentials.googleId
      );
      if (existingAdmin) {
         res.status(400).json({
            success: false,
            message:
               'This Google account is already associated with another admin',
         });
         return;
      }

      // Activate admin
      await activateAdminRepository(validatedData.inviteToken, {
         googleId: googleCredentials.googleId,
         email: pendingAdmin.email, // Use existing email
         name: pendingAdmin.name, // Use existing name
         profilePicture: googleCredentials.profilePicture,
      });

      // Authenticate with Google to create session
      const loginResult = await AuthService.authenticateWithGoogle(
         googleCredentials,
         req.headers['user-agent'],
         req.ip
      );

      if (!loginResult.success) {
         res.status(500).json({
            success: false,
            message: 'Failed to create admin session',
         });
         return;
      }

      res.status(200).json({
         success: true,
         message: 'Invitation accepted successfully',
         data: {
            admin: loginResult.admin,
            token: loginResult.token,
         },
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Google OAuth login
 */
export const googleLogin = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { googleToken } = req.body;

      if (!googleToken) {
         res.status(400).json({
            success: false,
            message: 'Google token is required',
         });
         return;
      }

      // Verify Google token and get credentials
      const googleCredentials =
         await AuthService.verifyGoogleToken(googleToken);

      // Authenticate with Google
      const loginResult = await AuthService.authenticateWithGoogle(
         googleCredentials,
         req.headers['user-agent'],
         req.ip
      );

      if (!loginResult.success) {
         res.status(401).json({
            success: false,
            message: loginResult.message,
         });
         return;
      }

      res.status(200).json({
         success: true,
         message: 'Login successful',
         data: {
            admin: loginResult.admin,
            token: loginResult.token,
         },
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Logout admin
 */
export const logout = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const token = AuthService.extractTokenFromHeader(
         req.headers.authorization
      );

      if (token) {
         const logoutSuccess = await AuthService.logout(token);

         if (!logoutSuccess) {
            logger.warn('Failed to invalidate session during logout');
         }
      }

      res.status(200).json({
         success: true,
         message: 'Logged out successfully',
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get all admins (System Admin only)
 */
export const getAllAdmins = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const filter = filterAdminsSchema.parse({
         page: req.query.page ? parseInt(req.query.page as string) : 1,
         limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
         role: req.query.role,
         status: req.query.status,
         search: req.query.search,
      });

      const paginatedData = await getPaginatedAdminsRepository(filter);

      res.status(200).json({
         success: true,
         message: 'Admins retrieved successfully',
         data: paginatedData,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Update admin (System Admin only)
 */
export const updateAdmin = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { id } = getAdminSchema.parse(req.params);
      const updateData = updateAdminSchema.parse({ id, ...req.body });

      // Check if admin exists
      const existingAdmin = await getAdminByIdRepository(id);
      if (!existingAdmin) {
         res.status(404).json({
            success: false,
            message: 'Admin not found',
         });
         return;
      }

      // Prevent admins from updating their own role
      if (id === req.admin!.id && updateData.role) {
         res.status(400).json({
            success: false,
            message: 'Cannot update your own role',
         });
         return;
      }

      const updatedAdmin = await updateAdminRepository(updateData);

      res.status(200).json({
         success: true,
         message: 'Admin updated successfully',
         data: {
            id: updatedAdmin.id,
            email: updatedAdmin.email,
            name: updatedAdmin.name,
            role: updatedAdmin.role,
            status: updatedAdmin.status,
         },
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Delete admin (System Admin only)
 */
export const deleteAdmin = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { id } = getAdminSchema.parse(req.params);

      // Prevent admins from deleting themselves
      if (id === req.admin!.id) {
         res.status(400).json({
            success: false,
            message: 'Cannot delete your own account',
         });
         return;
      }

      const existingAdmin = await getAdminByIdRepository(id);
      if (!existingAdmin) {
         res.status(404).json({
            success: false,
            message: 'Admin not found',
         });
         return;
      }

      await deleteAdminRepository(id);

      res.status(200).json({
         success: true,
         message: 'Admin deleted successfully',
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get admin statistics
 */
export const getAdminStats = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const stats = await getAdminStatsRepository();

      res.status(200).json({
         success: true,
         message: 'Admin statistics retrieved successfully',
         data: stats,
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Get current admin profile
 */
export const getProfile = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const admin = await getAdminByIdRepository(req.admin!.id);

      if (!admin) {
         res.status(404).json({
            success: false,
            message: 'Admin profile not found',
         });
         return;
      }

      res.status(200).json({
         success: true,
         message: 'Profile retrieved successfully',
         data: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            profilePicture: admin.profilePicture,
            lastLoginAt: admin.lastLoginAt,
            createdAt: admin.createdAt,
         },
      });
   } catch (error) {
      next(error);
   }
};
