const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../src/app');

describe('REST /api/users', () => {
  beforeEach(() => {
    // Reset services
    const userService = require('../../../src/services/userService');
    const rentalService = require('../../../src/services/rentalService');
    userService.users = [];
    rentalService.rentals = [];
  });
  it('should create user successfully', async () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User'
    };

    const res = await request(app)
      .post('/api/users')
      .send(userData);

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('email', userData.email);
    expect(res.body).to.have.property('name', userData.name);
    expect(res.body).to.have.property('createdAt');
    expect(res.body).to.not.have.property('password');
  });

  it('should return 400 for invalid email', async () => {
    const userData = {
      email: 'invalid-email',
      password: 'password123'
    };

    const res = await request(app)
      .post('/api/users')
      .send(userData);

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error');
    expect(res.body.error).to.include('Email must be valid');
  });

  it('should return 400 for short password', async () => {
    const userData = {
      email: 'test@example.com',
      password: '123'
    };

    const res = await request(app)
      .post('/api/users')
      .send(userData);

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error');
    expect(res.body.error).to.include('Password must be at least 6 characters');
  });

  it('should return 400 for duplicate email', async () => {
    const userData = {
      email: 'duplicate@example.com',
      password: 'password123'
    };

    // Create first user
    await request(app)
      .post('/api/users')
      .send(userData);

    // Try to create second user with same email
    const res = await request(app)
      .post('/api/users')
      .send(userData);

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Email already exists');
  });
});
