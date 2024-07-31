import mongoose from 'mongoose';
const { Schema } = mongoose;

const OrganizationSchema = new Schema({
  name: String,
  rootDomain: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Organization = mongoose.model('Organization', OrganizationSchema);

export default Organization;
