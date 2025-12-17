const { expect } = require('chai');
const userService = require('../../../src/services/userService');

describe('UserService', () => {
  beforeEach(() => {
    // Reset users array before each test
    userService.users = [];
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const user = await userService.createUser(userData);

      expect(user).to.have.property('id', 1);
      expect(user).to.have.property('email', 'test@example.com');
      expect(user).to.have.property('name', 'Test User');
      expect(user).to.have.property('createdAt');
      expect(user).to.not.have.property('password');
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      await userService.createUser(userData);

      try {
        await userService.createUser(userData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Email already exists');
      }
    });

    it('should increment user IDs', async () => {
      const user1 = await userService.createUser({
        email: 'user1@example.com',
        password: 'password123'
      });

      const user2 = await userService.createUser({
        email: 'user2@example.com',
        password: 'password123'
      });

      expect(user1.id).to.equal(1);
      expect(user2.id).to.equal(2);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      await userService.createUser({
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await userService.findByEmail('test@example.com');
      expect(user).to.exist;
      expect(user.email).to.equal('test@example.com');
    });

    it('should return undefined when user not found', async () => {
      const user = await userService.findByEmail('nonexistent@example.com');
      expect(user).to.be.undefined;
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const createdUser = await userService.createUser({
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await userService.findById(createdUser.id);
      expect(user).to.deep.equal(createdUser);
    });

    it('should return null when user not found', async () => {
      const user = await userService.findById(999);
      expect(user).to.be.null;
    });
  });

  describe('authenticateUser', () => {
    beforeEach(async () => {
      await userService.createUser({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    });

    it('should authenticate user with correct credentials', async () => {
      const user = await userService.authenticateUser('test@example.com', 'password123');
      
      expect(user).to.have.property('email', 'test@example.com');
      expect(user).to.have.property('name', 'Test User');
      expect(user).to.not.have.property('password');
    });

    it('should throw error for non-existent user', async () => {
      try {
        await userService.authenticateUser('nonexistent@example.com', 'password123');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    it('should throw error for invalid password', async () => {
      try {
        await userService.authenticateUser('test@example.com', 'wrongpassword');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Invalid password');
      }
    });
  });
});
