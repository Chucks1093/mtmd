import { envConfig } from './../../config';
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

// Google OAuth configuration
const GOOGLE_REDIRECT_URI = `${envConfig.BACKEND_URL}/api/v1/admin/auth/google/callback`;

/**
 * Initiate Google OAuth login
 */
export const initiateGoogleAuth = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      if (!envConfig.GOOGLE_CLIENT_ID) {
         logger.error('Google Client ID not configured');
         res.redirect(
            `${envConfig.FRONTEND_URL}/admin/auth?success=false&message=OAuth not configured`
         );
         return;
      }

      const state = Math.random().toString(36).substring(2, 15);

      // Store state in session or cache for validation (optional but recommended)
      const googleAuthUrl =
         `https://accounts.google.com/o/oauth2/v2/auth?` +
         `client_id=${envConfig.GOOGLE_CLIENT_ID}&` +
         `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
         `response_type=code&` +
         `scope=openid email profile&` +
         `state=${state}`;

      res.redirect(googleAuthUrl);
   } catch (error) {
      logger.error('Google OAuth initiation error:', error);
      res.redirect(
         `${envConfig.FRONTEND_URL}/admin/auth?success=false&message=Authentication failed`
      );
   }
};

/**
 * Handle Google OAuth callback
 */
export const googleAuthCallback = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   const { code, state } = req.query;

   try {
      if (!envConfig.GOOGLE_CLIENT_ID || !envConfig.GOOGLE_CLIENT_SECRET) {
         logger.error('Google OAuth credentials not configured');
         res.redirect(
            `${envConfig.FRONTEND_URL}/admin/auth?success=false&message=${encodeURIComponent('OAuth not configured')}`
         );
         return;
      }

      if (!code || typeof code !== 'string') {
         res.redirect(
            `${envConfig.FRONTEND_URL}/admin/auth?success=false&message=${encodeURIComponent('Authorization code missing')}`
         );
         return;
      }

      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
         },
         body: new URLSearchParams({
            client_id: envConfig.GOOGLE_CLIENT_ID,
            client_secret: envConfig.GOOGLE_CLIENT_SECRET,
            code: code,
            redirect_uri: GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
         }),
      });

      if (!tokenResponse.ok) {
         throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await tokenResponse.json();
      const { access_token, id_token } = tokens;

      if (!access_token) {
         throw new Error('No access token received from Google');
      }

      // Get user profile using access token
      const profileResponse = await fetch(
         'https://www.googleapis.com/oauth2/v2/userinfo',
         {
            headers: {
               Authorization: `Bearer ${access_token}`,
            },
         }
      );

      if (!profileResponse.ok) {
         throw new Error('Failed to fetch user profile');
      }

      const profile = await profileResponse.json();

      // Validate required profile fields
      if (!profile.id || !profile.email) {
         throw new Error('Incomplete profile data from Google');
      }

      // Create GoogleCredentials object similar to your existing verifyGoogleToken function
      const googleCredentials = {
         googleId: profile.id,
         email: profile.email,
         name: profile.name || profile.email,
         profilePicture: profile.picture,
         emailVerified: profile.verified_email,
      };

      // Authenticate using your existing service
      const loginResult = await AuthService.authenticateWithGoogle(
         googleCredentials,
         req.headers['user-agent'],
         req.ip
      );

      if (!loginResult.success || !loginResult.admin) {
         const errorMessage = loginResult.message || 'Authentication failed';
         res.redirect(
            `${envConfig.FRONTEND_URL}/admin/auth?success=false&message=${encodeURIComponent(errorMessage)}`
         );
         return;
      }

      // Now TypeScript knows loginResult.admin is defined
      const adminData = {
         id: loginResult.admin.id,
         email: loginResult.admin.email,
         name: loginResult.admin.name,
         role: loginResult.admin.role,
         profilePicture: loginResult.admin.profilePicture || '',
      };

      const queryParams = new URLSearchParams({
         success: 'true',
         message: 'Login successful',
         token: loginResult.token || '',
         admin: JSON.stringify(adminData),
      });

      res.redirect(
         `${envConfig.FRONTEND_URL}/admin/auth/callback?${queryParams.toString()}`
      );
   } catch (error) {
      logger.error('Google OAuth callback error:', error);
      const errorMessage =
         error instanceof Error ? error.message : 'Authentication failed';
      res.redirect(
         `${envConfig.FRONTEND_URL}/admin/auth?success=false&message=${encodeURIComponent(errorMessage)}`
      );
   }
};

/**
 * Setup first system admin (using OAuth flow)
 */
export const setupFirstAdminWithOAuth = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      if (!envConfig.GOOGLE_CLIENT_ID) {
         res.status(500).json({
            success: false,
            message: 'Google OAuth not configured',
         });
         return;
      }

      const { setupKey } = req.body;

      const expectedSetupKey = process.env.FIRST_ADMIN_SETUP_KEY;
      if (!expectedSetupKey || setupKey !== expectedSetupKey) {
         res.status(401).json({
            success: false,
            message: 'Invalid setup key',
         });
         return;
      }

      // Store setup key in session/cache and redirect to OAuth
      const state = `setup_${Math.random().toString(36).substring(2, 15)}`;

      const googleAuthUrl =
         `https://accounts.google.com/o/oauth2/v2/auth?` +
         `client_id=${envConfig.GOOGLE_CLIENT_ID}&` +
         `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
         `response_type=code&` +
         `scope=openid email profile&` +
         `state=${state}`;

      res.json({
         success: true,
         message: 'Redirecting to Google OAuth',
         redirectUrl: googleAuthUrl,
      });
   } catch (error) {
      next(error);
   }
};

// Keep all your existing functions unchanged
export const setupFirstAdmin = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const validatedData = setupFirstAdminSchema.parse(req.body);
      const expectedSetupKey = process.env.FIRST_ADMIN_SETUP_KEY;

      if (!expectedSetupKey || validatedData.setupKey !== expectedSetupKey) {
         res.status(401).json({
            success: false,
            message: 'Invalid setup key',
         });
         return;
      }

      const googleCredentials = await AuthService.verifyGoogleToken(
         validatedData.googleId
      );

      await createFirstSystemAdminRepository({
         ...validatedData,
         googleId: googleCredentials.googleId,
         email: googleCredentials.email,
         name: validatedData.name || googleCredentials.name,
         profilePicture: googleCredentials.profilePicture,
      });

      const loginResult = await AuthService.authenticateWithGoogle(
         googleCredentials,
         req.headers['user-agent'],
         req.ip
      );

      if (!loginResult.success || !loginResult.admin) {
         res.status(500).json({
            success: false,
            message: loginResult.message || 'Failed to create admin session',
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

export const inviteAdmin = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const validatedData = inviteAdminSchema.parse(req.body);
      const invitedBy = req.admin!.id;

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
      const inviteLink = AuthService.generateInviteUrl(newAdmin.inviteToken!);

      SendMail({
         to: newAdmin.email,
         subject: 'Admin Invitation - National Toilet Campaign',
         html: `
        <h2>You've been invited to join as an admin</h2>
        <p>Dear ${newAdmin.name},</p>
        <p>You have been invited by ${req.admin!.name} to join the National Toilet Campaign admin panel as a <strong>${newAdmin.role}</strong>.</p>
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

