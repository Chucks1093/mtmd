// src/app.ts
import express, { Express, Request, Response, RequestHandler } from 'express';
import { initTspecServer, TspecDocsMiddleware } from 'tspec';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware'; // Add notFoundHandler import
import router from './modules/index';
import { corsMiddleware } from './middlewares/cors.middleware';
import helmet from 'helmet';
import morgan from 'morgan';
import tspecOptions from './tspec.config';
import { envConfig } from './config';

const app: Express = express();

// Middleware setup
app.use(corsMiddleware());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
   res.status(200).json({
      success: true,
      message: 'National Toilet Campaign API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: envConfig.MODE || 'development',
   });
});

// Tspec setup
async function setupTspecDocs() {
   const tspecMiddlewares = await TspecDocsMiddleware(tspecOptions);
   app.use('/api-docs', ...(tspecMiddlewares as unknown as RequestHandler[]));
}

setupTspecDocs().catch(console.error);

// Redirect root
app.get('/', (req: Request, res: Response) => {
   res.redirect('/api-docs');
});

// Routes
app.use('/api/v1', router);

// 404 handler - MUST come after all routes
app.use(notFoundHandler);

// Error handler - MUST be last
app.use(errorHandler);

export default app;
