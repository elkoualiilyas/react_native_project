const mongoose = require('mongoose');

const statusEnum = ['PENDING', 'APPROVED', 'REJECTED'];

const EventCreationRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: statusEnum, default: 'PENDING', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventCreationRequest', EventCreationRequestSchema);

