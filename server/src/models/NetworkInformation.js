// import mongoose from 'mongoose';
// const { Schema } = mongoose;

// const NetworkInformationSchema = new Schema({
//   org: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Organization',
//     required: true,
//   },
//   asset: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Asset',
//     required: true,
//   },
//   ports: [{
//     protocol: String,
//     portid: Number,
//     state: String,
//     reason: String,
//     reason_ttl: Number,
//     service: String,
//     product: String,
//     extra_info: String,
//     method: String,
//     confidence: Number
//   }],
//   os: String,
//   hostnames: [String],
//   srtt: Number,
//   rttVariance: Number,
//   timeout: Number,
//   distance: Number,
//   traceroute: [{
//     ttl: Number,
//     ipaddr: String,
//     rtt: Number,
//     host: String,
//   }],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const NetworkInformation = mongoose.model('NetworkInformation', NetworkInformationSchema);

// export default NetworkInformation;
