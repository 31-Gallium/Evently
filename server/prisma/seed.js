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
  await prisma.user.deleteMany();
  console.log('Database cleared.');

  // 2. Create Users
  // createMany does not return IDs, so we create users individually to get them.
  // This is slower but necessary for linking events and bookings.
  console.log('Creating users...');
  const users = [];
  for (let i = 0; i < 320; i++) {
    const user = await prisma.user.create({
      data: {
        firebaseUid: `test-uid-${i}`,
        email: `user${i}@evently.com`,
        role: i < 5 ? 'USER' : (i < 8 ? 'ORGANIZER' : 'USER'),
        organizationName: i >= 5 && i < 8 ? `Org ${i}` : null,
      },
    });
    users.push(user);
  }
  console.log(`Created ${users.length} users.`);

  // 3. Prepare Event Data
  console.log('Preparing event data...');
  let eventsData = [
    { name: 'Delhi Tech Summit 2025', date: new Date('2025-11-20T10:00:00Z'), location: 'Pragati Maidan, New Delhi', price: 2500, description: 'The premier technology conference in India.', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: true, tags: 'Tech,Conference,Networking', capacity: 500, status: 'PUBLISHED' },
    { name: 'Sufi Music Festival', date: new Date('2025-12-05T18:00:00Z'), location: 'Jawaharlal Nehru Stadium, Delhi', price: 1200, description: 'An evening of soulful Sufi music.', organizerName: 'Evently', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200', isFeatured: true, tags: 'Music,Culture,Festival', capacity: 2000, status: 'PUBLISHED' },
    // Add other predefined events here...
  ];

  const eventTemplates = [
    { title: 'Artisan Coffee Brewing Workshop', tags: 'Food,Workshop,Lifestyle', basePrice: 1500 },
    { title: 'Indie Film Screening Night', tags: 'Arts,Entertainment,Film', basePrice: 800 },
    // Add other templates here...
  ];

  const locations = ['The Creative Hub, Hauz Khas Village', 'The Tech Park, Gurugram'];
  const organizerUsers = users.filter(u => u.role === 'ORGANIZER');

  for (let i = 0; i < 100; i++) {
    const template = eventTemplates[i % eventTemplates.length];
    const location = locations[i % locations.length];
    const organizer = organizerUsers[i % organizerUsers.length];
    const date = new Date(2025, 10, randomInRange(1, 30), randomInRange(10, 20), 0, 0);

    eventsData.push({
      name: `${template.title} #${Math.floor(i / eventTemplates.length) + 1}`,
      date: date,
      location: location,
      price: template.basePrice + randomInRange(-200, 200),
      description: `Join us for a unique experience at the ${template.title}.`,
      organizerName: organizer.organizationName || 'Evently',
      organizerId: organizer.id,
      imageUrl: `https://source.unsplash.com/random/800x600?${template.tags.split(',')[0].toLowerCase()}`,
      isFeatured: Math.random() < 0.2,
      tags: template.tags,
      capacity: randomInRange(50, 500),
      status: 'PUBLISHED',
    });
  }

  // 4. Create Events in a batch
  console.log('Creating events...');
  // Prisma's createMany for SQLite doesn't support relations, so we create one by one but it's still faster than the final step.
  const createdEvents = [];
  for (const eventData of eventsData) {
      const event = await prisma.event.create({ data: eventData });
      createdEvents.push(event);
  }
  console.log(`Created ${createdEvents.length} events.`);

  // 5. Prepare and Create Bookings and Hypes in Batches
  console.log('Preparing bookings and hypes...');
  const bookingsToCreate = [];
  const hypesToCreate = [];
  const eventCountUpdates = [];

  for (const event of createdEvents) {
    if (event.date < new Date()) continue;

    const bookingsCount = randomInRange(0, Math.floor(event.capacity * 0.3));
    const hypeCount = randomInRange(0, users.length);

    const usersForBooking = [...users].sort(() => 0.5 - Math.random()).slice(0, bookingsCount);
    for (const user of usersForBooking) {
      bookingsToCreate.push({ userId: user.id, eventId: event.id });
    }

    const usersForHype = [...users].sort(() => 0.5 - Math.random()).slice(0, hypeCount);
    for (const user of usersForHype) {
      hypesToCreate.push({ userId: user.id, eventId: event.id });
    }
    
    eventCountUpdates.push({
        where: { id: event.id },
        data: { ticketsSold: usersForBooking.length, hypeCount: usersForHype.length },
    });
  }

  console.log(`Creating ${bookingsToCreate.length} bookings...`);
  await prisma.booking.createMany({ data: bookingsToCreate, skipDuplicates: true });
  
  console.log(`Creating ${hypesToCreate.length} hypes...`);
  await prisma.userHype.createMany({ data: hypesToCreate, skipDuplicates: true });

  // 6. Update event counts
  console.log('Updating event counts...');
  for (const update of eventCountUpdates) {
      await prisma.event.update(update);
  }

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