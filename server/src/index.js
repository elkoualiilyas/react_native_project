require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { connectToDatabase } = require('./db');
const { seedEventsIfEmpty, seedUserIfMissing } = require('./seed');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const requestRoutes = require('./routes/requests');
const adminRoutes = require('./routes/admin');
const interactionRoutes = require('./routes/interactions');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/interactions', interactionRoutes);

const port = Number(process.env.PORT || 3002);
const host = process.env.HOST || '0.0.0.0';

async function start() {
  await connectToDatabase();
  await seedUserIfMissing();
  await seedEventsIfEmpty();
  app.listen(port, host, () => {
    console.log(`Backend listening on http://${host}:${port}`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
