const mongoose = require('mongoose');

const preferenceEnum = [
  'tech',
  'sports',
  'music',
  'culture',
  'food',
  'networking',
  'programming',
  'drinking',
  'soccer',
  'basketball',
];

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fullName: { type: String },
    displayName: { type: String },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    preferences: { type: [String], default: [], enum: preferenceEnum },
    canCreateEvents: { type: Boolean, default: false },
    profilePictureUrl: { type: String },
    profileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
