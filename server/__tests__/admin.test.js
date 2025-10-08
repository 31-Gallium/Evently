import request from 'supertest';
import { jest } from '@jest/globals';

const mockAdminUser = {
  id: 'test-admin-id',
  firebaseUid: 'test-admin-uid',
  email: 'admin@example.com',
  role: 'ADMIN',
};

const mockRegularUser = {
  id: 'test-user-id',
  firebaseUid: 'test-user-uid',
  email: 'user@example.com',
  role: 'USER',
};

jest.unstable_mockModule('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  auth: () => ({
    verifyIdToken: jest.fn().mockImplementation(async (token) => {
      if (token === 'admin-token') return { uid: mockAdminUser.firebaseUid };
      if (token === 'user-token') return { uid: mockRegularUser.firebaseUid };
      throw new Error('Invalid token');
    }),
  }),
}));

jest.unstable_mockModule('@prisma/client', () => {
    const mockPrismaClient = {
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        event: {
            findMany: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mockPrismaClient),
    };
});

describe('Admin API', () => {
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
    prismaMock.user.findUnique.mockImplementation(({ where }) => {
        if (where.firebaseUid === mockAdminUser.firebaseUid) return Promise.resolve(mockAdminUser);
        if (where.firebaseUid === mockRegularUser.firebaseUid) return Promise.resolve(mockRegularUser);
        return Promise.resolve(null);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should return 403 if user is not an admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer user-token');
      expect(response.statusCode).toBe(403);
    });

    it('should return 200 and user data if user is an admin', async () => {
        prismaMock.user.findMany.mockResolvedValue([mockAdminUser, mockRegularUser]);

        const response = await request(app)
            .get('/api/admin/users')
            .set('Authorization', 'Bearer admin-token');

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(2);
    });
  });

  describe('GET /api/admin/approvals', () => {
    it('should return 403 if user is not an admin', async () => {
        const response = await request(app)
          .get('/api/admin/approvals')
          .set('Authorization', 'Bearer user-token');
        expect(response.statusCode).toBe(403);
      });

    it('should return 200 and pending events if user is an admin', async () => {
        prismaMock.event.findMany.mockResolvedValue([{ id: 1, status: 'PENDING_APPROVAL'}]);

        const response = await request(app)
            .get('/api/admin/approvals')
            .set('Authorization', 'Bearer admin-token');

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(1);
        expect(response.body[0].status).toBe('PENDING_APPROVAL');
    });
  });
});