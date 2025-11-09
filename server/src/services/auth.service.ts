import { OAuth2Client } from 'google-auth-library';
import {
   getAdminByGoogleIdRepository,
   updateAdminLoginRepository,
   createAdminSessionRepository,
   getAdminSessionRepository,
   deleteAdminSessionRepository,
} from '../modules/admin/admin.utils';
import { envConfig } from '../config';

interface GoogleTokenPayload {
   googleId: string;
   email: string;
   name: string;
   profilePicture?: string;
   emailVerified: boolean;
}

interface LoginResult {
   success: boolean;
   admin?: {
      id: string;
      email: string;
      name: string;
      role: string;
      profilePicture?: string;
   };
   token?: string;
   message?: string;
}

class AuthService {
   private client: OAuth2Client;

   constructor() {
      this.client = new OAuth2Client(
         envConfig.GOOGLE_CLIENT_ID,
         envConfig.GOOGLE_CLIENT_SECRET,
         `${envConfig.BACKEND_URL}/api/v1/admin/auth/google/callback`
      );
   }

   /**
    * Verify Google ID token and extract user information
    */
   async verifyGoogleToken(token: string): Promise<GoogleTokenPayload> {
      try {
         const ticket = await this.client.verifyIdToken({
            idToken: token,
            audience: envConfig.GOOGLE_CLIENT_ID,
         });

         const payload = ticket.getPayload();

         if (!payload) {
            throw new Error('Invalid token payload');
         }

         return {
            googleId: payload.sub!,
            email: payload.email!,
            name: payload.name!,
            profilePicture: payload.picture,
            emailVerified: payload.email_verified || false,
         };
      } catch (error) {
         throw new Error('Invalid Google token');
      }
   }

   /**
    * Generate Google OAuth authorization URL
    */
   generateAuthUrl(state?: string): string {
      const scopes = ['openid', 'email', 'profile'];

      return this.client.generateAuthUrl({
         access_type: 'offline',
         scope: scopes,
         state: state, // Can include invite token here
         prompt: 'select_account', // Force account selection
      });
   }

   /**
    * Authenticate admin with Google credentials
    */
   async authenticateWithGoogle(
      googleCredentials: GoogleTokenPayload,
      userAgent?: string,
      ipAddress?: string
   ): Promise<LoginResult> {
      try {
         // Find admin by Google ID
         const admin = await getAdminByGoogleIdRepository(
            googleCredentials.googleId
         );

         if (!admin) {
            return {
               success: false,
               message: 'No admin account found for this Google account',
            };
         }

         // Check if admin is active
         if (admin.status !== 'ACTIVE' || !admin.isActive) {
            return {
               success: false,
               message: 'Admin account is not active',
            };
         }

         // Update last login
         await updateAdminLoginRepository(googleCredentials.googleId);

         // Create session
         const session = await createAdminSessionRepository(
            admin.id,
            userAgent,
            ipAddress
         );

         return {
            success: true,
            admin: {
               id: admin.id,
               email: admin.email,
               name: admin.name,
               role: admin.role,
               profilePicture: admin.profilePicture || undefined,
            },
            token: session.token,
         };
      } catch (error) {
         return {
            success: false,
            message: 'Authentication failed',
         };
      }
   }

   /**
    * Validate session token and get admin info
    */
   async validateSession(token: string): Promise<{
      valid: boolean;
      admin?: any;
      message?: string;
   }> {
      try {
         const session = await getAdminSessionRepository(token);

         if (!session || !session.admin) {
            return {
               valid: false,
               message: 'Invalid or expired session',
            };
         }

         // Check if admin is still active
         if (session.admin.status !== 'ACTIVE' || !session.admin.isActive) {
            return {
               valid: false,
               message: 'Admin account is not active',
            };
         }

         return {
            valid: true,
            admin: {
               id: session.admin.id,
               email: session.admin.email,
               name: session.admin.name,
               role: session.admin.role,
               status: session.admin.status,
            },
         };
      } catch (error) {
         return {
            valid: false,
            message: 'Session validation failed',
         };
      }
   }

   /**
    * Logout admin (invalidate session)
    */
   async logout(token: string): Promise<boolean> {
      try {
         await deleteAdminSessionRepository(token);
         return true;
      } catch (error) {
         return false;
      }
   }

   /**
    * Check if admin has required role
    */
   hasRole(admin: any, requiredRole: 'SYSTEM_ADMIN' | 'ADMIN'): boolean {
      if (requiredRole === 'SYSTEM_ADMIN') {
         return admin.role === 'SYSTEM_ADMIN';
      }
      return admin.role === 'SYSTEM_ADMIN' || admin.role === 'ADMIN';
   }

   /**
    * Check if admin has system admin privileges
    */
   isSystemAdmin(admin: any): boolean {
      return admin.role === 'SYSTEM_ADMIN';
   }

   /**
    * Extract admin info from request headers
    */
   extractTokenFromHeader(authHeader?: string): string | null {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return null;
      }
      return authHeader.substring(7);
   }

   /**
    * Generate invite URL for email
    */
   generateInviteUrl(inviteToken: string): string {
      const baseUrl = envConfig.FRONTEND_URL;
      return `${baseUrl}/admin/accept-invite?token=${inviteToken}`;
   }

   /**
    * Generate setup URL for first admin
    */
   generateSetupUrl(): string {
      const baseUrl = envConfig.FRONTEND_URL;
      return `${baseUrl}/admin/setup`;
   }
}

export default new AuthService();
