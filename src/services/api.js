import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

function readCookie(name) {
  const prefix = `${encodeURIComponent(name)}=`;
  const item = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : null;
}

api.interceptors.request.use((request) => {
  const method = request.method?.toLowerCase();
  if (method && !['get', 'head', 'options'].includes(method)) {
    const token = readCookie('mirsaad_csrf');
    if (token) request.headers['X-CSRF-Token'] = token;
  }
  return request;
});

export async function ensureCsrfToken() {
  await api.get('/auth/csrf');
}

export function apiError(error) {
  return error.response?.data?.error || 'Something went wrong. Please try again.';
}
