import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/user.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
};

// Function to verify and re-hash passwords
const verifyAndRehashPasswords = async () => {
  try {
    const users = await User.find({}).select('+password');

    for (let user of users) {
      // Replace with secure password testing logic or a secure plaintext source.
      const providedPassword = 'Sree1suj'; // Example: Your known password for testing

      const isMatch = await bcrypt.compare(providedPassword, user.password);

      if (!isMatch) {
        console.log(`Password mismatch for user: ${user.email}`);
        console.log('Re-hashing and updating the password');

        // Re-hash the password
        const newHashedPassword = await bcrypt.hash(providedPassword, 10);
        user.password = newHashedPassword;
        await user.save();
        console.log(`Password re-hashed and updated for user: ${user.email}`);
      } else {
        console.log(`Password for user ${user.email} is consistent`);
      }
    }
  } catch (error) {
    console.error('Error during password verification:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
const runScript = async () => {
  await connectToDB();
  await verifyAndRehashPasswords();
};

runScript();