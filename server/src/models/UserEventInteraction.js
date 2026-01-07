const mongoose = require('mongoose');

const UserEventInteractionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    interested: { type: Boolean, default: false },
    joined: { type: Boolean, default: false },
    chatVisitedAt: { type: Date },
  },
  { timestamps: true }
);

UserEventInteractionSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('UserEventInteraction', UserEventInteractionSchema);

