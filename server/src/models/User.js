import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['OWNER', 'BENEFICIARY', 'ADMIN'],
      required: true,
      index: true,
    },
    phone: { type: String, default: '', trim: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
