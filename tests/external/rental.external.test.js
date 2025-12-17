const request = require('supertest');
const app = require('../../src/app');

describe('External: Complete car rental workflow', () => {
  beforeEach(() => {
    // Reset services
    const userService = require('../../src/services/userService');
    const rentalService = require('../../src/services/rentalService');
    userService.users = [];
    rentalService.rentals = [];
  });

  it('REST flow: create user, login, rent, list, cancel', async () => {
    // 1. Create user
    const userRes = await request(app)
      .post('/api/users')
      .send({
        email: 'external@example.com',
        password: 'password123',
        name: 'External Test User'
      });
    if (userRes.status !== 201) throw new Error(`Expected 201, got ${userRes.status}`);

    // 2. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'external@example.com',
        password: 'password123'
      });
    if (loginRes.status !== 200) throw new Error(`Expected 200, got ${loginRes.status}`);
    const token = loginRes.body.token;

    // 3. Create rental
    const rentRes = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send({ carId: 'EXTERNAL-CAR-123' });
    if (rentRes.status !== 201) throw new Error(`Expected 201, got ${rentRes.status}`);
    const rentalId = rentRes.body.id;

    // 4. List rentals
    const listRes = await request(app)
      .get('/api/rentals')
      .set('Authorization', `Bearer ${token}`);
    if (listRes.status !== 200) throw new Error(`Expected 200, got ${listRes.status}`);
    if (listRes.body.length !== 1) throw new Error('Expected 1 rental');

    // 5. Cancel rental
    const cancelRes = await request(app)
      .delete(`/api/rentals/${rentalId}`)
      .set('Authorization', `Bearer ${token}`);
    if (cancelRes.status !== 200) throw new Error(`Expected 200, got ${cancelRes.status}`);
    if (cancelRes.body.status !== 'CANCELLED') throw new Error('Expected CANCELLED status');
  });

  it('GraphQL flow: login then rent', async () => {
    // Create user first
    await request(app)
      .post('/api/users')
      .send({
        email: 'graphql@example.com',
        password: 'password123',
        name: 'GraphQL User'
      });

    const login = await request(app).post('/graphql').send({
      query: 'mutation($email:String!, $password:String!){ login(email:$email, password:$password){ token } }',
      variables: { email: 'graphql@example.com', password: 'password123' }
    });
    const token = login.body.data.login.token;
    const rent = await request(app).post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({ query: 'mutation($carId:ID!){ rentCar(carId:$carId){ id status } }', variables: { carId: 'GQL-CAR-202' } });
    const body = rent.body;
    if (!body.data || !body.data.rentCar) throw new Error('Expected rentCar data');
  });
});

