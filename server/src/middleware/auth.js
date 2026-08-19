import { fail } from '../utils/response.js';
import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { config } from '../config/env.js';

export async function authenticate(req, res, next) {
  try {
    const token = req.cookies[config.cookieName];
    if (!token) {
      return res.status(401).json(fail('Authentication required'));
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json(fail('Invalid or expired session'));
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json(fail('Account not found'));
    }
    if (!user.active) {
      return res.status(403).json(fail('Account is deactivated'));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json(fail('Insufficient permissions'));
    }
    next();
  };
}
