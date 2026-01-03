const mongoose = require('mongoose');

const categoryEnum = ['sports', 'programming', 'drinking', 'soccer', 'basketball'];

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true, enum: categoryEnum, index: true },
    price: { type: Number },
    organizer: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    description: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', EventSchema);

