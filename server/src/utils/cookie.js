import { config } from '../config/env.js';

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProduction,
    maxAge: 24 * 60 * 60 * 1000,
  path: '/',
  };
}

export function clearCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProduction,
    path: '/',
  };
}
