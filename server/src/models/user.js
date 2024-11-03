import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.password && user.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password, salt);
      console.log('Hashed password:', hash);  // Log the hashed password
      user.password = hash;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Compare the entered password with the hashed password in the database
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw err;
  }
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;