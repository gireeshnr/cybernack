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
    select: false, // Exclude by default
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
      user.password = await bcrypt.hash(user.password, salt);
      console.log('Generated salt for hashing:', salt);
      console.log('Hashed password before saving:', user.password); // Log the hashed password for debugging
    } catch (err) {
      console.error('Error hashing password:', err);
      return next(err);
    }
  }
  next();
});

// Compare the entered password with the hashed password in the database
userSchema.methods.comparePassword = async function (candidatePassword) {
  console.log('Comparing provided password with stored password');
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log(`Password comparison result: ${isMatch}`);
    return isMatch;
  } catch (err) {
    console.error('Error comparing password:', err);
    throw err;
  }
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;