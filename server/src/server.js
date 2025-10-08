import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// CORS configuration
const whitelist = ['http://localhost:3000', 'https://evently-kbj3.onrender.com'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

const createApp = (admin) => {
  const app = express();
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- MIDDLEWARE ---

  const verifyFirebaseToken = async (req, res, next) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Authentication required.' });
      }

      const idToken = authHeader.split('Bearer ')[1];

      try {
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          req.firebaseUid = decodedToken.uid;
          next();
      } catch (error) {
          console.error('Error verifying Firebase ID token:', error);
          res.status(401).json({ error: 'Unauthorized' });
      }
  };


  const getUser = async (req, res, next) => {
      if (!req.firebaseUid) {
          return res.status(401).json({ error: 'Authentication required.' });
      }
      try {
          const user = await prisma.user.findUnique({ where: { firebaseUid: req.firebaseUid } });
          if (!user) {
              return res.status(401).json({ error: 'User not found.' });
          }
          req.user = user;
          next();
      } catch (error) {
          next(error);
      }
  };

  const isAdmin = (req, res, next) => {
      if (req.user && req.user.role === 'ADMIN') {
          return next();
      }
      res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
  };

  const isOrganizer = (req, res, next) => {
      if (req.user && (req.user.role === 'ORGANIZER' || req.user.role === 'ADMIN')) {
          return next();
      }
      res.status(403).json({ error: 'Forbidden. Organizer privileges required.' });
  };

  // --- ASYNC-AWARE ROUTE HANDLER ---
  const asyncHandler = (fn) => (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
  };


  // --- PUBLIC API Endpoints ---
  app.get('/', (req, res) => res.json({ message: "Welcome to the Evently API!" }));

  app.get('/api/events', asyncHandler(async (req, res) => {
      const limit = parseInt(req.query.limit) || 21;
      const events = await prisma.event.findMany({
          where: {
              date: { gte: new Date() },
              status: 'PUBLISHED'
          },
          orderBy: [{ isFeatured: 'desc' }, { date: 'asc' }],
          take: limit,
      });
      res.json(events);
  }));

  app.get('/api/events/past', asyncHandler(async (req, res) => {
      const events = await prisma.event.findMany({
          where: {
              date: { lt: new Date() },
              status: 'PUBLISHED'
          },
          orderBy: { date: 'desc' }
      });
      res.json(events);
  }));

  app.get('/api/events/trending', asyncHandler(async (req, res) => {
      const events = await prisma.event.findMany({
          where: {
              date: { gte: new Date() },
              status: 'PUBLISHED'
          },
          orderBy: { hypeCount: 'desc' },
          take: 13,
      });
      res.json(events);
  }));

  app.get('/api/events/bestselling', asyncHandler(async (req, res) => {
      const events = await prisma.event.findMany({
          where: {
              date: { gte: new Date() },
              status: 'PUBLISHED',
              capacity: { gt: 0 },
          }
      });

      const eventsWithRatio = events.map(event => ({
          ...event,
          soldRatio: event.ticketsSold / event.capacity
      }));

      eventsWithRatio.sort((a, b) => b.soldRatio - a.soldRatio);

      res.json(eventsWithRatio.slice(0, 10));
  }));

  app.get('/api/tags/counts', asyncHandler(async (req, res) => {
      const events = await prisma.event.findMany({
          where: { status: 'PUBLISHED' },
          select: { tags: true }
      });

      const tagCounts = {};
      events.forEach(event => {
          if (event.tags) {
              const tags = event.tags.split(',').map(t => t.trim());
              tags.forEach(tag => {
                  if (tag) {
                      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                  }
              });
          }
      });
      res.json(tagCounts);
  }));

  app.get('/api/events/search', asyncHandler(async (req, res) => {
      const query = req.query.q;
      if (!query) {
          return res.json([]);
      }

      const events = await prisma.$queryRaw`
          SELECT * FROM Event
          WHERE status = 'PUBLISHED' AND (
              LOWER(name) LIKE '%' || LOWER(${query}) || '%' OR
              LOWER(description) LIKE '%' || LOWER(${query}) || '%' OR
              LOWER(location) LIKE '%' || LOWER(${query}) || '%' OR
              LOWER(tags) LIKE '%' || LOWER(${query}) || '%'
          )
          LIMIT 10
      `;

      res.json(events);
  }));

  app.get('/api/events/:id', asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
          return res.status(400).json({ error: 'Invalid event ID.' });
      }
      const event = await prisma.event.findFirst({
          where: { id, status: 'PUBLISHED' }
      });
      if (event) {
          res.json(event);
      } else {
          res.status(404).json({ error: 'Event not found' });
      }
  }));

  app.get('/api/events/tag/:tag', asyncHandler(async (req, res) => {
      const { tag } = req.params;
      const events = await prisma.event.findMany({
          where: {
              status: 'PUBLISHED',
              tags: {
                  contains: tag,
              },
          },
          orderBy: { date: 'asc' },
          take: 20, // Limit to 20 events per tag
      });
      res.json(events);
  }));

  app.get('/api/organization/:organizerName', asyncHandler(async (req, res) => {
      const { organizerName } = req.params;
      const decodedName = decodeURIComponent(organizerName).replace(/-/g, ' ');

      const now = new Date();
      const upcomingEvents = await prisma.event.findMany({
          where: { organizerName: decodedName, status: 'PUBLISHED', date: { gte: now } },
          orderBy: { date: 'asc' },
      });
      const pastEvents = await prisma.event.findMany({
          where: { organizerName: decodedName, status: 'PUBLISHED', date: { lt: now } },
          orderBy: { date: 'desc' },
      });
      res.json({ organizationName: decodedName, upcomingEvents, pastEvents });
  }));


  // --- USER RELATED Endpoints ---
  app.post('/api/users', verifyFirebaseToken, asyncHandler(async (req, res) => {
      const { email } = req.body;
      if (!email) {
          return res.status(400).json({ error: 'Email is required.' });
      }

      // Use upsert to either create a new user or update the firebaseUid if the user was pre-seeded.
      const user = await prisma.user.upsert({
          where: { email },
          update: { firebaseUid: req.firebaseUid },
          create: { email, firebaseUid: req.firebaseUid },
      });

      res.status(200).json(user);
  }));

  app.get('/api/users/me', verifyFirebaseToken, getUser, (req, res) => {
      res.json({
          email: req.user.email,
          role: req.user.role,
          createdAt: req.user.createdAt,
          organizationName: req.user.organizationName,
          organizerRequestStatus: req.user.organizerRequest?.status,
      });
  });

  app.get('/api/users/bookings', verifyFirebaseToken, getUser, asyncHandler(async (req, res) => {
      const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: {
              bookings: {
                  include: { event: true },
                  orderBy: { event: { date: 'asc' } }
              }
          }
      });
      res.json(user.bookings);
  }));

  app.get('/api/users/waitlist', verifyFirebaseToken, getUser, asyncHandler(async (req, res) => {
      const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: { waitlistEntries: { select: { eventId: true } } }
      });
      res.json(user.waitlistEntries);
  }));

  app.get('/api/users/hypes', verifyFirebaseToken, getUser, asyncHandler(async (req, res) => {
      const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: { hypedEvents: { select: { eventId: true } } }
      });
      res.json(user.hypedEvents);
  }));

  app.get('/api/users/watchlist', verifyFirebaseToken, getUser, asyncHandler(async (req, res) => {
      const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: { watchlist: { select: { eventId: true } } }
      });
      res.json(user.watchlist);
  }));

  app.get('/api/users/recommendations', verifyFirebaseToken, getUser, asyncHandler(async (req, res) => {
      const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: {
              bookings: { include: { event: true } },
              hypedEvents: { include: { event: true } },
          },
      });

      const favoriteTags = new Set();
      user.bookings.forEach(b => b.event.tags?.split(',').forEach(t => favoriteTags.add(t.trim())));
      user.hypedEvents.forEach(h => h.event.tags?.split(',').forEach(t => favoriteTags.add(t.trim())));

      if (favoriteTags.size === 0) {
          return res.json([]);
      }

      const recommendations = await prisma.event.findMany({
          where: {
              status: 'PUBLISHED',
              date: { gte: new Date() },
              OR: Array.from(favoriteTags).map(tag => ({ tags: { contains: tag } })),
              NOT: {
                  id: {
                      in: [
                          ...user.bookings.map(b => b.eventId),
                          ...user.hypedEvents.map(h => h.eventId),
                      ]
                  }
              },
          },
          take: 10,
      });

      res.json(recommendations);
  }));


  // --- HYPE, BOOKING & WATCHLIST Endpoints ---
  app.post('/api/events/:id/hype', verifyFirebaseToken, getUser, asyncHandler(async (req, res) => {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
          return res.status(400).json({ error: 'Invalid event ID.' });
      }

      try {
          const [, event] = await prisma.$transaction([
              prisma.userHype.create({
                  data: {
                      userId: req.user.id,
                      eventId: eventId,
                  },
              }),
              prisma.event.update({
                  where: { id: eventId },
                  data: { hypeCount: { increment: 1 } },
              }),
          ]);
          res.status(200).json(event);
      } catch (error) {
          if (error.code === 'P2002') {
              return res.status(409).json({ error: 'You have already hyped this event.' });
          }
          throw error;
      }
  }));

  app.delete('/api/events/:id/hype', verifyFirebaseToken, getUser, asyncHandler(async (req, res) => {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
          return res.status(400).json({ error: 'Invalid event ID.' });
      }

      try {
          const [, event] = await prisma.$transaction([
              prisma.userHype.delete({
                  where: {
                      userId_eventId: {
                          userId: req.user.id,
                          eventId: eventId,
                      },
                  },
              }),
              prisma.event.update({
                  where: { id: eventId },
                  data: { hypeCount: { decrement: 1 } },
              }),
          ]);
          res.status(200).json(event);
      } catch (error) {
          // Handle cases where the hype entry doesn't exist
          if (error.code === 'P2025') {
              return res.status(404).json({ error: 'You have not hyped this event.' });
          }
          throw error;
      }
  }));

  app.post('/api/watchlist', verifyFirebaseToken, getUser, asyncHandler(async (req, res) => {
      const { eventId } = req.body;
      if (!eventId || isNaN(parseInt(eventId))) {
          return res.status(400).json({ error: 'A valid event ID is required.' });
      }

      try {
          const newWatchlistItem = await prisma.watchlist.create({
              data: {
                  userId: req.user.id,
                  eventId: parseInt(eventId),
              },
          });
          res.status(201).json(newWatchlistItem);
      } catch (error) {
          if (error.code === 'P2002') {
              return res.status(409).json({ error: 'This event is already in your watchlist.' });
          }
          throw error;
      }
  }));

  app.delete('/api/watchlist/:eventId', verifyFirebaseToken, getUser, asyncHandler(async (req, res) => {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
          return res.status(400).json({ error: 'Invalid event ID.' });
      }

      await prisma.watchlist.delete({
          where: {
              userId_eventId: {
                  userId: req.user.id,
                  eventId: eventId,
              },
          },
      });
      res.status(204).send();
  }));

  app.post('/api/bookings', verifyFirebaseToken, getUser, asyncHandler(async (req, res) => {
      const { eventId } = req.body;
      if (!eventId || isNaN(parseInt(eventId))) {
          return res.status(400).json({ error: 'A valid event ID is required.' });
      }

      const event = await prisma.event.findUnique({ where: { id: parseInt(eventId) } });
      if (!event) {
          return res.status(404).json({ error: 'Event not found.' });
      }
      if (event.status !== 'PUBLISHED') {
          return res.status(400).json({ error: 'This event is not available for booking.' });
      }
      if (event.ticketsSold >= event.capacity) {
          return res.status(409).json({ error: 'This event is sold out.' });
      }

      try {
          const [newBooking] = await prisma.$transaction([
              prisma.booking.create({ data: { userId: req.user.id, eventId: parseInt(eventId) } }),
              prisma.event.update({ where: { id: parseInt(eventId) }, data: { ticketsSold: { increment: 1 } } }),
          ]);
          res.status(201).json(newBooking);
      } catch (error) {
          if (error.code === 'P2002') {
              return res.status(409).json({ error: 'You have already booked this event.' });
          }
          throw error;
      }
  }));

  app.delete('/api/bookings/:id', verifyFirebaseToken, getUser, asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
          return res.status(400).json({ error: 'Invalid booking ID.' });
      }

      const booking = await prisma.booking.findUnique({ where: { id } });
      if (!booking) {
          return res.status(404).json({ error: 'Booking not found.' });
      }
      if (booking.userId !== req.user.id) {
          return res.status(403).json({ error: 'Not authorized.' });
      }

      await prisma.$transaction([
          prisma.booking.delete({ where: { id } }),
          prisma.event.update({ where: { id: booking.eventId }, data: { ticketsSold: { decrement: 1 } } }),
      ]);
      res.status(204).send();
  }));

  app.post('/api/waitlist', verifyFirebaseToken, getUser, asyncHandler(async (req, res) => {
      const { eventId } = req.body;
      if (!eventId || isNaN(parseInt(eventId))) {
          return res.status(400).json({ error: 'A valid event ID is required.' });
      }

      const event = await prisma.event.findUnique({ where: { id: parseInt(eventId) } });
      if (!event) {
          return res.status(404).json({ error: 'Event not found.' });
      }
      if (event.ticketsSold < event.capacity) {
          return res.status(400).json({ error: 'Event is not sold out.' });
      }

      try {
          const newEntry = await prisma.waitlistEntry.create({
              data: { userId: req.user.id, eventId: parseInt(eventId) }
          });
          res.status(201).json(newEntry);
      } catch (error) {
          if (error.code === 'P2002') {
              return res.status(409).json({ error: 'You are already on the waitlist.' });
          }
          throw error;
      }
  }));


  // --- ORGANIZER APPLICATION Endpoints ---
  app.post('/api/organizer-requests', verifyFirebaseToken, getUser, asyncHandler(async (req, res) => {
      const { requestedOrgName } = req.body;
      if (!requestedOrgName) {
          return res.status(400).json({ error: 'Organization name is required.' });
      }

      const newRequest = await prisma.organizerRequest.upsert({
          where: { userId: req.user.id },
          update: { requestedOrgName, status: 'PENDING' },
          create: { userId: req.user.id, requestedOrgName }
      });
      res.status(201).json(newRequest);
  }));


  // --- ORGANIZER-SPECIFIC Endpoints ---
  app.get('/api/organizer/events', verifyFirebaseToken, getUser, isOrganizer, asyncHandler(async (req, res) => {
      const events = await prisma.event.findMany({
          where: { organizerId: req.user.id },
          orderBy: { createdAt: 'desc' },
      });
      res.json(events);
  }));

  app.post('/api/organizer/events', verifyFirebaseToken, getUser, isOrganizer, asyncHandler(async (req, res) => {
      const { name, date, location, price, description, imageUrl, tags, capacity } = req.body;
      if (!name || !date || !location || !description || !capacity) {
          return res.status(400).json({ error: "Missing required fields." });
      }
      const parsedPrice = parseFloat(price);
      const parsedCapacity = parseInt(capacity);
      if (isNaN(parsedPrice) || isNaN(parsedCapacity)) {
          return res.status(400).json({ error: "Invalid price or capacity." });
      }
      if (!req.user.organizationName) {
          return res.status(400).json({ error: "Organizer profile is not fully set up." });
      }

      const newEvent = await prisma.event.create({
          data: {
              name,
              date: new Date(date),
              location,
              price: parsedPrice,
              description,
              imageUrl,
              tags,
              capacity: parsedCapacity,
              status: 'DRAFT',
              organizerId: req.user.id,
              organizerName: req.user.organizationName,
              isFeatured: false,
          }
      });
      res.status(201).json(newEvent);
  }));

  app.put('/api/organizer/events/:id', verifyFirebaseToken, getUser, isOrganizer, asyncHandler(async (req, res) => {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
          return res.status(400).json({ error: 'Invalid event ID.' });
      }

      const { name, date, location, price, description, imageUrl, tags, capacity } = req.body;
      if (!name || !date || !location || !description || !capacity) {
          return res.status(400).json({ error: "Missing required fields." });
      }
      const parsedPrice = parseFloat(price);
      const parsedCapacity = parseInt(capacity);
      if (isNaN(parsedPrice) || isNaN(parsedCapacity)) {
          return res.status(400).json({ error: "Invalid price or capacity." });
      }

      const event = await prisma.event.findFirst({ where: { id: eventId, organizerId: req.user.id } });
      if (!event) {
          return res.status(404).json({ error: 'Event not found or you are not the owner.' });
      }
      if (event.status !== 'DRAFT' && event.status !== 'REJECTED') {
          return res.status(403).json({ error: 'You can only edit events that are in draft or rejected status.' });
      }

      const updatedEvent = await prisma.event.update({
          where: { id: eventId },
          data: {
              name,
              date: new Date(date),
              location,
              price: parsedPrice,
              description,
              imageUrl,
              tags,
              capacity: parsedCapacity,
              organizerName: req.user.organizationName,
          }
      });
      res.json(updatedEvent);
  }));

  app.put('/api/organizer/events/:id/submit', verifyFirebaseToken, getUser, isOrganizer, asyncHandler(async (req, res) => {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
          return res.status(400).json({ error: 'Invalid event ID.' });
      }

      const event = await prisma.event.findFirst({ where: { id: eventId, organizerId: req.user.id } });
      if (!event) {
          return res.status(404).json({ error: 'Event not found or you are not the owner.' });
      }

      const updatedEvent = await prisma.event.update({
          where: { id: eventId },
          data: { status: 'PENDING_APPROVAL' },
      });
      res.json(updatedEvent);
  }));


  // --- ADMIN API Endpoints ---
  app.get('/api/admin/stats', verifyFirebaseToken, getUser, isAdmin, asyncHandler(async (req, res) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const totalUsers = await prisma.user.count();
      const totalEvents = await prisma.event.count();
      const totalBookings = await prisma.booking.count();
      const paidEvents = await prisma.event.findMany({ where: { price: { gt: 0 } } });
      const totalRevenue = paidEvents.reduce((acc, event) => acc + (event.price * event.ticketsSold), 0);

      const userSignupsLast30Days = await prisma.user.groupBy({
          by: ['createdAt'],
          where: { createdAt: { gte: thirtyDaysAgo } },
          _count: {
              createdAt: true,
          },
          orderBy: {
              createdAt: 'asc',
          },
      });

      const bookingsLast30Days = await prisma.booking.groupBy({
          by: ['createdAt'],
          where: { createdAt: { gte: thirtyDaysAgo } },
          _count: {
              createdAt: true,
          },
          orderBy: {
              createdAt: 'asc',
          },
      });

      const popularEvents = await prisma.event.findMany({
          where: { status: 'PUBLISHED' },
          orderBy: { ticketsSold: 'desc' },
          take: 5,
      });


      const userRoleDistribution = await prisma.user.groupBy({
          by: ['role'],
          _count: {
              role: true,
          },
      });

      res.json({ 
          totalUsers, 
          totalEvents, 
          totalBookings, 
          totalRevenue, 
          userSignupsLast30Days: userSignupsLast30Days.map(d => ({ date: d.createdAt.toISOString().split('T')[0], count: d._count.createdAt })),
          bookingsLast30Days: bookingsLast30Days.map(d => ({ date: d.createdAt.toISOString().split('T')[0], count: d._count.createdAt })),
          popularEvents,
          userRoleDistribution: userRoleDistribution.reduce((acc, item) => {
              acc[item.role] = item._count.role;
              return acc;
          }, {}),
      });

  }));

  app.get('/api/admin/events/:id/analytics', verifyFirebaseToken, getUser, isAdmin, asyncHandler(async (req, res) => {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
          return res.status(400).json({ error: 'Invalid event ID.' });
      }

      const totalBookings = await prisma.booking.count({ where: { eventId } });
      const totalWaitlist = await prisma.waitlistEntry.count({ where: { eventId } });
      const event = await prisma.event.findUnique({ where: { id: eventId }, select: { hypeCount: true } });

      res.json({ totalBookings, totalWaitlist, hypeCount: event?.hypeCount || 0 });
  }));

  app.get('/api/admin/users', verifyFirebaseToken, getUser, isAdmin, asyncHandler(async (req, res) => {
      const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
      res.json(users);
  }));

  app.put('/api/admin/users/:id/role', verifyFirebaseToken, getUser, isAdmin, asyncHandler(async (req, res) => {
      const { id } = req.params;
      const { role } = req.body;

      const userToUpdate = await prisma.user.findUnique({ where: { id } });
      if (userToUpdate && userToUpdate.firebaseUid === req.user.firebaseUid) {
          return res.status(400).json({ error: "Admins cannot change their own role." });
      }
      if (!['USER', 'ORGANIZER', 'ADMIN'].includes(role)) {
          return res.status(400).json({ error: 'Invalid role specified.' });
      }

      const updatedUser = await prisma.user.update({ where: { id }, data: { role } });
      res.json(updatedUser);
  }));

  app.get('/api/admin/events', verifyFirebaseToken, getUser, isAdmin, asyncHandler(async (req, res) => {
      const events = await prisma.event.findMany({ orderBy: { createdAt: 'desc' } });
      res.json(events);
  }));

  app.get('/api/admin/approvals', verifyFirebaseToken, getUser, isAdmin, asyncHandler(async (req, res) => {
      const pendingEvents = await prisma.event.findMany({
          where: { status: 'PENDING_APPROVAL' },
          include: { organizer: { select: { email: true } } }
      });
      res.json(pendingEvents);
  }));

  app.post('/api/admin/events/:id/approve', verifyFirebaseToken, getUser, isAdmin, asyncHandler(async (req, res) => {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
          return res.status(400).json({ error: 'Invalid event ID.' });
      }
      const updatedEvent = await prisma.event.update({
          where: { id: eventId },
          data: { status: 'PUBLISHED' }
      });
      res.json(updatedEvent);
  }));

  app.post('/api/admin/events/:id/reject', verifyFirebaseToken, getUser, isAdmin, asyncHandler(async (req, res) => {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
          return res.status(400).json({ error:'Invalid event ID.' });
      }
      const updatedEvent = await prisma.event.update({
          where: { id: eventId },
          data: { status: 'REJECTED' }
      });
      res.json(updatedEvent);
  }));

  app.post('/api/admin/events', verifyFirebaseToken, getUser, isAdmin, asyncHandler(async (req, res) => {
      const { name, date, location, price, description, organizerName, imageUrl, isFeatured, tags, capacity } = req.body;
      if (!name || !date || !location || !description || !capacity) {
          return res.status(400).json({ error: "Missing required fields." });
      }
      const parsedPrice = parseFloat(price);
      const parsedCapacity = parseInt(capacity);
      if (isNaN(parsedPrice) || isNaN(parsedCapacity)) {
          return res.status(400).json({ error: "Invalid price or capacity." });
      }

      const newEvent = await prisma.event.create({
          data: {
              name,
              date: new Date(date),
              location,
              price: parsedPrice,
              description,
              organizerName: organizerName || 'Evently',
              imageUrl,
              isFeatured: isFeatured === true,
              tags,
              capacity: parsedCapacity,
              status: 'PUBLISHED'
          }
      });
      res.status(201).json(newEvent);
  }));

  app.put('/api/admin/events/:id', verifyFirebaseToken, getUser, isAdmin, asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
          return res.status(400).json({ error: 'Invalid event ID.' });
      }

      const { name, date, location, price, description, organizerName, imageUrl, isFeatured, tags, capacity, status } = req.body;
      if (!name || !date || !location || !description || !capacity || !status) {
          return res.status(400).json({ error: "Missing required fields." });
      }
      const parsedPrice = parseFloat(price);
      const parsedCapacity = parseInt(capacity);
      if (isNaN(parsedPrice) || isNaN(parsedCapacity)) {
          return res.status(400).json({ error: "Invalid price or capacity." });
      }

      const updatedEvent = await prisma.event.update({
          where: { id },
          data: {
              name,
              date: new Date(date),
              location,
              price: parsedPrice,
              description,
              organizerName,
              imageUrl,
              isFeatured: isFeatured === true,
              tags,
              capacity: parsedCapacity,
              status
          }
      });
      res.json(updatedEvent);
  }));

  app.delete('/api/admin/events/:id', verifyFirebaseToken, getUser, isAdmin, asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
          return res.status(400).json({ error: 'Invalid event ID.' });
      }

      await prisma.$transaction([
          prisma.booking.deleteMany({ where: { eventId: id } }),
          prisma.waitlistEntry.deleteMany({ where: { eventId: id } }),
          prisma.eventChangeRequest.deleteMany({ where: { eventId: id } }),
          prisma.userHype.deleteMany({ where: { eventId: id } }),
          prisma.watchlist.deleteMany({ where: { eventId: id } }),
          prisma.event.delete({ where: { id } }),
      ]);
      res.status(204).send();
  }));

  app.get('/api/admin/organizer-requests', verifyFirebaseToken, getUser, isAdmin, asyncHandler(async (req, res) => {
      const requests = await prisma.organizerRequest.findMany({
          where: { status: 'PENDING' },
          include: { user: { select: { email: true } } },
          orderBy: { createdAt: 'asc' }
      });
      res.json(requests);
  }));

  app.post('/api/admin/organizer-requests/:id/approve', verifyFirebaseToken, getUser, isAdmin, asyncHandler(async (req, res) => {
      const { id } = req.params;
      const request = await prisma.organizerRequest.findUnique({ where: { id } });
      if (!request) {
          return res.status(404).json({ error: 'Request not found.' });
      }

      await prisma.$transaction([
          prisma.user.update({
              where: { id: request.userId },
              data: { role: 'ORGANIZER', organizationName: request.requestedOrgName }
          }),
          prisma.organizerRequest.update({
              where: { id },
              data: { status: 'APPROVED' }
          })
      ]);
      res.status(200).json({ message: 'Request approved successfully.' });
  }));

  app.post('/api/admin/organizer-requests/:id/reject', verifyFirebaseToken, getUser, isAdmin, asyncHandler(async (req, res) => {
      const { id } = req.params;
      await prisma.organizerRequest.update({
          where: { id },
          data: { status: 'REJECTED' }
      });
      res.status(200).json({ message: 'Request rejected successfully.' });
  }));


  // --- CALENDAR API Endpoints ---
  app.get('/api/calendar/events', verifyFirebaseToken, getUser, asyncHandler(async (req, res) => {
      let events = [];

      if (req.user.role === 'ADMIN') {
          events = await prisma.event.findMany();
      } else if (req.user.role === 'ORGANIZER') {
          events = await prisma.event.findMany({
              where: {
                  organizerId: req.user.id,
              }
          });
      } else { // Regular USER
          const bookings = await prisma.booking.findMany({
              where: {
                  userId: req.user.id,
              },
              include: { event: true }
          });
          events = bookings.map(b => b.event);
      }
      res.json(events);
  }));

  app.post('/api/calendar/events', verifyFirebaseToken, getUser, isOrganizer, asyncHandler(async (req, res) => {
      const { title, date, location, description, price, capacity, tags, isAllDay, startTime, endTime } = req.body;
      
      const newEvent = await prisma.event.create({
          data: {
              name: title,
              date: new Date(date),
              location,
              description,
              price: parseFloat(price),
              capacity: parseInt(capacity),
              tags: tags.join(','),
              isAllDay,
              startTime: startTime ? new Date(startTime) : null,
              endTime: endTime ? new Date(endTime) : null,
              status: req.user.role === 'ADMIN' ? 'PUBLISHED' : 'DRAFT',
              organizerId: req.user.id,
              organizerName: req.user.organizationName || 'Evently',
          }
      });
      res.status(201).json(newEvent);
  }));

  app.put('/api/calendar/events/:id', verifyFirebaseToken, getUser, isOrganizer, asyncHandler(async (req, res) => {
      const eventId = parseInt(req.params.id);
      const { title, date, location, description, price, capacity, tags, isAllDay, startTime, endTime, status } = req.body;

      const event = await prisma.event.findUnique({ where: { id: eventId } });

      if (!event) {
          return res.status(404).json({ error: 'Event not found' });
      }

      if (req.user.role !== 'ADMIN' && event.organizerId !== req.user.id) {
          return res.status(403).json({ error: 'Forbidden' });
      }

      const updatedEvent = await prisma.event.update({
          where: { id: eventId },
          data: {
              name: title,
              date: new Date(date),
              location,
              description,
              price: parseFloat(price),
              capacity: parseInt(capacity),
              tags: tags.join(','),
              isAllDay,
              startTime: startTime ? new Date(startTime) : null,
              endTime: endTime ? new Date(endTime) : null,
              status: req.user.role === 'ADMIN' ? status : event.status,
          }
      });

      res.json(updatedEvent);
  }));

  app.delete('/api/calendar/events/:id', verifyFirebaseToken, getUser, isOrganizer, asyncHandler(async (req, res) => {
      const eventId = parseInt(req.params.id);

      const event = await prisma.event.findUnique({ where: { id: eventId } });

      if (!event) {
          return res.status(404).json({ error: 'Event not found' });
      }

      if (req.user.role !== 'ADMIN' && event.organizerId !== req.user.id) {
          return res.status(403).json({ error: 'Forbidden' });
      }

      await prisma.event.delete({ where: { id: eventId } });

      res.status(204).send();
  }));


  // --- ERROR HANDLING MIDDLEWARE ---
  app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Something went wrong!' });
  });

  return app;
};

export { createApp };
