import Liability from '../models/Liability.js';
import Document from '../models/Document.js';
import { success, fail } from '../utils/response.js';

export async function listLiabilities(req, res, next) {
  try {
    const {
      search,
      liabilityType,
      status,
      sort = 'nextDueDate',
      order = 'asc',
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { ownerId: req.user._id };
    if (liabilityType) filter.liabilityType = liabilityType;
    if (status) filter.status = status;

    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: rx }, { providerName: rx }];
    }

    const sortMap = {
      nextDueDate: 'nextDueDate',
      outstandingAmount: 'outstandingAmount',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    };
    const sortKey = sortMap[sort] || 'nextDueDate';
    const sortDir = order === 'desc' ? -1 : 1;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Liability.find(filter).sort({ [sortKey]: sortDir }).skip(skip).limit(limitNum),
      Liability.countDocuments(filter),
    ]);

    res.json(success({ items, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) }, 'Liabilities'));
  } catch (err) {
    next(err);
  }
}

export async function getLiability(req, res, next) {
  try {
    const liability = await Liability.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!liability) {
      return res.status(404).json(fail('Liability not found'));
    }
    const documentCount = await Document.countDocuments({ parentId: liability._id, status: 'ACTIVE' });
    res.json(success({ liability, documentCount }, 'Liability'));
  } catch (err) {
    next(err);
  }
}

export async function createLiability(req, res, next) {
  try {
    const flat = req.body;
    const doc = {
      ownerId: req.user._id,
      liabilityType: flat.liabilityType,
      title: flat.title,
      providerName: flat.providerName || '',
      maskedReference: flat.maskedReference || '',
      currency: flat.currency || 'INR',
      outstandingAmount: flat.outstandingAmount,
      amountAsOf: flat.amountAsOf,
      nextDueDate: flat.nextDueDate || null,
      autoPayEnabled: flat.autoPayEnabled || false,
      status: flat.status || 'ACTIVE',
      notes: flat.notes || '',
      lastReviewedAt: flat.lastReviewedAt || null,
    };

    if (flat.liabilityType === 'EMI') {
      doc.emiDetails = {
        emiAmount: flat['emiDetails.emiAmount'] || 0,
        frequency: flat['emiDetails.frequency'] || 'MONTHLY',
        remainingInstallments: flat['emiDetails.remainingInstallments'] || 0,
        interestRate: flat['emiDetails.interestRate'] || 0,
        maturityDate: flat['emiDetails.maturityDate'] || null,
        loanCategory: flat['emiDetails.loanCategory'] || 'OTHER',
      };
    } else if (flat.liabilityType === 'CREDIT_CARD') {
      doc.cardDetails = {
        totalDue: flat['cardDetails.totalDue'] || 0,
        minimumDue: flat['cardDetails.minimumDue'] || 0,
        billingCycleDate: flat['cardDetails.billingCycleDate'] || null,
        lastFourDigits: flat['cardDetails.lastFourDigits'] || '',
        cardIssuer: flat['cardDetails.cardIssuer'] || '',
      };
      if (!doc.providerName && doc.cardDetails.cardIssuer) {
        doc.providerName = doc.cardDetails.cardIssuer;
      }
    }

    const liability = await Liability.create(doc);
    res.status(201).json(success({ liability }, 'Liability created'));
  } catch (err) {
    next(err);
  }
}

export async function updateLiability(req, res, next) {
  try {
    const liability = await Liability.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!liability) {
      return res.status(404).json(fail('Liability not found'));
    }

    const flat = req.body;
    const simple = [
      'title', 'providerName', 'maskedReference', 'currency', 'outstandingAmount',
      'amountAsOf', 'nextDueDate', 'autoPayEnabled', 'status', 'notes', 'lastReviewedAt',
    ];
    simple.forEach((k) => {
      if (flat[k] !== undefined) liability.set(k, flat[k]);
    });

    ['emiDetails.emiAmount', 'emiDetails.frequency', 'emiDetails.remainingInstallments',
     'emiDetails.interestRate', 'emiDetails.maturityDate', 'emiDetails.loanCategory'].forEach((k) => {
      if (flat[k] !== undefined) liability.set(k, flat[k]);
    });
    ['cardDetails.totalDue', 'cardDetails.minimumDue', 'cardDetails.billingCycleDate',
     'cardDetails.lastFourDigits', 'cardDetails.cardIssuer'].forEach((k) => {
      if (flat[k] !== undefined) liability.set(k, flat[k]);
    });

    await liability.save();
    res.json(success({ liability }, 'Liability updated'));
  } catch (err) {
    next(err);
  }
}

export async function deleteLiability(req, res, next) {
  try {
    const liability = await Liability.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!liability) {
      return res.status(404).json(fail('Liability not found'));
    }
    res.json(success({}, 'Liability deleted'));
  } catch (err) {
    next(err);
  }
}

export async function closeLiability(req, res, next) {
  try {
    const liability = await Liability.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!liability) {
      return res.status(404).json(fail('Liability not found'));
    }
    liability.status = 'CLOSED';
    liability.closedAt = new Date();
    await liability.save();
    res.json(success({ liability }, 'Liability closed'));
  } catch (err) {
    next(err);
  }
}

export async function archiveLiability(req, res, next) {
  try {
    const liability = await Liability.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!liability) {
      return res.status(404).json(fail('Liability not found'));
    }
    liability.status = 'ARCHIVED';
    await liability.save();
    res.json(success({ liability }, 'Liability archived'));
  } catch (err) {
    next(err);
  }
}

export async function restoreLiability(req, res, next) {
  try {
    const liability = await Liability.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!liability) {
      return res.status(404).json(fail('Liability not found'));
    }
    liability.status = 'ACTIVE';
    liability.closedAt = null;
    await liability.save();
    res.json(success({ liability }, 'Liability restored'));
  } catch (err) {
    next(err);
  }
}

export async function dashboardStats(req, res, next) {
  try {
    const ownerId = req.user._id;
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const all = await Liability.find({ ownerId });
    const active = all.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
    const activeOutstanding = active.reduce((s, l) => s + (l.outstandingAmount || 0), 0);
    const emiCount = active.filter((l) => l.liabilityType === 'EMI').length;
    const cardCount = active.filter((l) => l.liabilityType === 'CREDIT_CARD').length;
    const dueSoon = active.filter((l) => l.nextDueDate && new Date(l.nextDueDate) <= sevenDays && new Date(l.nextDueDate) >= now).length;
    const overdue = all.filter((l) => l.status === 'OVERDUE' || (l.status === 'ACTIVE' && l.nextDueDate && new Date(l.nextDueDate) < now)).length;
    const closed = all.filter((l) => l.status === 'CLOSED').length;
    const needsReview = all.filter((l) => !l.lastReviewedAt || (l.lastReviewedAt && (now - new Date(l.lastReviewedAt)) > 30 * 24 * 60 * 60 * 1000)).length;

    const recent = await Liability.find({ ownerId }).sort({ createdAt: -1 }).limit(5);

    res.json(success({
      totalActive: active.length,
      activeOutstanding,
      emiCount,
      cardCount,
      dueSoon,
      overdue,
      closed,
      needsReview,
      withoutBeneficiaryPermission: 0,
      recent,
    }, 'Dashboard stats'));
  } catch (err) {
    next(err);
  }
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
