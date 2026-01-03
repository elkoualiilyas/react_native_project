const mongoose = require('mongoose');

async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event_finder';
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
}

module.exports = { connectToDatabase };

