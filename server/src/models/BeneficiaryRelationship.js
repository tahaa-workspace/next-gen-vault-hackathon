import mongoose from 'mongoose';

const beneficiaryRelationshipSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    relationship: { type: String, required: true, trim: true },
    invitationStatus: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'REVOKED'],
      default: 'PENDING',
      index: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

beneficiaryRelationshipSchema.index({ ownerId: 1, beneficiaryId: 1 }, { unique: true });

export default mongoose.model('BeneficiaryRelationship', beneficiaryRelationshipSchema);
