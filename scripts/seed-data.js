// Script to seed initial data to Firestore
// Run with: node scripts/seed-data.js

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedData() {
  console.log('Starting to seed data...');

  // Sample carriers data
  const carriers = [
    {
      userId: 'sample-user-1',
      name: 'Alex Johnson',
      from: 'New York, USA',
      to: 'London, UK',
      date: new Date('2024-08-15'),
      transportType: 'Flight',
      packageSize: 'Small package (2kg)',
      price: 45,
      avatar: 'A',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      userId: 'sample-user-2',
      name: 'Maria Garcia',
      from: 'Paris, France',
      to: 'Berlin, Germany',
      date: new Date('2024-08-18'),
      transportType: 'Flight',
      packageSize: 'Medium package (4kg)',
      price: 30,
      avatar: 'M',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      userId: 'sample-user-3',
      name: 'David Smith',
      from: 'Tokyo, Japan',
      to: 'Seoul, South Korea',
      date: new Date('2024-08-22'),
      transportType: 'Flight',
      packageSize: 'Large package (8kg)',
      price: 55,
      avatar: 'D',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      userId: 'sample-user-4',
      name: 'Sophia Chen',
      from: 'Sydney, Australia',
      to: 'Auckland, New Zealand',
      date: new Date('2024-08-25'),
      transportType: 'Flight',
      packageSize: 'Small package (1kg)',
      price: 35,
      avatar: 'S',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }
  ];

  // Add carriers to Firestore
  for (const carrier of carriers) {
    await db.collection('carriers').add(carrier);
    console.log(`Added carrier: ${carrier.name}`);
  }

  // Sample users data
  const users = [
    {
      email: 'alex@example.com',
      displayName: 'Alex Johnson',
      bio: 'Frequent traveler between US and Europe for business. Happy to help deliver packages on my regular routes!',
      location: 'New York, USA',
      phone: '+1 234-567-8900',
      verified: true,
      completedTrips: 18,
      packagesDelivered: 36,
      totalEarnings: 820,
      rating: 4.8,
      reviewCount: 24,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }
  ];

  // Add users to Firestore (using specific IDs)
  for (let i = 0; i < users.length; i++) {
    await db.collection('users').doc(`sample-user-${i + 1}`).set(users[i]);
    console.log(`Added user: ${users[i].displayName}`);
  }

  console.log('Data seeding completed!');
  process.exit(0);
}

seedData().catch(console.error);
