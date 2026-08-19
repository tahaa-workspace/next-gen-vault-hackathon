import mongoose from 'mongoose';

const liabilitySchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    liabilityType: {
      type: String,
      enum: ['EMI', 'CREDIT_CARD'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    providerName: { type: String, default: '', trim: true },
    maskedReference: { type: String, default: '', trim: true },
    currency: { type: String, default: 'INR' },
    outstandingAmount: { type: Number, required: true, min: 0 },
    amountAsOf: { type: Date, required: true },
    nextDueDate: { type: Date, default: null },
    autoPayEnabled: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'OVERDUE', 'CLOSED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
    notes: { type: String, default: '', trim: true },
    lastReviewedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    emiDetails: {
      emiAmount: { type: Number, min: 0, default: 0 },
      frequency: {
        type: String,
        enum: ['MONTHLY', 'QUARTERLY', 'WEEKLY', 'BIWEEKLY', 'ANNUALLY'],
        default: 'MONTHLY',
      },
      remainingInstallments: { type: Number, min: 0, default: 0 },
      interestRate: { type: Number, min: 0, default: 0 },
      maturityDate: { type: Date, default: null },
      loanCategory: {
        type: String,
        enum: ['HOME', 'VEHICLE', 'EDUCATION', 'PERSONAL', 'OTHER'],
        default: 'OTHER',
      },
    },
    cardDetails: {
      totalDue: { type: Number, min: 0, default: 0 },
      minimumDue: { type: Number, min: 0, default: 0 },
      billingCycleDate: { type: Date, default: null },
      lastFourDigits: {
        type: String,
        default: '',
        validate: {
          validator: (v) => !v || /^\d{4}$/.test(v),
          message: 'lastFourDigits must be exactly four numeric digits',
        },
      },
      cardIssuer: { type: String, default: '', trim: true },
    },
  },
  { timestamps: true }
);

liabilitySchema.index({ ownerId: 1, status: 1 });

export default mongoose.model('Liability', liabilitySchema);
