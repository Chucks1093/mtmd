// src/tspec.config.ts - Updated for your existing codebase
import { Tspec } from 'tspec';

const tspecOptions: Tspec.GenerateParams = {
   specPathGlobs: [
      'src/modules/**/*.tspec.ts', // Your new Tspec definition files
      'src/modules/**/*.schema.ts', // Your existing Zod schemas (for type extraction)
      'src/types/**/*.ts', // Any global types
   ],
   tsconfigPath: './tsconfig.json',
   specVersion: 3,
   openapi: {
      title: 'National Toilet Campaign API',
      version: '1.0.0',
      description:
         'API documentation for National Toilet Campaign - A platform for reporting and managing toilet facility conditions across Nigeria',
      servers: [
         {
            url: 'http://localhost:3000',
            description: 'Development server',
         },
         {
            url: 'https://nodejs-production-859c.up.railway.app',
            description: 'Production server',
         },
      ],

      securityDefinitions: {
         bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter the session token received after login',
         },
      },
   },
};

export default tspecOptions;
