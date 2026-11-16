import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

export const AUTH_COOKIE = 'mirsaad_token';
export const CSRF_COOKIE = 'mirsaad_csrf';

const baseCookie = {
  secure: config.COOKIE_SECURE,
  sameSite: config.COOKIE_SAMESITE,
  path: '/',
};

export function signToken(userId) {
  return jwt.sign({ sub: userId }, config.JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'mirsaad-todo',
    audience: 'mirsaad-todo-web',
  });
}

export function verifyToken(token) {
  return jwt.verify(token, config.JWT_SECRET, {
    issuer: 'mirsaad-todo',
    audience: 'mirsaad-todo-web',
  });
}

export function setSessionCookies(res, userId) {
  const csrfToken = crypto.randomBytes(32).toString('hex');
  res.cookie(AUTH_COOKIE, signToken(userId), {
    ...baseCookie,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.cookie(CSRF_COOKIE, csrfToken, {
    ...baseCookie,
    httpOnly: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return csrfToken;
}

export function ensureCsrfCookie(req, res) {
  const existing = req.cookies?.[CSRF_COOKIE];
  if (existing) return existing;

  const csrfToken = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE, csrfToken, {
    ...baseCookie,
    httpOnly: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return csrfToken;
}

export function clearSessionCookies(res) {
  res.clearCookie(AUTH_COOKIE, { ...baseCookie, httpOnly: true });
  res.clearCookie(CSRF_COOKIE, { ...baseCookie, httpOnly: false });
}
