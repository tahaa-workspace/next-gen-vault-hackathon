import Permission from '../models/Permission.js';
import BeneficiaryRelationship from '../models/BeneficiaryRelationship.js';
import Liability from '../models/Liability.js';
import Document from '../models/Document.js';
import { success, fail } from '../utils/response.js';
import { assertOwnerOfTarget } from '../services/releaseService.js';

export async function listPermissions(req, res, next) {
  try {
    const filter = { ownerId: req.user._id };
    if (req.query.beneficiaryId) filter.beneficiaryId = req.query.beneficiaryId;
    if (req.query.targetType) filter.targetType = req.query.targetType;
    const perms = await Permission.find(filter)
      .populate('beneficiaryId', 'name email')
      .sort({ createdAt: -1 });
    res.json(success({ items: perms }, 'Permissions'));
  } catch (err) {
    next(err);
  }
}

async function checkRelationship(ownerId, beneficiaryId) {
  return BeneficiaryRelationship.findOne({
    ownerId,
    beneficiaryId,
    invitationStatus: 'ACCEPTED',
    active: true,
  });
}

async function createOne(ownerId, beneficiaryId, targetType, targetId) {
  const rel = await checkRelationship(ownerId, beneficiaryId);
  if (!rel) {
    return { error: 'No active accepted relationship with this beneficiary' };
  }
  const owns = await assertOwnerOfTarget(ownerId, targetType, targetId);
  if (!owns) {
    return { error: 'You do not own this target' };
  }
  const existing = await Permission.findOne({
    ownerId,
    beneficiaryId,
    targetType,
    targetId,
    status: 'ACTIVE',
  });
  if (existing) {
    return { error: 'Permission already exists', existing: true };
  }
  const perm = await Permission.create({
    ownerId,
    beneficiaryId,
    targetType,
    targetId,
    status: 'ACTIVE',
    grantedAt: new Date(),
  });
  return { perm };
}

export async function createPermission(req, res, next) {
  try {
    const { beneficiaryId, targetType, targetId } = req.body;
    const result = await createOne(req.user._id, beneficiaryId, targetType, targetId);
    if (result.error) {
      const code = result.existing ? 409 : 400;
      return res.status(code).json(fail(result.error));
    }
    res.status(201).json(success({ permission: result.perm }, 'Permission granted'));
  } catch (err) {
    next(err);
  }
}

export async function bulkCreatePermissions(req, res, next) {
  try {
    const { beneficiaryId, targetType, targetIds } = req.body;
    const created = [];
    const errors = [];
    for (const targetId of targetIds) {
      const result = await createOne(req.user._id, beneficiaryId, targetType, targetId);
      if (result.error) {
        errors.push({ targetId, message: result.error });
      } else {
        created.push(result.perm);
      }
    }
    res.status(201).json(success({ created, errors }, 'Bulk permissions processed'));
  } catch (err) {
    next(err);
  }
}

export async function updatePermission(req, res, next) {
  try {
    const perm = await Permission.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!perm) {
      return res.status(404).json(fail('Permission not found'));
    }
    const { status } = req.body;
    if (status === 'ACTIVE') {
      perm.status = 'ACTIVE';
      perm.grantedAt = new Date();
      perm.revokedAt = null;
    } else if (status === 'REVOKED') {
      perm.status = 'REVOKED';
      perm.revokedAt = new Date();
    }
    await perm.save();
    res.json(success({ permission: perm }, 'Permission updated'));
  } catch (err) {
    next(err);
  }
}

export async function deletePermission(req, res, next) {
  try {
    const perm = await Permission.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!perm) {
      return res.status(404).json(fail('Permission not found'));
    }
    res.json(success({}, 'Permission revoked'));
  } catch (err) {
    next(err);
  }
}
