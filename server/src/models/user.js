import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema({
  name: {
    first: String,
    last: String,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: false,
    select: false,
  },
  phone: {
    number: String,
    verified: {
      type: Boolean,
      default: false,
    },
  },
  role: {
    type: String,
    default: 'user',
  },
  org: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  activationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.password && user.isModified('password')) {
    if (!user.password.startsWith('$2a$')) {
      try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        user.password = await bcrypt.hash(user.password, salt);
      } catch (err) {
        return next(err);
      }
    }
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;