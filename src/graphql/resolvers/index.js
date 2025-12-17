const jwt = require('jsonwebtoken');
const rentalService = require('../../services/rentalService');
const userService = require('../../services/userService');

module.exports = {
  Query: {
    _health: () => 'ok'
  },
  Mutation: {
    login: async (_, { email, password }) => {
      if (!email || !password) throw new Error('Email and password required');
      try {
        const user = await userService.authenticateUser(email, password);
        const token = jwt.sign(
          { id: user.id, email: user.email }, 
          process.env.JWT_SECRET || 'dev-secret', 
          { expiresIn: '1h' }
        );
        return { token };
      } catch (err) {
        throw new Error('Invalid credentials');
      }
    },
    rentCar: async (_, { carId, startDate, endDate }, ctx) => {
      if (!ctx.user) throw new Error('Unauthorized');
      const rental = await rentalService.rentCar({ userId: ctx.user.id, carId, startDate, endDate });
      return rental;
    }
  }
};

