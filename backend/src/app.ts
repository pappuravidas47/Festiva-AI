import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import guestRoutes from './routes/guestRoutes.js';
import inspirationRoutes from './routes/inspirationRoutes.js';

export const createApp = (): Express => {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);
        if (
          ENV.NODE_ENV === 'development' ||
          origin === ENV.CLIENT_URL ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:')
        ) {
          return callback(null, true);
        }
        callback(new Error('Blocked by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request Parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // General Rate Limiting
  app.use('/api', apiLimiter);

  // Health route
  app.use('/api/health', healthRoutes);

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/budget', budgetRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/vendors', vendorRoutes);
  app.use('/api/guests', guestRoutes);
  app.use('/api/inspiration', inspirationRoutes);

  // 404 & Centralized Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export const app = createApp();
