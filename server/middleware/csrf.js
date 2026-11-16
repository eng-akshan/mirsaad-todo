import crypto from 'node:crypto';
import { CSRF_COOKIE } from '../services/auth.js';

export function csrfProtection(req, res, next) {
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get('x-csrf-token');

  if (!cookieToken || !headerToken) {
    return res.status(403).json({ error: 'Invalid CSRF token.' });
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);
  if (cookieBuffer.length !== headerBuffer.length || !crypto.timingSafeEqual(cookieBuffer, headerBuffer)) {
    return res.status(403).json({ error: 'Invalid CSRF token.' });
  }

  return next();
}
