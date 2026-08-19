import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: { type: String, enum: ['LIABILITY', 'DOCUMENT'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    status: { type: String, enum: ['ACTIVE', 'REVOKED'], default: 'ACTIVE', index: true },
    grantedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

permissionSchema.index(
  { ownerId: 1, beneficiaryId: 1, targetType: 1, targetId: 1, status: 1 },
  { unique: false }
);

export default mongoose.model('Permission', permissionSchema);
