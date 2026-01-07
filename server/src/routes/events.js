const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');

const router = express.Router();

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

function mapPreferencesToCategories(preferences) {
  const out = new Set();
  for (const p of preferences) {
    const pref = String(p || '').trim().toLowerCase();
    if (!pref) continue;
    if (['programming', 'drinking', 'soccer', 'basketball'].includes(pref)) {
      out.add(pref);
      continue;
    }
    if (pref === 'tech') {
      out.add('programming');
      continue;
    }
    if (pref === 'sports') {
      out.add('sports');
      out.add('soccer');
      out.add('basketball');
      continue;
    }
    if (pref === 'networking') {
      out.add('programming');
      out.add('sports');
      continue;
    }
  }
  return Array.from(out);
}

router.get('/', async (req, res) => {
  const preferencesParam = req.query.preferences;
  const preferences = typeof preferencesParam === 'string' && preferencesParam.length > 0
    ? preferencesParam.split(',').map((p) => p.trim()).filter(Boolean)
    : [];

  const categories = mapPreferencesToCategories(preferences);
  const filter = categories.length > 0 ? { category: { $in: categories } } : {};
  const events = await Event.find(filter).sort({ date: 1 }).lean();
  return res.json(events.map(normalizeEvent));
});

router.get('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id).lean();
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  return res.json(normalizeEvent(event));
});

router.post('/', async (req, res) => {
  const { userId, title, category, price, organizer, date, description, location } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const user = await User.findById(userId).lean();
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (!user.canCreateEvents) {
    return res.status(403).json({ error: 'User cannot create events' });
  }

  const event = await Event.create({
    title,
    category,
    price: price === '' || price === null ? undefined : price,
    organizer,
    date: new Date(date),
    description,
    location,
    createdByUserId: user._id,
  });

  return res.status(201).json(normalizeEvent(event.toObject()));
});

module.exports = router;
