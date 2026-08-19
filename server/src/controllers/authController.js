import User from '../models/User.js';
import { success, fail } from '../utils/response.js';
import { signToken } from '../utils/jwt.js';
import { cookieOptions, clearCookieOptions } from '../utils/cookie.js';
import { config } from '../config/env.js';
import bcrypt from 'bcryptjs';

export async function register(req, res, next) {
  try {
    const { name, email, password, role, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json(fail('Email already registered'));
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      phone: phone || '',
    });

    const token = signToken(user);
    res.cookie(config.cookieName, token, cookieOptions());

    res.status(201).json(success({ user }, 'Account created'));
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json(fail('Invalid credentials'));
    }
    if (!user.active) {
      return res.status(403).json(fail('Account is deactivated'));
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json(fail('Invalid credentials'));
    }

    const token = signToken(user);
    res.cookie(config.cookieName, token, cookieOptions());

    res.json(success({ user }, 'Login successful'));
  } catch (err) {
    next(err);
  }
}

export async function logout(_req, res, next) {
  try {
    res.clearCookie(config.cookieName, clearCookieOptions());
    res.json(success({}, 'Logout successful'));
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    res.json(success({ user: req.user }, 'Current user'));
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(success({ user }, 'Profile updated'));
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json(fail('Current password is incorrect'));
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json(success({}, 'Password changed'));
  } catch (err) {
    next(err);
  }
}
