import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the schema
const userSchema = new mongoose.Schema({
  name: {
    first: String,
    last: String,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    number: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  role: {
    type: String,
    default: 'user'
  },
  org: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  }
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    console.log(`Hashing password in userSchema pre-save: ${user.password}`);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    console.log(`Hashed password in userSchema pre-save: ${hash}`);
    next();
  } catch (err) {
    next(err);
  }
});

// Add a method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log(`Comparing candidate password: ${candidatePassword} with stored hash: ${this.password}`);
    console.log(`Password match result in comparePassword: ${isMatch}`);
    return isMatch;
  } catch (err) {
    throw err;
  }
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
