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
    age: user.age,
    email: user.email,
    preferences: user.preferences,
    canCreateEvents: !!user.canCreateEvents,
  });
});

router.patch('/:id', async (req, res) => {
  const { name, age, preferences } = req.body || {};

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (age !== undefined) updates.age = age;
  if (preferences !== undefined) updates.preferences = preferences;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).lean();
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({
    id: String(user._id),
    name: user.name,
    age: user.age,
    email: user.email,
    preferences: user.preferences,
    canCreateEvents: !!user.canCreateEvents,
  });
});

module.exports = router;

