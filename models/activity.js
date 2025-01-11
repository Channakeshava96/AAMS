const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activityName: { type: String, required: true },
  activityPoints: { type: Number, required: true },
  certificatePath: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Accepted'], default: 'Pending' },
  timeline: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', activitySchema);
