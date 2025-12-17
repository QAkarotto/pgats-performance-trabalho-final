const Rental = require('../models/Rental');

class RentalService {
  constructor() {
    this.rentals = [];
  }

  async rentCar({ userId, carId, startDate, endDate }) {
    if (!userId) throw new Error('User required');
    if (!carId) throw new Error('Car required');
    
    const rentalData = {
      id: this.rentals.length + 1,
      userId,
      carId,
      startDate,
      endDate
    };
    
    const rental = Rental.create(rentalData);
    this.rentals.push(rental);
    return rental.toJSON();
  }

  async getRentalById(id) {
    const rental = this.rentals.find(r => r.id === id);
    return rental ? rental.toJSON() : null;
  }

  async getRentalsByUserId(userId) {
    return this.rentals
      .filter(r => r.userId === userId)
      .map(r => r.toJSON());
  }

  async completeRental(id) {
    const rental = this.rentals.find(r => r.id === id);
    if (!rental) throw new Error('Rental not found');
    
    rental.complete();
    return rental.toJSON();
  }

  async cancelRental(id) {
    const rental = this.rentals.find(r => r.id === id);
    if (!rental) throw new Error('Rental not found');
    
    rental.cancel();
    return rental.toJSON();
  }
}

module.exports = new RentalService();

