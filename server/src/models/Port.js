import mongoose from 'mongoose';
const { Schema } = mongoose;

const PortSchema = new Schema({
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host',
    required: true,
  },
  protocol: String,
  portid: Number,
  state: String,
  reason: String,
  reason_ttl: Number,
  service: String,
  method: String,
  conf: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Port = mongoose.model('Port', PortSchema);

export default Port;
