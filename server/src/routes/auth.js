const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ error: 'Account already exists for this email' });
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await User.create({
    name: 'New Student',
    fullName: '',
    displayName: '',
    age: 18,
    email: normalizedEmail,
    passwordHash,
    preferences: [],
    canCreateEvents: false,
    profilePictureUrl: '',
    profileComplete: false,
  });

  return res.json({ userId: String(user._id) });
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(404).json({ error: 'No account found for this email' });
  }

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  return res.json({ userId: String(user._id) });
});

module.exports = router;
