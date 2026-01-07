const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({
    id: String(user._id),
    name: user.name,
    fullName: user.fullName || '',
    displayName: user.displayName || '',
    age: user.age,
    email: user.email,
    preferences: user.preferences,
    canCreateEvents: !!user.canCreateEvents,
    profilePictureUrl: user.profilePictureUrl || '',
    profileComplete: !!user.profileComplete,
  });
});

router.patch('/:id', async (req, res) => {
  const { name, fullName, displayName, age, preferences, profilePictureUrl, profileComplete } = req.body || {};

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (fullName !== undefined) updates.fullName = fullName;
  if (displayName !== undefined) updates.displayName = displayName;
  if (age !== undefined) updates.age = age;
  if (preferences !== undefined) updates.preferences = preferences;
  if (profilePictureUrl !== undefined) updates.profilePictureUrl = profilePictureUrl;
  if (profileComplete !== undefined) updates.profileComplete = !!profileComplete;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).lean();
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({
    id: String(user._id),
    name: user.name,
    fullName: user.fullName || '',
    displayName: user.displayName || '',
    age: user.age,
    email: user.email,
    preferences: user.preferences,
    canCreateEvents: !!user.canCreateEvents,
    profilePictureUrl: user.profilePictureUrl || '',
    profileComplete: !!user.profileComplete,
  });
});

module.exports = router;
