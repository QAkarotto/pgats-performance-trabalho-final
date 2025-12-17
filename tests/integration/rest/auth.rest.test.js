const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../src/app');

describe('REST /api/auth', () => {
  beforeEach(async () => {
    // Reset services
    const userService = require('../../../src/services/userService');
    const rentalService = require('../../../src/services/rentalService');
    userService.users = [];
    rentalService.rentals = [];

    // Create a test user before each test
    await request(app)
      .post('/api/users')
      .send({
        email: 'authtest@example.com',
        password: 'password123',
        name: 'Auth Test User'
      });
  });

  describe('POST /login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'authtest@example.com',
          password: 'password123'
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body.token).to.be.a('string');
      expect(res.body.token.length).to.be.greaterThan(50);
    });

    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Email and password required');
    });

    it('should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'authtest@example.com'
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Email and password required');
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error', 'Invalid credentials');
    });

    it('should return 401 for incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'authtest@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error', 'Invalid credentials');
    });
  });
});
