import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { envConfig } from '../config';
import { Request, Response } from 'express';
const createKeyGenerator =
   () =>
   (req: Request): string => {
      // Use user ID if authenticated, otherwise IP
      return (req as any).user?.id || req.ip;
   };

export const appRateLimit: RateLimitRequestHandler = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: envConfig.MODE === 'production' ? 1000 : 10000, // More lenient in dev
   message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes',
      type: 'RATE_LIMIT_EXCEEDED',
   },
   standardHeaders: true,
   legacyHeaders: false,
   keyGenerator: createKeyGenerator(),
   handler: (req: Request, res: Response) => {
      res.status(429).json({
         error: 'Too many requests',
         message: 'Rate limit exceeded. Please try again later.',
         retryAfter: '15 minutes',
         timestamp: new Date().toISOString(),
      });
   },
});
