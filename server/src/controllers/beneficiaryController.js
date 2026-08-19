import BeneficiaryRelationship from '../models/BeneficiaryRelationship.js';
import User from '../models/User.js';
import { success, fail } from '../utils/response.js';

export async function listMyBeneficiaries(req, res, next) {
  try {
    const rels = await BeneficiaryRelationship.find({ ownerId: req.user._id })
      .populate('beneficiaryId', 'name email role active')
      .sort({ createdAt: -1 });
    res.json(success({ items: rels }, 'Beneficiaries'));
  } catch (err) {
    next(err);
  }
}

export async function addBeneficiary(req, res, next) {
  try {
    const { email, relationship } = req.body;
    if (email.toLowerCase() === req.user.email.toLowerCase()) {
      return res.status(400).json(fail('You cannot add yourself as a beneficiary'));
    }

    const beneficiary = await User.findOne({ email, role: 'BENEFICIARY' });
    if (!beneficiary) {
      return res.status(404).json(fail('No beneficiary found with that email'));
    }
    if (!beneficiary.active) {
      return res.status(400).json(fail('That beneficiary account is deactivated'));
    }

    const existing = await BeneficiaryRelationship.findOne({
      ownerId: req.user._id,
      beneficiaryId: beneficiary._id,
    });
    if (existing) {
      return res.status(409).json(fail('Relationship already exists'));
    }

    const rel = await BeneficiaryRelationship.create({
      ownerId: req.user._id,
      beneficiaryId: beneficiary._id,
      relationship,
      invitationStatus: 'PENDING',
      active: true,
    });

    await rel.populate('beneficiaryId', 'name email role active');
    res.status(201).json(success({ relationship: rel }, 'Invitation sent'));
  } catch (err) {
    next(err);
  }
}

export async function acceptInvitation(req, res, next) {
  try {
    const rel = await BeneficiaryRelationship.findOne({
      _id: req.params.id,
      beneficiaryId: req.user._id,
    });
    if (!rel) {
      return res.status(404).json(fail('Invitation not found'));
    }
    rel.invitationStatus = 'ACCEPTED';
    await rel.save();
    res.json(success({ relationship: rel }, 'Invitation accepted'));
  } catch (err) {
    next(err);
  }
}

export async function rejectInvitation(req, res, next) {
  try {
    const rel = await BeneficiaryRelationship.findOne({
      _id: req.params.id,
      beneficiaryId: req.user._id,
    });
    if (!rel) {
      return res.status(404).json(fail('Invitation not found'));
    }
    rel.invitationStatus = 'REJECTED';
    await rel.save();
    res.json(success({ relationship: rel }, 'Invitation rejected'));
  } catch (err) {
    next(err);
  }
}

export async function revokeRelationship(req, res, next) {
  try {
    const rel = await BeneficiaryRelationship.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user._id,
    });
    if (!rel) {
      return res.status(404).json(fail('Relationship not found'));
    }
    res.json(success({}, 'Relationship revoked'));
  } catch (err) {
    next(err);
  }
}

export async function myInvitations(req, res, next) {
  try {
    const rels = await BeneficiaryRelationship.find({
      beneficiaryId: req.user._id,
      invitationStatus: { $in: ['PENDING', 'ACCEPTED', 'REJECTED'] },
    })
      .populate('ownerId', 'name email role active')
      .sort({ createdAt: -1 });
    res.json(success({ items: rels }, 'Invitations'));
  } catch (err) {
    next(err);
  }
}

export async function myOwners(req, res, next) {
  try {
    const rels = await BeneficiaryRelationship.find({
      beneficiaryId: req.user._id,
      invitationStatus: 'ACCEPTED',
      active: true,
    })
      .populate('ownerId', 'name email role active')
      .sort({ createdAt: -1 });
    res.json(success({ items: rels }, 'Assigned owners'));
  } catch (err) {
    next(err);
  }
}
