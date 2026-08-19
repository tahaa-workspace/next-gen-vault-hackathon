import ActivationRequest from '../models/ActivationRequest.js';
import BeneficiaryRelationship from '../models/BeneficiaryRelationship.js';
import { success, fail } from '../utils/response.js';

export async function createActivationRequest(req, res, next) {
  try {
    const { ownerId, reason } = req.body;
    const beneficiaryId = req.user._id;

    const rel = await BeneficiaryRelationship.findOne({
      ownerId,
      beneficiaryId,
      invitationStatus: 'ACCEPTED',
      active: true,
    });
    if (!rel) {
      return res.status(403).json(fail('No active relationship with this owner'));
    }

    const existing = await ActivationRequest.findOne({
      ownerId,
      requestedBy: beneficiaryId,
      status: { $in: ['PENDING', 'UNDER_REVIEW', 'APPROVED'] },
    });
    if (existing) {
      return res.status(409).json(fail('An active request already exists for this owner'));
    }

    const request = await ActivationRequest.create({
      ownerId,
      requestedBy: beneficiaryId,
      reason,
      status: 'PENDING',
    });

    res.status(201).json(success({ request }, 'Activation request submitted'));
  } catch (err) {
    next(err);
  }
}

export async function myActivationRequests(req, res, next) {
  try {
    const requests = await ActivationRequest.find({ requestedBy: req.user._id })
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(success({ items: requests }, 'My activation requests'));
  } catch (err) {
    next(err);
  }
}

export async function adminListRequests(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const requests = await ActivationRequest.find(filter)
      .populate('requestedBy', 'name email')
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(success({ items: requests }, 'Activation requests'));
  } catch (err) {
    next(err);
  }
}

export async function adminGetRequest(req, res, next) {
  try {
    const request = await ActivationRequest.findById(req.params.id)
      .populate('requestedBy', 'name email')
      .populate('ownerId', 'name email')
      .populate('reviewedBy', 'name email');
    if (!request) {
      return res.status(404).json(fail('Request not found'));
    }
    res.json(success({ request }, 'Activation request'));
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const request = await ActivationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json(fail('Request not found'));
    }
    if (request.status === 'APPROVED' || request.status === 'REJECTED') {
      return res.status(400).json(fail('Request already decided'));
    }
    request.status = status;
    await request.save();
    res.json(success({ request }, 'Status updated'));
  } catch (err) {
    next(err);
  }
}

export async function adminDecision(req, res, next) {
  try {
    const { decision, decisionReason } = req.body;
    const request = await ActivationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json(fail('Request not found'));
    }
    if (request.status === 'APPROVED' || request.status === 'REJECTED') {
      return res.status(400).json(fail('Request already decided'));
    }
    request.status = decision;
    request.decisionReason = decisionReason;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();
    await request.populate('reviewedBy', 'name email');
    res.json(success({ request }, `Request ${decision.toLowerCase()}`));
  } catch (err) {
    next(err);
  }
}
