import Liability from '../models/Liability.js';
import Document from '../models/Document.js';
import Permission from '../models/Permission.js';
import ActivationRequest from '../models/ActivationRequest.js';
import BeneficiaryRelationship from '../models/BeneficiaryRelationship.js';
import { success, fail } from '../utils/response.js';
import { canBeneficiaryAccessTarget, getApprovedActivation } from '../services/releaseService.js';
import mongoose from 'mongoose';
import { getBucket } from '../config/db.js';

export async function releasedLiabilities(req, res, next) {
  try {
    const { ownerId } = req.query;
    if (!ownerId) {
      return res.status(400).json(fail('ownerId is required'));
    }
    const approved = await getApprovedActivation(req.user._id, ownerId);
    if (!approved) {
      return res.json(success({ items: [], locked: true }, 'Vault locked'));
    }

    const perms = await Permission.find({
      ownerId,
      beneficiaryId: req.user._id,
      targetType: 'LIABILITY',
      status: 'ACTIVE',
    });

    const ids = perms.map((p) => p.targetId);
    const liabilities = await Liability.find({ _id: { $in: ids }, status: { $in: ['ACTIVE', 'OVERDUE'] } });

    const safe = liabilities.map((l) => ({
      _id: l._id,
      liabilityType: l.liabilityType,
      title: l.title,
      providerName: l.providerName,
      maskedReference: l.maskedReference,
      currency: l.currency,
      outstandingAmount: l.outstandingAmount,
      amountAsOf: l.amountAsOf,
      nextDueDate: l.nextDueDate,
      status: l.status,
      notes: l.notes,
      emiDetails: l.emiDetails,
      cardDetails: l.cardDetails,
    }));

    res.json(success({ items: safe, locked: false }, 'Released liabilities'));
  } catch (err) {
    next(err);
  }
}

export async function releasedLiabilityDetail(req, res, next) {
  try {
    const { id } = req.params;

    // Find the permission to derive ownerId
    const perm = await Permission.findOne({
      beneficiaryId: req.user._id,
      targetType: 'LIABILITY',
      targetId: id,
      status: 'ACTIVE',
    });
    if (!perm) {
      return res.status(403).json(fail('Not authorized'));
    }

    const allowed = await canBeneficiaryAccessTarget(req.user._id, perm.ownerId, 'LIABILITY', id);
    if (!allowed) {
      return res.status(403).json(fail('Not authorized'));
    }

    const liability = await Liability.findOne({ _id: id, ownerId: perm.ownerId });
    if (!liability) {
      return res.status(404).json(fail('Liability not found'));
    }

    // Only documents with explicit permission
    const docPerms = await Permission.find({
      ownerId: perm.ownerId,
      beneficiaryId: req.user._id,
      targetType: 'DOCUMENT',
      status: 'ACTIVE',
    });
    const docIds = docPerms.map((p) => p.targetId);
    const docs = await Document.find({ _id: { $in: docIds }, parentId: liability._id, status: 'ACTIVE' });

    const safe = {
      _id: liability._id,
      liabilityType: liability.liabilityType,
      title: liability.title,
      providerName: liability.providerName,
      maskedReference: liability.maskedReference,
      currency: liability.currency,
      outstandingAmount: liability.outstandingAmount,
      amountAsOf: liability.amountAsOf,
      nextDueDate: liability.nextDueDate,
      status: liability.status,
      notes: liability.notes,
      emiDetails: liability.emiDetails,
      cardDetails: liability.cardDetails,
      documents: docs.map((d) => ({
        _id: d._id,
        originalName: d.originalName,
        mimeType: d.mimeType,
        size: d.size,
        category: d.category,
        createdAt: d.createdAt,
      })),
    };

    res.json(success({ liability: safe }, 'Released liability'));
  } catch (err) {
    next(err);
  }
}

export async function releasedDocumentDownload(req, res, next) {
  try {
    const doc = await Document.findOne({ _id: req.params.id, status: 'ACTIVE' });
    if (!doc) {
      return res.status(404).json(fail('Document not found'));
    }

    const allowed = await canBeneficiaryAccessTarget(req.user._id, doc.ownerId, 'DOCUMENT', doc._id);
    if (!allowed) {
      return res.status(403).json(fail('Not authorized'));
    }

    const bucket = getBucket();
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(doc.gridFsFileId));
    downloadStream.on('error', () => {
      res.status(404).json(fail('File stream not available'));
    });
    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}"`);
    downloadStream.pipe(res);
  } catch (err) {
    next(err);
  }
}
