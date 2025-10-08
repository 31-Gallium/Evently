import request from 'supertest';
import { jest } from '@jest/globals';

const mockUser = {
  id: 'test-user-id',
  firebaseUid: 'test-uid',
  email: 'test@example.com',
  role: 'USER',
};

jest.unstable_mockModule('firebase-admin', () => ({
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
    auth: () => ({
      verifyIdToken: jest.fn().mockResolvedValue({ uid: mockUser.firebaseUid }),
    }),
}));

jest.unstable_mockModule('@prisma/client', () => {
    const mockPrismaClient = {
        user: {
            findUnique: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mockPrismaClient),
    };
});

describe('User API', () => {
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
            if (where.firebaseUid === mockUser.firebaseUid) {
              return Promise.resolve(mockUser);
            }
            return Promise.resolve(null);
        });
    });

  describe('GET /api/users/me', () => {
    it('should return a 401 status code if no token is provided', async () => {
      const response = await request(app).get('/api/users/me');
      expect(response.statusCode).toBe(401);
    });

    it('should return a 200 status code and user data if a valid token is provided', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer test-token');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        email: mockUser.email,
        role: mockUser.role,
        createdAt: undefined,
        organizationName: undefined,
        organizerRequestStatus: undefined,
      });
    });

    it('should return a 401 status code if the user is not found in the database', async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        const response = await request(app)
            .get('/api/users/me')
            .set('Authorization', 'Bearer non-existent-token');

        expect(response.statusCode).toBe(401);
    });
  });
});
