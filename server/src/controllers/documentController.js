import Document from '../models/Document.js';
import Liability from '../models/Liability.js';
import { getBucket } from '../config/db.js';
import { success, fail } from '../utils/response.js';
import mongoose from 'mongoose';
import { canBeneficiaryAccessTarget } from '../services/releaseService.js';

const categoryMap = {
  'application/pdf': 'GENERIC',
};

export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json(fail('No file provided'));
    }
    const { parentId, category } = req.body;
    if (!parentId) {
      return res.status(400).json(fail('Parent liability ID is required'));
    }

    const liability = await Liability.findOne({ _id: parentId, ownerId: req.user._id });
    if (!liability) {
      return res.status(404).json(fail('Parent liability not found'));
    }

    const bucket = getBucket();
    const storedName = `${Date.now()}-${req.file.originalname}`;
    const uploadStream = bucket.openUploadStream(storedName, {
      contentType: req.file.mimetype,
      metadata: { ownerId: req.user._id.toString(), parentId },
    });

    const gridFsFileId = await new Promise((resolve, reject) => {
      uploadStream.on('error', reject);
      uploadStream.on('finish', () => resolve(uploadStream.id));
      uploadStream.end(req.file.buffer);
    });

    const doc = await Document.create({
      ownerId: req.user._id,
      parentType: 'LIABILITY',
      parentId,
      gridFsFileId,
      originalName: req.file.originalname,
      storedName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      category: category || categoryMap[req.file.mimetype] || 'GENERIC',
      status: 'ACTIVE',
    });

    res.status(201).json(success({ document: doc }, 'Document uploaded'));
  } catch (err) {
    next(err);
  }
}

export async function listDocuments(req, res, next) {
  try {
    const { liabilityId } = req.params;
    const liability = await Liability.findOne({ _id: liabilityId, ownerId: req.user._id });
    if (!liability) {
      return res.status(404).json(fail('Parent liability not found'));
    }
    const docs = await Document.find({ parentId: liabilityId, status: 'ACTIVE' }).sort({ createdAt: -1 });
    res.json(success({ items: docs }, 'Documents'));
  } catch (err) {
    next(err);
  }
}

export async function getDocument(req, res, next) {
  try {
    const doc = await Document.findOne({ _id: req.params.id, ownerId: req.user._id, status: 'ACTIVE' });
    if (!doc) {
      return res.status(404).json(fail('Document not found'));
    }
    res.json(success({ document: doc }, 'Document'));
  } catch (err) {
    next(err);
  }
}

export async function downloadDocument(req, res, next) {
  try {
    const doc = await Document.findOne({ _id: req.params.id, status: 'ACTIVE' });
    if (!doc) {
      return res.status(404).json(fail('Document not found'));
    }

    // Authorization: owner OR beneficiary with explicit document permission
    const isOwner = doc.ownerId.equals(req.user._id);
    if (!isOwner) {
      if (req.user.role !== 'BENEFICIARY') {
        return res.status(403).json(fail('Not authorized'));
      }
      const allowed = await canBeneficiaryAccessTarget(req.user._id, doc.ownerId, 'DOCUMENT', doc._id);
      if (!allowed) {
        return res.status(403).json(fail('Not authorized'));
      }
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

export async function deleteDocument(req, res, next) {
  try {
    const doc = await Document.findOne({ _id: req.params.id, ownerId: req.user._id, status: 'ACTIVE' });
    if (!doc) {
      return res.status(404).json(fail('Document not found'));
    }

    const bucket = getBucket();
    try {
      await bucket.delete(new mongoose.Types.ObjectId(doc.gridFsFileId));
    } catch (e) {
      // gridfs file may already be gone
    }

    doc.status = 'DELETED';
    await doc.save();

    res.json(success({}, 'Document deleted'));
  } catch (err) {
    next(err);
  }
}
