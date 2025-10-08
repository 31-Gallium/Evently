
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Helper function to generate a random number within a range
const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  console.log('Start seeding...');

  // 1. Clear existing data in the correct order
  console.log('Clearing database...');
  await prisma.organizerRequest.deleteMany();
  await prisma.eventChangeRequest.deleteMany();
  await prisma.waitlistEntry.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.userHype.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany(); // Clearing users as well to ensure a clean slate
  console.log('Database cleared.');

  // 2. Create Users
  console.log('Creating users...');
  const users = [];
  const userRoles = ['USER', 'ORGANIZER', 'ADMIN'];
  for (let i = 0; i < 320; i++) {
    try {
      const user = await prisma.user.create({
        data: {
          firebaseUid: `test-uid-${i}`,
          email: `user${i}@evently.com`,
          role: i < 5 ? 'USER' : (i < 8 ? 'ORGANIZER' : 'USER'), // Create a mix of roles
          organizationName: i >= 5 && i < 8 ? `Org ${i}` : null,
        },
      });
      users.push(user);
    } catch (error) {
      console.error(`Failed to create user ${i}:`, error);
    }
  }
  console.log(`Created ${users.length} users.`);

  // 3. Create Events
  console.log('Creating events...');
  const eventsData = [
    // ... (Keep existing events and add more)
    { name: 'Delhi Tech Summit 2025', date: new Date('2025-11-20T10:00:00Z'), location: 'Pragati Maidan, New Delhi', price: 2500, description: 'The premier technology conference in India.', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: true, tags: 'Tech,Conference,Networking', capacity: 500, status: 'PUBLISHED' },
    { name: 'Sufi Music Festival', date: new Date('2025-12-05T18:00:00Z'), location: 'Jawaharlal Nehru Stadium, Delhi', price: 1200, description: 'An evening of soulful Sufi music.', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: true, tags: 'Music,Culture,Festival', capacity: 2000, status: 'PUBLISHED' },
    { name: 'Delhi International Food Fest', date: new Date('2025-11-29T12:00:00Z'), location: 'India Gate Lawns, New Delhi', price: 750, description: 'A paradise for food lovers!', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: false, tags: 'Food,Festival,Family', capacity: 1500, status: 'PUBLISHED' },
    { name: 'Startup Conclave & Expo', date: new Date('2025-12-12T09:30:00Z'), location: 'India Habitat Centre, Delhi', price: 1500, description: 'Connect with the brightest minds in the startup ecosystem.', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: false, tags: 'Business,Networking,Startups', capacity: 300, status: 'PUBLISHED' },
    { name: 'Delhi Comic Con 2025', date: new Date('2025-12-19T11:00:00Z'), location: 'NSIC Exhibition Complex, Okhla', price: 899, description: 'The biggest pop-culture celebration!', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd84627?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: true, tags: 'Pop Culture,Comics,Gaming', capacity: 5000, status: 'PUBLISHED' },
    { name: 'Himalayan Trekking Workshop', date: new Date('2025-11-15T09:00:00Z'), location: 'Indian Mountaineering Foundation, Moti Bagh', price: 1800, description: 'Prepare for your next adventure.', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: false, tags: 'Adventure,Workshop,Outdoors', capacity: 50, status: 'PUBLISHED' },
    { name: 'Classical Indian Dance Showcase', date: new Date('2026-01-10T19:00:00Z'), location: 'Kamani Auditorium, Copernicus Marg', price: 950, description: 'A mesmerizing evening of Indian classical dance.', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1606822437129-9b7d10c37012?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: false, tags: 'Culture,Dance,Arts', capacity: 600, status: 'PUBLISHED' },
    { name: 'Delhi Marathon 2026', date: new Date('2026-02-15T05:30:00Z'), location: 'Starts at Rajpath', price: 2100, description: 'Join thousands of runners.', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: true, tags: 'Sports,Health,Marathon', capacity: 10000, status: 'PUBLISHED' },
    { name: 'Past Tech Meetup', date: new Date('2024-09-15T18:00:00Z'), location: 'Cyber Hub, Gurugram', price: 500, description: 'A look back at the trends of 2024.', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: false, tags: 'Tech,Networking', capacity: 100, status: 'PUBLISHED' },
    { name: 'Indie Music Night', date: new Date('2025-10-25T20:00:00Z'), location: 'The Piano Man Jazz Club, Safdarjung', price: 1000, description: 'Discover Delhi\'s indie music scene.', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1516214124259-011a84f385c7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: false, tags: 'Music,Indie', capacity: 80, status: 'PUBLISHED' },
    { name: 'AI & Machine Learning Conference', date: new Date('2026-03-10T09:00:00Z'), location: 'The Leela Ambience, Gurugram', price: 7500, description: 'A deep dive into the future of AI.', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1620712943543-95fc6962c5b7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: true, tags: 'Tech,Conference,AI', capacity: 400, status: 'PUBLISHED' },
    { name: 'Street Photography Workshop', date: new Date('2025-11-08T08:00:00Z'), location: 'Chandni Chowk, Old Delhi', price: 2200, description: 'Capture the chaotic beauty of Old Delhi.', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1506143925201-0252c51780b0?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: false, tags: 'Workshop,Arts,Photography', capacity: 15, status: 'PUBLISHED' },
    { name: 'Open Mic Comedy Night', date: new Date('2025-10-18T21:00:00Z'), location: 'Canvas Laugh Club, Noida', price: 499, description: 'Laugh your heart out.', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1529636798458-22180ab48f5b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: false, tags: 'Comedy,Entertainment', capacity: 150, status: 'PUBLISHED' },
    { name: 'Delhi Book Fair 2026', date: new Date('2026-01-08T11:00:00Z'), location: 'Pragati Maidan, New Delhi', price: 50, description: 'The annual celebration of literature.', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: false, tags: 'Books,Literature,Fair', capacity: 20000, status: 'PUBLISHED' },
    { name: 'Esports Championship: Delhi Finals', date: new Date('2025-11-22T12:00:00Z'), location: 'Thyagaraj Sports Complex, INA', price: 799, description: 'Watch the top esports teams battle it out.', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: false, tags: 'Gaming,Esports,Competition', capacity: 3000, status: 'PUBLISHED' },
  ];


  const eventTemplates = [
    { title: 'Artisan Coffee Brewing Workshop', tags: 'Food,Workshop,Lifestyle', basePrice: 1500 },
    { title: 'Indie Film Screening Night', tags: 'Arts,Entertainment,Film', basePrice: 800 },
    { title: 'Electronic Music Production Masterclass', tags: 'Music,Workshop,Tech', basePrice: 3000 },
    { title: 'Sustainable Fashion Pop-Up Market', tags: 'Lifestyle,Shopping,Community', basePrice: 0 },
    { title: 'Data Science for Beginners Bootcamp', tags: 'Tech,Workshop,Education', basePrice: 5000 },
    { title: 'Live Jazz & Wine Tasting', tags: 'Music,Food,Lifestyle', basePrice: 2500 },
    { title: 'Urban Gardening & Composting', tags: 'Community,Workshop,Lifestyle', basePrice: 500 },
    { title: 'Stand-Up Comedy Special Taping', tags: 'Comedy,Entertainment', basePrice: 1200 },
    { title: 'Virtual Reality Gaming Tournament', tags: 'Gaming,Tech,Competition', basePrice: 1000 },
    { title: 'Modern Calligraphy Workshop', tags: 'Arts,Workshop,Lifestyle', basePrice: 1800 },
  ];

  const locations = [
    'The Creative Hub, Hauz Khas Village',
    'The Tech Park, Gurugram',
    'The Art House, Saket',
    'Community Hall, Noida Sector 62',
    'Rooftop Cafe, Connaught Place',
    'The Performance Centre, Mandi House',
  ];

  const organizerNames = [
    'Creative Connect',
    'Tech Innovators Guild',
    'Art & Soul Collective',
    'Community Builders Inc.',
    'Urban Experiences Co.',
    'SoundScapes',
  ];

  for (let i = 0; i < 100; i++) {
    const template = eventTemplates[i % eventTemplates.length];
    const location = locations[i % locations.length];
    const organizerName = organizerNames[i % organizerNames.length];
    const date = new Date(2025, 10, randomInRange(1, 30), randomInRange(10, 20), 0, 0);

    eventsData.push({
      name: `${template.title} #${Math.floor(i / eventTemplates.length) + 1}`,
      date: date,
      location: location,
      price: template.basePrice + randomInRange(-200, 200),
      description: `Join us for a unique experience at the ${template.title}. A great opportunity to learn, connect, and have fun.`,
      organizerName: organizerName,
      imageUrl: `https://source.unsplash.com/random/800x600?${template.tags.split(',')[0].toLowerCase()}`,
      isFeatured: Math.random() < 0.2, // 20% chance of being featured
      tags: template.tags,
      capacity: randomInRange(50, 500),
      status: 'PUBLISHED',
    });
  }


  const createdEvents = [];
  for (const eventData of eventsData) {
    const organizer = users.find(u => u.role === 'ORGANIZER');
    const event = await prisma.event.create({
      data: {
        ...eventData,
        organizerId: organizer?.id, // Assign an organizer if available
      },
    });
    createdEvents.push(event);
  }
  console.log(`Created ${createdEvents.length} events.`);

  // 4. Create Bookings and Hypes
  console.log('Creating bookings and hypes...');
  for (const event of createdEvents) {
    // Don't create bookings for past events
    if (event.date < new Date()) continue;

    const bookingsCount = randomInRange(0, Math.floor(event.capacity * 0.3)); // Book up to 30% of capacity
    const hypeCount = randomInRange(0, users.length);
    
    let ticketsSold = 0;

    // Create Bookings
    const usersForBooking = [...users].sort(() => 0.5 - Math.random()).slice(0, bookingsCount);
    for (const user of usersForBooking) {
      try {
        await prisma.booking.create({
          data: {
            userId: user.id,
            eventId: event.id,
          },
        });
        ticketsSold++;
      } catch (e) {
        // Ignore unique constraint violation if user already booked
      }
    }

    // Create Hypes
    const usersForHype = [...users].sort(() => 0.5 - Math.random()).slice(0, hypeCount);
    for (const user of usersForHype) {
      try {
        await prisma.userHype.create({
          data: {
            userId: user.id,
            eventId: event.id,
          },
        });
      } catch (e) {
        // Ignore unique constraint violation if user already hyped
      }
    }

    // Update event with aggregated counts
    await prisma.event.update({
      where: { id: event.id },
      data: {
        ticketsSold: ticketsSold,
        hypeCount: usersForHype.length,
      },
    });
  }
  console.log('Created bookings and hypes.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
