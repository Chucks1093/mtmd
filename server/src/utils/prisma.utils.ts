import { PrismaClient } from '@prisma/client';

// Use global variable to prevent multiple instances in development
// See: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

declare global {
   // eslint-disable-next-line no-var
   var prisma: PrismaClient | undefined;
}

// Export a singleton PrismaClient instance
export const prisma =
   global.prisma ||
   new PrismaClient({
      log:
         process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
   });

// Prevent multiple instances in development environment
if (process.env.NODE_ENV !== 'production') {
   global.prisma = prisma;
}