export const acceptInvite = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const validatedData = acceptInviteSchema.parse(req.body);

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

      const googleCredentials = await AuthService.verifyGoogleToken(
         validatedData.googleId
      );
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

      await activateAdminRepository(validatedData.inviteToken, {
         googleId: googleCredentials.googleId,
         email: pendingAdmin.email,
         name: pendingAdmin.name,
         profilePicture: googleCredentials.profilePicture,
      });

      const loginResult = await AuthService.authenticateWithGoogle(
         googleCredentials,
         req.headers['user-agent'],
         req.ip
      );

      if (!loginResult.success || !loginResult.admin) {
         res.status(500).json({
            success: false,
            message: loginResult.message || 'Failed to create admin session',
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

      const googleCredentials =
         await AuthService.verifyGoogleToken(googleToken);
      const loginResult = await AuthService.authenticateWithGoogle(
         googleCredentials,
         req.headers['user-agent'],
         req.ip
      );

      if (!loginResult.success || !loginResult.admin) {
         res.status(401).json({
            success: false,
            message: loginResult.message || 'Authentication failed',
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

export const updateAdmin = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { id } = getAdminSchema.parse(req.params);
      const updateData = updateAdminSchema.parse({ id, ...req.body });

      const existingAdmin = await getAdminByIdRepository(id);
      if (!existingAdmin) {
         res.status(404).json({
            success: false,
            message: 'Admin not found',
         });
         return;
      }

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

export const deleteAdmin = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const { id } = getAdminSchema.parse(req.params);

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
