import request from 'supertest';
import { jest } from '@jest/globals';

jest.unstable_mockModule('firebase-admin', () => ({
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
    auth: () => ({
      verifyIdToken: jest.fn(),
    }),
}));

jest.unstable_mockModule('@prisma/client', () => {
    const mockPrismaClient = {
        event: {
            findMany: jest.fn().mockResolvedValue([]),
            findFirst: jest.fn().mockResolvedValue(null),
        },
    };
    return {
        PrismaClient: jest.fn(() => mockPrismaClient),
    };
});

describe('Events API', () => {
    let app;
    let prismaMock;

    beforeAll(async () => {
        const { PrismaClient } = await import('@prisma/client');
        prismaMock = new PrismaClient();

        const admin = await import('firebase-admin');
        const { createApp } = await import('../src/server.js');
        app = createApp(admin);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

  describe('GET /api/events', () => {
    it('should return a 200 status code and an array of events', async () => {
      prismaMock.event.findMany.mockResolvedValue([{ id: 1, name: 'Test Event'}]);
      const response = await request(app).get('/api/events');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/events/past', () => {
    it('should return a 200 status code and an array of past events', async () => {
        prismaMock.event.findMany.mockResolvedValue([{ id: 2, name: 'Past Event'}]);
        const response = await request(app).get('/api/events/past');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/events/trending', () => {
    it('should return a 200 status code and an array of trending events', async () => {
        prismaMock.event.findMany.mockResolvedValue([{ id: 3, name: 'Trending Event'}]);
        const response = await request(app).get('/api/events/trending');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return a 200 status code and an event object if the event exists', async () => {
        prismaMock.event.findFirst.mockResolvedValue({ id: 1, name: 'Found Event'});
        const response = await request(app).get('/api/events/1');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
    });

    it('should return a 404 status code if the event does not exist', async () => {
        prismaMock.event.findFirst.mockResolvedValue(null);
        const response = await request(app).get('/api/events/999999');
        expect(response.statusCode).toBe(404);
    });
  });
});
