import { NextFunction, Request, Response } from 'express';
import { envConfig } from '../config';
import { ErrorRequestHandler } from 'express';
import chalk from 'chalk';
export class ApiError extends Error {
   statusCode: number;
   isOperational: boolean;

   constructor(statusCode: number, message: string, isOperational = true) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      console.log('MESSAGE:', message);
      Error.captureStackTrace(this, this.constructor);
   }
}

export const notFoundHandler = (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   const error = new ApiError(404, `Route not found: ${req.originalUrl}`);
   next(error);
};

export const temporarilyDisabled = (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   const error = new ApiError(540, `This has temporarily been disabled!`);
   next(error);
};

// Global error handling middleware - use ErrorRequestHandler type
export const errorHandler: ErrorRequestHandler = (
   err: any,
   req: Request,
   res: Response,
   next: NextFunction
): void => {
   console.error('Global error handler:', err);

   // Handle Zod validation errors
   if (err.name === 'ZodError') {
      res.status(400).json({
         success: false,
         message: 'Validation failed',
         errors: err.errors,
      });
      return;
   }

   const chalkColor = {
      error: chalk.red,
      success: chalk.green,
      getReq: chalk.magenta,
      postReq: chalk.cyan,
   };
   const { hostname, originalUrl, protocol, method } = req;
   console.log(
      `${
         method === 'GET'
            ? chalkColor.getReq(method)
            : chalkColor.postReq(method)
      }  ${protocol}://${hostname}:${envConfig.PORT}${originalUrl}`
   );
   next();

   // Handle JWT errors
   if (err.name === 'JsonWebTokenError') {
      res.status(401).json({
         success: false,
         message: 'Invalid token',
      });
      return;
   }

   // Handle Prisma errors
   if (err.code && err.code.startsWith('P')) {
      res.status(500).json({
         success: false,
         message: 'Database operation failed',
         ...(process.env.NODE_ENV === 'development' && { error: err.message }),
      });
      return;
   }

   // Default error response
   res.status(500).json({
      success: false,
      message:
         process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message || 'Something went wrong!',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
   });
};

// Helper functions for common errors
export const notFoundError = (resource: string) => {
   return new ApiError(404, `${resource} not found`);
};

export const badRequestError = (message: string) => {
   return new ApiError(400, message);
};

export const unauthorizedError = (message = 'Unauthorized') => {
   return new ApiError(401, message);
};

export const forbiddenError = (message = 'Forbidden') => {
   return new ApiError(403, message);
};
