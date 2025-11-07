// Example: Converting your existing schemas to work with Tspec
// src/modules/admin/admin.tspec.ts

import { Tspec } from 'tspec';

// Your existing Zod schemas can stay as-is for validation
// Add TypeScript interfaces for Tspec documentation

/** @tspec-description Admin user account */
export interface Admin {
   /** Unique identifier for the admin */
   id: string;
   /** Admin email address */
   email: string;
   /** Admin full name */
   name: string;
   /** Profile picture URL from Google */
   profilePicture?: string;
   /** Google account ID */
   googleId?: string;
   /** Admin role level */
   role: 'SYSTEM_ADMIN' | 'ADMIN';
   /** Admin account status */
   status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
   /** Last login timestamp */
   lastLoginAt?: string;
   /** Whether admin account is active */
   isActive: boolean;
   /** ID of admin who sent the invitation */
   invitedBy?: string;
   /** ID of admin who created this admin */
   createdBy?: string;
   /** Account creation timestamp */
   createdAt: string;
   /** Account update timestamp */
   updatedAt: string;
}

/** @tspec-description Request to invite a new admin */
export interface InviteAdminRequest {
   /** Email address of the admin to invite */
   email: string;
   /** Full name of the admin to invite */
   name: string;
   /** Role to assign to the new admin */
   role?: 'SYSTEM_ADMIN' | 'ADMIN';
}

/** @tspec-description Google OAuth login request */
export interface GoogleLoginRequest {
   /** Google ID token from OAuth */
   googleToken: string;
}

/** @tspec-description Setup first system admin request */
export interface SetupFirstAdminRequest {
   /** Email address (optional, will use Google email) */
   email?: string;
   /** Name (optional, will use Google name) */
   name?: string;
   /** Google ID token from OAuth */
   googleId: string;
   /** Secret setup key from environment variables */
   setupKey: string;
}

/** @tspec-description Authentication response */
export interface AuthResponse {
   success: boolean;
   message: string;
   data: {
      admin: {
         id: string;
         email: string;
         name: string;
         role: string;
         profilePicture?: string;
      };
      /** Session token for authentication */
      token: string;
   };
}

/** @tspec-description Standard success response */
export interface SuccessResponse<T = any> {
   success: true;
   message: string;
   data?: T;
}

/** @tspec-description Standard error response */
export interface ErrorResponse {
   success: false;
   message: string;
   errors?: any[];
}

// Define your API routes using Tspec syntax
export type AdminApiSpec = Tspec.DefineApiSpec<{
   tags: ['Admin'];
   security: 'bearerAuth';
   paths: {
      /** Setup first system admin */
      '/api/v1/admin/setup/first-admin': {
         post: {
            summary: 'Setup first system admin';
            description: 'Creates the first system admin account (only works if no system admin exists)';
            body: SetupFirstAdminRequest;
            responses: {
               /** First system admin created successfully */
               201: AuthResponse;
               /** Invalid setup key */
               401: ErrorResponse;
               /** System admin already exists or invalid data */
               400: ErrorResponse;
            };
         };
      };

      /** Google OAuth login */
      '/api/v1/admin/login/google': {
         post: {
            summary: 'Google OAuth login';
            description: 'Authenticate admin using Google OAuth token';
            body: GoogleLoginRequest;
            responses: {
               /** Login successful */
               200: AuthResponse;
               /** Invalid Google token */
               400: ErrorResponse;
               /** No admin account found for this Google account or account not active */
               401: ErrorResponse;
            };
         };
      };

      /** Get current admin profile */
      '/api/v1/admin/profile': {
         get: {
            summary: 'Get current admin profile';
            description: "Get the authenticated admin's profile information";
            responses: {
               /** Profile retrieved successfully */
               200: SuccessResponse<{
                  id: string;
                  email: string;
                  name: string;
                  role: string;
                  profilePicture?: string;
                  lastLoginAt?: string;
                  createdAt: string;
               }>;
               /** Unauthorized */
               401: ErrorResponse;
               /** Admin profile not found */
               404: ErrorResponse;
            };
         };
      };

      /** Invite new admin */
      '/api/v1/admin/invite': {
         post: {
            summary: 'Invite new admin (System Admin only)';
            description: 'Send invitation to a new admin via email';
            body: InviteAdminRequest;
            responses: {
               /** Admin invitation sent successfully */
               201: SuccessResponse<{
                  id: string;
                  email: string;
                  name: string;
                  role: string;
                  status: string;
                  inviteUrl: string;
               }>;
               /** Email already exists or invalid data */
               400: ErrorResponse;
               /** Unauthorized */
               401: ErrorResponse;
               /** System admin privileges required */
               403: ErrorResponse;
            };
         };
      };

      /** Get all admins */
      '/api/admin': {
         get: {
            summary: 'Get all admins (System Admin only)';
            description: 'Retrieve all admins with filtering and pagination';
            query: {
               /** Page number */
               page?: number;
               /** Number of items per page */
               limit?: number;
               /** Filter by role */
               role?: 'SYSTEM_ADMIN' | 'ADMIN';
               /** Filter by status */
               status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
               /** Search by name or email */
               search?: string;
            };
            responses: {
               /** Admins retrieved successfully */
               200: SuccessResponse<{
                  admins: Admin[];
                  total: number;
                  page: number;
                  limit: number;
                  totalPages: number;
               }>;
               /** Unauthorized */
               401: ErrorResponse;
               /** System admin privileges required */
               403: ErrorResponse;
            };
         };
      };

      /** Update admin */
      '/api/v1/admin/:id': {
         patch: {
            summary: 'Update admin (System Admin only)';
            description: 'Update admin details and permissions';
            path: {
               /** Admin ID */
               id: string;
            };
            body: {
               /** Updated name */
               name?: string;
               /** Updated role */
               role?: 'SYSTEM_ADMIN' | 'ADMIN';
               /** Updated status */
               status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
               /** Whether admin is active */
               isActive?: boolean;
            };
            responses: {
               /** Admin updated successfully */
               200: SuccessResponse<{
                  id: string;
                  email: string;
                  name: string;
                  role: string;
                  status: string;
               }>;
               /** Cannot update your own role or invalid data */
               400: ErrorResponse;
               /** Unauthorized */
               401: ErrorResponse;
               /** System admin privileges required */
               403: ErrorResponse;
               /** Admin not found */
               404: ErrorResponse;
            };
         };

         delete: {
            summary: 'Delete admin (System Admin only)';
            description: 'Delete an admin account';
            path: {
               /** Admin ID */
               id: string;
            };
            responses: {
               /** Admin deleted successfully */
               200: SuccessResponse;
               /** Cannot delete your own account */
               400: ErrorResponse;
               /** Unauthorized */
               401: ErrorResponse;
               /** System admin privileges required */
               403: ErrorResponse;
               /** Admin not found */
               404: ErrorResponse;
            };
         };
      };
   };
}>;
