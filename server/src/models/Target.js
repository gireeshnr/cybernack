import mongoose from 'mongoose';

const targetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true
  }
});

const Target = mongoose.model('Target', targetSchema);
export default Target;
