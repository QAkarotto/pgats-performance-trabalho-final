const request = require('supertest');
const app = require('../../../src/app');

const GQL_RENT = `mutation Rent($carId: ID!) { rentCar(carId: $carId) { id userId carId status } }`;
const GQL_LOGIN = `mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { token } }`;

describe('GraphQL rentCar', () => {
  beforeEach(() => {
    // Reset services
    const userService = require('../../../src/services/userService');
    const rentalService = require('../../../src/services/rentalService');
    userService.users = [];
    rentalService.rentals = [];
  });

  it('should reject unauthenticated mutation', async () => {
    const res = await request(app).post('/graphql').send({ query: GQL_RENT, variables: { carId: 3 } });
    // Apollo errors return 200 with errors array
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const body = typeof res.body === 'object' ? res.body : JSON.parse(res.text);
    if (!body.errors || !body.errors.length) throw new Error('Expected errors for unauthorized');
  });

  it('should allow rentCar when authenticated', async () => {
    // Create user first
    await request(app)
      .post('/api/users')
      .send({
        email: 'gqltest@example.com',
        password: 'password123',
        name: 'GraphQL Test User'
      });

    const login = await request(app).post('/graphql').send({ 
      query: GQL_LOGIN, 
      variables: { email: 'gqltest@example.com', password: 'password123' } 
    });
    const token = login.body.data.login.token;
    const res = await request(app).post('/graphql').set('Authorization', `Bearer ${token}`).send({ query: GQL_RENT, variables: { carId: 9 } });
    const body = typeof res.body === 'object' ? res.body : JSON.parse(res.text);
    if (!body.data || !body.data.rentCar) throw new Error('Expected rentCar data');
  });
});

