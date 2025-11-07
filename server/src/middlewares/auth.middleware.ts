import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service';
import { logger } from '../utils/logger.utils';

// Extend Express Request type to include admin
declare global {
   namespace Express {
      interface Request {
         admin?: {
            id: string;
            email: string;
            name: string;
            role: 'SYSTEM_ADMIN' | 'ADMIN';
            status: string;
         };
      }
   }
}

export const authenticateAdmin = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      // Get token from Authorization header
      const token = AuthService.extractTokenFromHeader(
         req.headers.authorization
      );

      if (!token) {
         res.status(401).json({
            success: false,
            message: 'Access denied. No valid token provided.',
         });
         return;
      }

      // Validate session using AuthService
      const validation = await AuthService.validateSession(token);

      if (!validation.valid || !validation.admin) {
         res.status(401).json({
            success: false,
            message: validation.message || 'Invalid or expired session token.',
         });
         return;
      }

      // Add admin info to request object
      req.admin = {
         id: validation.admin.id,
         email: validation.admin.email,
         name: validation.admin.name,
         role: validation.admin.role as 'SYSTEM_ADMIN' | 'ADMIN',
         status: validation.admin.status,
      };

      next();
   } catch (error) {
      logger.error('Authentication error:', error);
      res.status(500).json({
         success: false,
         message: 'Authentication failed.',
      });
   }
};

export const requireSystemAdmin = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      // First run the basic admin authentication
      await authenticateAdmin(req, res, () => {});

      // Check if the request was already rejected by authenticateAdmin
      if (res.headersSent) {
         return;
      }

      // Check if admin has system admin role using AuthService
      if (!req.admin || !AuthService.isSystemAdmin(req.admin)) {
         res.status(403).json({
            success: false,
            message: 'Access denied. System admin privileges required.',
         });
         return;
      }

      next();
   } catch (error) {
      logger.error('System admin authentication error:', error);
      res.status(500).json({
         success: false,
         message: 'Authentication failed.',
      });
   }
};

export const optionalAuth = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const token = AuthService.extractTokenFromHeader(
         req.headers.authorization
      );

      if (token) {
         const validation = await AuthService.validateSession(token);

         if (validation.valid && validation.admin) {
            req.admin = {
               id: validation.admin.id,
               email: validation.admin.email,
               name: validation.admin.name,
               role: validation.admin.role as 'SYSTEM_ADMIN' | 'ADMIN',
               status: validation.admin.status,
            };
         }
      }

      next();
   } catch (error) {
      // For optional auth, we don't fail the request
      logger.warn('Optional authentication warning:', error);
      next();
   }
};

// Middleware to check if setup is complete (for first-time setup)
export const checkSetupComplete = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      // Skip setup check for setup endpoint
      if (req.path === '/setup/first-admin') {
         next();
         return;
      }

      // Check if any system admin exists by trying to validate any session
      // This is a simple check - in production you might want to cache this
      const { prisma } = require('../../utils/prisma.utils');
      const adminCount = await prisma.admin.count({
         where: { role: 'SYSTEM_ADMIN', status: 'ACTIVE' },
      });

      if (adminCount === 0) {
         res.status(503).json({
            success: false,
            message: 'System setup incomplete. Please complete initial setup.',
            setupRequired: true,
            setupUrl: AuthService.generateSetupUrl(),
         });
         return;
      }

      next();
   } catch (error) {
      logger.error('Setup check error:', error);
      next(); // Continue anyway to avoid breaking the app
   }
};

// Middleware to check specific permissions
export const requireRole = (role: 'SYSTEM_ADMIN' | 'ADMIN') => {
   return async (
      req: Request,
      res: Response,
      next: NextFunction
   ): Promise<void> => {
      try {
         // First run authentication
         await authenticateAdmin(req, res, () => {});

         // Check if the request was already rejected
         if (res.headersSent) {
            return;
         }

         // Check role using AuthService
         if (!req.admin || !AuthService.hasRole(req.admin, role)) {
            res.status(403).json({
               success: false,
               message: `Access denied. ${role} role required.`,
            });
            return;
         }

         next();
      } catch (error) {
         logger.error('Role check error:', error);
         res.status(500).json({
            success: false,
            message: 'Authorization failed.',
         });
      }
   };
};
