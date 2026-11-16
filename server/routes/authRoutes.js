import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { csrf, login, logout, me, register } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { csrfProtection } from '../middleware/csrf.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validators/auth.js';

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

router.get('/csrf', csrf);
router.post('/register', authLimiter, csrfProtection, validate(registerSchema), register);
router.post('/login', authLimiter, csrfProtection, validate(loginSchema), login);
router.post('/logout', authenticate, csrfProtection, logout);
router.get('/me', authenticate, me);

export default router;
