const express = require('express');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Event = require('../models/Event');
const EventCreationRequest = require('../models/EventCreationRequest');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

function normalizeUser(u) {
  return {
    id: String(u._id),
    name: u.name,
    age: u.age,
    email: u.email,
    preferences: u.preferences,
    canCreateEvents: !!u.canCreateEvents,
  };
}

function normalizeEvent(e) {
  return {
    id: String(e._id),
    title: e.title,
    category: e.category,
    price: e.price,
    organizer: e.organizer,
    date: new Date(e.date).toISOString(),
    description: e.description,
    location: e.location,
  };
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (String(email).trim().toLowerCase() !== adminEmail || String(password) !== adminPassword) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const token = jwt.sign(
    { role: 'admin', email: adminEmail },
    process.env.ADMIN_JWT_SECRET || 'dev_admin_secret',
    { expiresIn: '7d' }
  );

  return res.json({ token });
});

router.get('/users', requireAdmin, async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return res.json(users.map(normalizeUser));
});

router.patch('/users/:id', requireAdmin, async (req, res) => {
  const { name, age, preferences, canCreateEvents } = req.body || {};
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (age !== undefined) updates.age = age;
  if (preferences !== undefined) updates.preferences = preferences;
  if (canCreateEvents !== undefined) updates.canCreateEvents = canCreateEvents;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(normalizeUser(user));
});

router.delete('/users/:id', requireAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  return res.json({ ok: true });
});

router.get('/events', requireAdmin, async (req, res) => {
  const events = await Event.find().sort({ date: 1 }).lean();
  return res.json(events.map(normalizeEvent));
});

router.post('/events', requireAdmin, async (req, res) => {
  const event = await Event.create({
    title: req.body.title,
    category: req.body.category,
    price: req.body.price,
    organizer: req.body.organizer,
    date: new Date(req.body.date),
    description: req.body.description,
    location: req.body.location,
  });
  return res.status(201).json(normalizeEvent(event.toObject()));
});

router.patch('/events/:id', requireAdmin, async (req, res) => {
  const updates = { ...req.body };
  if (updates.date) updates.date = new Date(updates.date);
  const event = await Event.findByIdAndUpdate(req.params.id, updates, { new: true }).lean();
  if (!event) return res.status(404).json({ error: 'Event not found' });
  return res.json(normalizeEvent(event));
});

router.delete('/events/:id', requireAdmin, async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  return res.json({ ok: true });
});

router.get('/requests', requireAdmin, async (req, res) => {
  const requests = await EventCreationRequest.find().sort({ createdAt: -1 }).lean();
  return res.json(
    requests.map((r) => ({
      id: String(r._id),
      userId: String(r.userId),
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))
  );
});

module.exports = router;

