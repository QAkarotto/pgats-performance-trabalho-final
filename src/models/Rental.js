class Rental {
  constructor({ id, userId, carId, startDate, endDate, status = 'ACTIVE' }) {
    this.id = id;
    this.userId = userId;
    this.carId = carId;
    this.startDate = startDate !== undefined ? startDate : new Date().toISOString();
    this.endDate = endDate !== undefined ? endDate : null;
    this.status = status;
  }

  static validateData({ userId, carId }) {
    const errors = [];
    
    if (!userId) {
      errors.push('User ID is required');
    }
    
    if (!carId) {
      errors.push('Car ID is required');
    }
    
    if (typeof userId !== 'undefined' && (!Number.isInteger(userId) || userId <= 0)) {
      errors.push('User ID must be a positive integer');
    }
    
    if (typeof carId !== 'undefined' && typeof carId !== 'string' && typeof carId !== 'number') {
      errors.push('Car ID must be a string or number');
    }
    
    return errors;
  }

  static create(data) {
    const errors = Rental.validateData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    
    return new Rental(data);
  }

  isActive() {
    return this.status === 'ACTIVE';
  }

  complete() {
    this.status = 'COMPLETED';
    if (!this.endDate) {
      this.endDate = new Date().toISOString();
    }
    return this;
  }

  cancel() {
    this.status = 'CANCELLED';
    return this;
  }

  getDuration() {
    if (!this.endDate) {
      return null;
    }
    
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      carId: this.carId,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status
    };
  }
}

module.exports = Rental;
