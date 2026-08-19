import User from '../models/User.js';
import Liability from '../models/Liability.js';
import ActivationRequest from '../models/ActivationRequest.js';
import { success, fail } from '../utils/response.js';

export async function dashboard(req, res, next) {
  try {
    const [totalUsers, owners, beneficiaries, activeLiabilities, pending, approved, rejected] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'OWNER' }),
        User.countDocuments({ role: 'BENEFICIARY' }),
        Liability.countDocuments({ status: { $in: ['ACTIVE', 'OVERDUE'] } }),
        ActivationRequest.countDocuments({ status: 'PENDING' }),
        ActivationRequest.countDocuments({ status: 'APPROVED' }),
        ActivationRequest.countDocuments({ status: 'REJECTED' }),
      ]);

    res.json(success({
      totalUsers,
      owners,
      beneficiaries,
      activeLiabilities,
      pending,
      approved,
      rejected,
    }, 'Admin dashboard'));
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const { search, role, active } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (active !== undefined) filter.active = active === 'true';
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(success({ items: users }, 'Users'));
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const { active } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json(fail('User not found'));
    }
    if (user.role === 'ADMIN' && !active) {
      return res.status(400).json(fail('Cannot deactivate an admin account'));
    }
    user.active = active;
    await user.save();
    res.json(success({ user }, `User ${active ? 'activated' : 'deactivated'}`));
  } catch (err) {
    next(err);
  }
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
