const User = require('../models/User');

class UserService {
  constructor() {
    this.users = [];
  }

  async createUser({ email, password, name }) {
    // Verificar se email já existe
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const userData = {
      id: this.users.length + 1,
      email,
      password,
      name
    };
    
    const user = await User.create(userData);
    user.id = userData.id; // Atribuir o ID após criação
    this.users.push(user);
    return user.toJSON();
  }

  async findByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  async findById(id) {
    const user = this.users.find(u => u.id === id);
    return user ? user.toJSON() : null;
  }

  async authenticateUser(email, password) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    return user.toJSON();
  }
}

module.exports = new UserService();
