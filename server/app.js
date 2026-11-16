import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { stats } from './controllers/dashboardController.js';
import { databaseHealth, health } from './controllers/healthController.js';
import { authenticate } from './middleware/authenticate.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { config } from './services/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');
export const app = express();

app.set('trust proxy', config.TRUST_PROXY);
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/api/health', health);
app.get('/api/health/db', databaseHealth);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', authenticate, taskRoutes);
app.get('/api/dashboard/stats', authenticate, stats);
app.use('/api', notFound);

if (config.NODE_ENV === 'production') {
  app.use(express.static(distPath, { index: false, maxAge: '1y', immutable: true }));
  app.get('/{*splat}', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.use(errorHandler);
