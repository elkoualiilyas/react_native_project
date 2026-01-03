const express = require('express');
const EventCreationRequest = require('../models/EventCreationRequest');
const User = require('../models/User');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

function normalizeRequest(r) {
  return {
    id: String(r._id),
    userId: String(r.userId),
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

router.post('/create', async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const existingPending = await EventCreationRequest.findOne({ userId: user._id, status: 'PENDING' }).lean();
  if (existingPending) {
    return res.json(normalizeRequest(existingPending));
  }

  const request = await EventCreationRequest.create({ userId: user._id, status: 'PENDING' });
  return res.status(201).json(normalizeRequest(request.toObject()));
});

router.get('/status/:userId', async (req, res) => {
  const request = await EventCreationRequest.findOne({ userId: req.params.userId })
    .sort({ createdAt: -1 })
    .lean();
  if (!request) {
    return res.json(null);
  }
  return res.json(normalizeRequest(request));
});

router.get('/', requireAdmin, async (req, res) => {
  const requests = await EventCreationRequest.find().sort({ createdAt: -1 }).lean();
  return res.json(requests.map(normalizeRequest));
});

router.patch('/:id/approve', requireAdmin, async (req, res) => {
  const request = await EventCreationRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  request.status = 'APPROVED';
  await request.save();

  await User.findByIdAndUpdate(request.userId, { canCreateEvents: true });

  return res.json(normalizeRequest(request.toObject()));
});

router.patch('/:id/reject', requireAdmin, async (req, res) => {
  const request = await EventCreationRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  request.status = 'REJECTED';
  await request.save();
  return res.json(normalizeRequest(request.toObject()));
});

module.exports = router;

