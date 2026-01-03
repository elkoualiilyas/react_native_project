// src/repositories/_mockData.js

/** @type {import('../models/User').User[]} */
export const users = [
  {
    id: 'u1',
    name: 'Alex Student',
    age: 20,
    email: 'alex@student.edu',
    preferences: ['programming', 'basketball'],
  },
];

/** @type {import('../models/Event').Event[]} */
export const events = [
  {
    id: 'e1',
    title: 'Campus Hack Night',
    category: 'programming',
    price: 0,
    organizer: 'CS Club',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    description: 'Bring your laptop and build something fun with friends.',
    location: {
      lat: 37.78825,
      lng: -122.4324,
      address: 'Student Union, Room 204',
    },
  },
  {
    id: 'e2',
    title: 'Intramural Soccer Tryouts',
    category: 'soccer',
    organizer: 'Sports Office',
    date: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    description: 'Open tryouts for intramural teams. All levels welcome.',
    location: {
      lat: 37.7865,
      lng: -122.4339,
      address: 'Main Field',
    },
  },
  {
    id: 'e3',
    title: 'Basketball Pickup Games',
    category: 'basketball',
    price: 5,
    organizer: 'Rec Center',
    date: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    description: 'Casual pickup games. Bring shoes and water.',
    location: {
      lat: 37.7891,
      lng: -122.4351,
      address: 'Rec Center Courts',
    },
  },
  {
    id: 'e4',
    title: 'Outdoor Sports Meetup',
    category: 'sports',
    organizer: 'Student Activities',
    date: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
    description: 'A mix of games and activities outdoors. Come and join!',
    location: {
      lat: 37.787,
      lng: -122.431,
      address: 'North Lawn',
    },
  },
  {
    id: 'e5',
    title: 'Social Night (21+)',
    category: 'drinking',
    price: 15,
    organizer: 'Student Council',
    date: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    description: 'Meet new friends. Please drink responsibly.',
    location: {
      lat: 37.7902,
      lng: -122.434,
      address: 'Downtown Lounge',
    },
  },
];

