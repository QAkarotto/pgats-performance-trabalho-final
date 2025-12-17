const bcrypt = require('bcryptjs');

class User {
  constructor({ id, email, password, name, createdAt }) {
    this.id = id;
    this.email = email;
    this.password = password; // já hasheada
    this.name = name || '';
    this.createdAt = createdAt || new Date().toISOString();
  }

  static validateData({ email, password, name }) {
    const errors = [];
    
    if (!email) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push('Email must be valid');
    }
    
    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    return errors;
  }

  static async create({ email, password, name }) {
    const errors = User.validateData({ email, password, name });
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return new User({
      email,
      password: hashedPassword,
      name
    });
  }

  async validatePassword(plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;
