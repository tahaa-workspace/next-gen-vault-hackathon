import Liability from '../models/Liability.js';
import Document from '../models/Document.js';
import BeneficiaryRelationship from '../models/BeneficiaryRelationship.js';
import Permission from '../models/Permission.js';
import ActivationRequest from '../models/ActivationRequest.js';

/**
 * Centralized release authorization.
 * A Beneficiary may access a target only when ALL conditions are true:
 *  - Authenticated Beneficiary with active account
 *  - Accepted and active Owner-Beneficiary relationship
 *  - Approved activation request for that Owner
 *  - Active permission for the exact target
 */
export async function canBeneficiaryAccessTarget(beneficiaryId, ownerId, targetType, targetId) {
  if (!beneficiaryId || !ownerId || !targetType || !targetId) return false;

  const relationship = await BeneficiaryRelationship.findOne({
    ownerId,
    beneficiaryId,
    invitationStatus: 'ACCEPTED',
    active: true,
  });
  if (!relationship) return false;

  const activation = await ActivationRequest.findOne({
    ownerId,
    requestedBy: beneficiaryId,
    status: 'APPROVED',
  });
  if (!activation) return false;

  const permission = await Permission.findOne({
    ownerId,
    beneficiaryId,
    targetType,
    targetId,
    status: 'ACTIVE',
  });
  if (!permission) return false;

  return true;
}

export async function assertOwnerOfLiability(ownerId, liabilityId) {
  const liability = await Liability.findOne({ _id: liabilityId, ownerId });
  return !!liability;
}

export async function assertOwnerOfDocument(ownerId, documentId) {
  const doc = await Document.findOne({ _id: documentId, ownerId, status: 'ACTIVE' });
  return !!doc;
}

export async function assertOwnerOfTarget(ownerId, targetType, targetId) {
  if (targetType === 'LIABILITY') return assertOwnerOfLiability(ownerId, targetId);
  if (targetType === 'DOCUMENT') return assertOwnerOfDocument(ownerId, targetId);
  return false;
}

export async function getApprovedActivation(beneficiaryId, ownerId) {
  return ActivationRequest.findOne({
    ownerId,
    requestedBy: beneficiaryId,
    status: 'APPROVED',
  });
}

export async function hasActiveRelationship(beneficiaryId, ownerId) {
  return BeneficiaryRelationship.findOne({
    ownerId,
    beneficiaryId,
    invitationStatus: 'ACCEPTED',
    active: true,
  });
}
