const Event = require('./models/Event');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function seedEventsIfEmpty() {
  const count = await Event.countDocuments();
  if (count > 0) return;

  const now = Date.now();
  await Event.insertMany([
    {
      title: 'Campus Hack Night',
      category: 'programming',
      price: 0,
      organizer: 'CS Club',
      date: new Date(now + 1000 * 60 * 60 * 24),
      description: 'Bring your laptop and build something fun with friends.',
      location: { lat: 37.78825, lng: -122.4324, address: 'Student Union, Room 204' },
    },
    {
      title: 'Intramural Soccer Tryouts',
      category: 'soccer',
      organizer: 'Sports Office',
      date: new Date(now + 1000 * 60 * 60 * 48),
      description: 'Open tryouts for intramural teams. All levels welcome.',
      location: { lat: 37.7865, lng: -122.4339, address: 'Main Field' },
    },
    {
      title: 'Basketball Pickup Games',
      category: 'basketball',
      price: 5,
      organizer: 'Rec Center',
      date: new Date(now + 1000 * 60 * 60 * 72),
      description: 'Casual pickup games. Bring shoes and water.',
      location: { lat: 37.7891, lng: -122.4351, address: 'Rec Center Courts' },
    },
    {
      title: 'Outdoor Sports Meetup',
      category: 'sports',
      organizer: 'Student Activities',
      date: new Date(now + 1000 * 60 * 60 * 96),
      description: 'A mix of games and activities outdoors. Come and join!',
      location: { lat: 37.787, lng: -122.431, address: 'North Lawn' },
    },
    {
      title: 'Social Night (21+)',
      category: 'drinking',
      price: 15,
      organizer: 'Student Council',
      date: new Date(now + 1000 * 60 * 60 * 120),
      description: 'Meet new friends. Please drink responsibly.',
      location: { lat: 37.7902, lng: -122.434, address: 'Downtown Lounge' },
    },
  ]);
}

async function seedUserIfMissing() {
  const email = 'alex@student.edu';
  const existing = await User.findOne({ email }).lean();
  if (existing) return;

  const passwordHash = await bcrypt.hash('password', 10);
  await User.create({
    name: 'Alex Student',
    age: 20,
    email,
    passwordHash,
    preferences: ['programming', 'basketball'],
    canCreateEvents: false,
  });
}

module.exports = { seedEventsIfEmpty, seedUserIfMissing };
