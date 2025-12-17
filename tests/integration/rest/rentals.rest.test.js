const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../src/app');

describe('REST /api/rentals', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Reset services
    const userService = require('../../../src/services/userService');
    const rentalService = require('../../../src/services/rentalService');
    userService.users = [];
    rentalService.rentals = [];

    // Create user and get auth token
    const userRes = await request(app)
      .post('/api/users')
      .send({
        email: 'rentaltest@example.com',
        password: 'password123',
        name: 'Rental Test User'
      });
    
    userId = userRes.body.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rentaltest@example.com',
        password: 'password123'
      });
    
    authToken = loginRes.body.token;
  });

  describe('POST /api/rentals', () => {
    it('should reject unauthenticated rental', async () => {
      const res = await request(app)
        .post('/api/rentals')
        .send({ carId: 'CAR123' });
      
      expect(res.status).to.equal(401);
    });

    it('should create rental when authenticated', async () => {
      const res = await request(app)
        .post('/api/rentals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ carId: 'CAR123' });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('userId', userId);
      expect(res.body).to.have.property('carId', 'CAR123');
      expect(res.body).to.have.property('status', 'ACTIVE');
    });
  });

  describe('GET /api/rentals', () => {
    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/rentals');
      expect(res.status).to.equal(401);
    });

    it('should return empty array when user has no rentals', async () => {
      const res = await request(app)
        .get('/api/rentals')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array').that.is.empty;
    });

    it('should return user rentals', async () => {
      // Create a rental first
      await request(app)
        .post('/api/rentals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ carId: 'CAR456' });

      const res = await request(app)
        .get('/api/rentals')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array').with.length(1);
      expect(res.body[0]).to.have.property('carId', 'CAR456');
      expect(res.body[0]).to.have.property('userId', userId);
    });
  });

  describe('DELETE /api/rentals/:id', () => {
    let rentalId;

    beforeEach(async () => {
      // Create a rental to delete
      const rentalRes = await request(app)
        .post('/api/rentals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ carId: 'CAR789' });
      
      rentalId = rentalRes.body.id;
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).delete(`/api/rentals/${rentalId}`);
      expect(res.status).to.equal(401);
    });

    it('should cancel rental successfully', async () => {
      const res = await request(app)
        .delete(`/api/rentals/${rentalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('id', rentalId);
      expect(res.body).to.have.property('status', 'CANCELLED');
    });

    it('should return 404 for non-existent rental', async () => {
      const res = await request(app)
        .delete('/api/rentals/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('error', 'Rental not found');
    });

    it('should return 400 for invalid rental ID', async () => {
      const res = await request(app)
        .delete('/api/rentals/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Invalid rental ID');
    });
  });
});

