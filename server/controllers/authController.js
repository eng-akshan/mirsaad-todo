import bcrypt from 'bcrypt';
import { prisma } from '../services/prisma.js';
import { clearSessionCookies, ensureCsrfCookie, setSessionCookies } from '../services/auth.js';

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

export async function csrf(req, res) {
  res.json({ csrfToken: ensureCsrfCookie(req, res) });
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return res.status(409).json({ error: 'An account with that email already exists.' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });
  setSessionCookies(res, user.id);
  return res.status(201).json({ user: publicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !passwordMatches) return res.status(401).json({ error: 'Invalid email or password.' });

  setSessionCookies(res, user.id);
  return res.json({ user: publicUser(user) });
}

export async function logout(req, res) {
  clearSessionCookies(res);
  res.status(204).end();
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    clearSessionCookies(res);
    return res.status(401).json({ error: 'User no longer exists.' });
  }
  return res.json({ user: publicUser(user) });
}
