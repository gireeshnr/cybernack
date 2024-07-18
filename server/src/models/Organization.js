import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  'Root Domain': {
    type: String,
    required: true
  }
});

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
