const express = require('express');
const mongoose = require('mongoose');

const Event = require('../models/Event');
const User = require('../models/User');
const UserEventInteraction = require('../models/UserEventInteraction');

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

async function upsertInteraction({ userId, eventId }, updates) {
  return UserEventInteraction.findOneAndUpdate(
    { userId, eventId },
    { $set: updates, $setOnInsert: { userId, eventId } },
    { new: true, upsert: true }
  ).lean();
}

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }
  const list = await UserEventInteraction.find({ userId }).lean();
  const interestedEventIds = list.filter((x) => x.interested).map((x) => String(x.eventId));
  const joinedEventIds = list.filter((x) => x.joined).map((x) => String(x.eventId));
  const chatVisitedEventIds = list.filter((x) => x.chatVisitedAt).map((x) => String(x.eventId));
  return res.json({ interestedEventIds, joinedEventIds, chatVisitedEventIds });
});

router.get('/:userId/joined-events', async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }
  const list = await UserEventInteraction.find({ userId, joined: true }).lean();
  const eventIds = list.map((x) => x.eventId);
  const events = await Event.find({ _id: { $in: eventIds } }).sort({ date: 1 }).lean();
  return res.json(events.map(normalizeEvent));
});

router.patch('/interest', async (req, res) => {
  const { userId, eventId } = req.body || {};
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(eventId)) {
    return res.status(400).json({ error: 'Invalid userId or eventId' });
  }
  const user = await User.findById(userId).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  const event = await Event.findById(eventId).lean();
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const existing = await UserEventInteraction.findOne({ userId, eventId }).lean();
  const next = !existing?.interested;
  const updated = await upsertInteraction({ userId, eventId }, { interested: next });
  return res.json({ eventId: String(eventId), interested: !!updated.interested });
});

router.patch('/join', async (req, res) => {
  const { userId, eventId } = req.body || {};
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(eventId)) {
    return res.status(400).json({ error: 'Invalid userId or eventId' });
  }
  const user = await User.findById(userId).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  const event = await Event.findById(eventId).lean();
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const updated = await upsertInteraction({ userId, eventId }, { joined: true });
  return res.json({ eventId: String(eventId), joined: !!updated.joined });
});

router.patch('/chat-visited', async (req, res) => {
  const { userId, eventId } = req.body || {};
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(eventId)) {
    return res.status(400).json({ error: 'Invalid userId or eventId' });
  }
  const user = await User.findById(userId).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  const event = await Event.findById(eventId).lean();
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const updated = await upsertInteraction({ userId, eventId }, { chatVisitedAt: new Date() });
  return res.json({ eventId: String(eventId), chatVisitedAt: updated.chatVisitedAt });
});

module.exports = router;

