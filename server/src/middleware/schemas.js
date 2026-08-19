import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('OWNER', 'BENEFICIARY').required(),
  phone: Joi.string().max(20).allow('').optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(80).optional(),
  phone: Joi.string().max(20).allow('').optional(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

export const liabilityBaseSchema = {
  liabilityType: Joi.string().valid('EMI', 'CREDIT_CARD').required(),
  title: Joi.string().min(2).max(120).required(),
  providerName: Joi.string().max(120).allow('').optional(),
  maskedReference: Joi.string().max(120).allow('').optional(),
  currency: Joi.string().valid('INR').default('INR'),
  outstandingAmount: Joi.number().min(0).required(),
  amountAsOf: Joi.date().required(),
  nextDueDate: Joi.date().allow(null).optional(),
  autoPayEnabled: Joi.boolean().default(false),
  status: Joi.string().valid('DRAFT', 'ACTIVE', 'OVERDUE', 'CLOSED', 'ARCHIVED').optional(),
  notes: Joi.string().max(2000).allow('').optional(),
  lastReviewedAt: Joi.date().allow(null).optional(),
};

export const emiDetailsSchema = {
  'emiDetails.emiAmount': Joi.number().min(0).default(0),
  'emiDetails.frequency': Joi.string().valid('MONTHLY', 'QUARTERLY', 'WEEKLY', 'BIWEEKLY', 'ANNUALLY').default('MONTHLY'),
  'emiDetails.remainingInstallments': Joi.number().min(0).default(0),
  'emiDetails.interestRate': Joi.number().min(0).default(0),
  'emiDetails.maturityDate': Joi.date().allow(null).optional(),
  'emiDetails.loanCategory': Joi.string().valid('HOME', 'VEHICLE', 'EDUCATION', 'PERSONAL', 'OTHER').default('OTHER'),
};

export const cardDetailsSchema = {
  'cardDetails.totalDue': Joi.number().min(0).default(0),
  'cardDetails.minimumDue': Joi.number().min(0).default(0),
  'cardDetails.billingCycleDate': Joi.date().allow(null).optional(),
  'cardDetails.lastFourDigits': Joi.string().pattern(/^\d{4}$/).allow('').optional(),
  'cardDetails.cardIssuer': Joi.string().max(120).allow('').optional(),
};

export const createLiabilitySchema = Joi.object({
  ...liabilityBaseSchema,
  ...emiDetailsSchema,
  ...cardDetailsSchema,
});

export const updateLiabilitySchema = Joi.object({
  title: Joi.string().min(2).max(120).optional(),
  providerName: Joi.string().max(120).allow('').optional(),
  maskedReference: Joi.string().max(120).allow('').optional(),
  currency: Joi.string().valid('INR').optional(),
  outstandingAmount: Joi.number().min(0).optional(),
  amountAsOf: Joi.date().optional(),
  nextDueDate: Joi.date().allow(null).optional(),
  autoPayEnabled: Joi.boolean().optional(),
  status: Joi.string().valid('DRAFT', 'ACTIVE', 'OVERDUE', 'CLOSED', 'ARCHIVED').optional(),
  notes: Joi.string().max(2000).allow('').optional(),
  lastReviewedAt: Joi.date().allow(null).optional(),
  'emiDetails.emiAmount': Joi.number().min(0).optional(),
  'emiDetails.frequency': Joi.string().valid('MONTHLY', 'QUARTERLY', 'WEEKLY', 'BIWEEKLY', 'ANNUALLY').optional(),
  'emiDetails.remainingInstallments': Joi.number().min(0).optional(),
  'emiDetails.interestRate': Joi.number().min(0).optional(),
  'emiDetails.maturityDate': Joi.date().allow(null).optional(),
  'emiDetails.loanCategory': Joi.string().valid('HOME', 'VEHICLE', 'EDUCATION', 'PERSONAL', 'OTHER').optional(),
  'cardDetails.totalDue': Joi.number().min(0).optional(),
  'cardDetails.minimumDue': Joi.number().min(0).optional(),
  'cardDetails.billingCycleDate': Joi.date().allow(null).optional(),
  'cardDetails.lastFourDigits': Joi.string().pattern(/^\d{4}$/).allow('').optional(),
  'cardDetails.cardIssuer': Joi.string().max(120).allow('').optional(),
});

export const addBeneficiarySchema = Joi.object({
  email: Joi.string().email().required(),
  relationship: Joi.string().min(2).max(80).required(),
});

export const createPermissionSchema = Joi.object({
  beneficiaryId: Joi.string().hex().length(24).required(),
  targetType: Joi.string().valid('LIABILITY', 'DOCUMENT').required(),
  targetId: Joi.string().hex().length(24).required(),
});

export const bulkPermissionSchema = Joi.object({
  beneficiaryId: Joi.string().hex().length(24).required(),
  targetType: Joi.string().valid('LIABILITY', 'DOCUMENT').required(),
  targetIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
});

export const activationRequestSchema = Joi.object({
  ownerId: Joi.string().hex().length(24).required(),
  reason: Joi.string().min(5).max(1000).required(),
});

export const activationStatusSchema = Joi.object({
  status: Joi.string().valid('UNDER_REVIEW').required(),
});

export const activationDecisionSchema = Joi.object({
  decision: Joi.string().valid('APPROVED', 'REJECTED').required(),
  decisionReason: Joi.string().min(5).max(1000).required(),
});

export const userStatusSchema = Joi.object({
  active: Joi.boolean().required(),
});
