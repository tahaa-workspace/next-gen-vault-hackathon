import mongoose from 'mongoose';

const activationRequestSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, required: true, trim: true },
    evidenceDocumentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    decisionReason: { type: String, default: '', trim: true },
    requestedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('ActivationRequest', activationRequestSchema);
