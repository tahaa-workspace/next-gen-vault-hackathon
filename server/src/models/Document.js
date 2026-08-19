import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parentType: { type: String, enum: ['LIABILITY'], default: 'LIABILITY' },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Liability', required: true, index: true },
    gridFsFileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    originalName: { type: String, required: true, trim: true },
    storedName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    size: { type: Number, required: true },
    category: {
      type: String,
      enum: ['EMI_SCHEDULE', 'LOAN_AGREEMENT', 'CARD_STATEMENT', 'DUE_NOTICE', 'CLOSURE_LETTER', 'GENERIC'],
      default: 'GENERIC',
    },
    status: { type: String, enum: ['ACTIVE', 'DELETED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

documentSchema.index({ parentId: 1, status: 1 });

export default mongoose.model('Document', documentSchema);
