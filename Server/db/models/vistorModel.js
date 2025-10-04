const mongoose =require('mongoose')

const visitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ip: String,
  userAgent: String,
  page: String,
  time: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Visit', visitSchema);
