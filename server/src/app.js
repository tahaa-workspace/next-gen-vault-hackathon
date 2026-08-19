import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/authRoutes.js';
import liabilityRoutes from './routes/liabilityRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import beneficiaryRoutes from './routes/beneficiaryRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import activationRoutes from './routes/activationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import releaseRoutes from './routes/releaseRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    })
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => res.json({ success: true, message: 'OK', data: {} }));

  app.use('/api/auth', authRoutes);
  app.use('/api/liabilities', liabilityRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/beneficiaries', beneficiaryRoutes);
  app.use('/api/permissions', permissionRoutes);
  app.use('/api/activation-requests', activationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/beneficiary', releaseRoutes);

  if (config.isProduction) {
    const clientDist = path.resolve(__dirname, '../../client/dist');
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
