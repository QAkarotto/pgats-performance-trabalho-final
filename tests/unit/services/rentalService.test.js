const { expect } = require('chai');
const rentalService = require('../../../src/services/rentalService');

describe('RentalService', () => {
  beforeEach(() => {
    // Reset rentals array before each test
    rentalService.rentals = [];
  });

  describe('rentCar', () => {
    it('should create a rental with required fields', async () => {
      const rentalData = {
        userId: 1,
        carId: 'CAR123',
        startDate: '2023-12-25T10:00:00Z',
        endDate: '2023-12-30T10:00:00Z'
      };

      const rental = await rentalService.rentCar(rentalData);

      expect(rental).to.have.property('id', 1);
      expect(rental).to.have.property('userId', 1);
      expect(rental).to.have.property('carId', 'CAR123');
      expect(rental).to.have.property('startDate', '2023-12-25T10:00:00Z');
      expect(rental).to.have.property('endDate', '2023-12-30T10:00:00Z');
      expect(rental).to.have.property('status', 'ACTIVE');
    });

    it('should create rental with default startDate when not provided', async () => {
      const rentalData = {
        userId: 1,
        carId: 'CAR456'
      };

      const rental = await rentalService.rentCar(rentalData);

      expect(rental).to.have.property('startDate');
      expect(rental.startDate).to.be.a('string');
      expect(rental).to.have.property('endDate', null);
      expect(rental).to.have.property('status', 'ACTIVE');
    });

    it('should throw error when userId is missing', async () => {
      const rentalData = {
        carId: 'CAR789'
      };

      try {
        await rentalService.rentCar(rentalData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('User required');
      }
    });

    it('should throw error when carId is missing', async () => {
      const rentalData = {
        userId: 1
      };

      try {
        await rentalService.rentCar(rentalData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Car required');
      }
    });

    it('should increment rental IDs for multiple rentals', async () => {
      const rental1 = await rentalService.rentCar({ userId: 1, carId: 'CAR1' });
      const rental2 = await rentalService.rentCar({ userId: 2, carId: 'CAR2' });
      const rental3 = await rentalService.rentCar({ userId: 3, carId: 'CAR3' });

      expect(rental1.id).to.equal(1);
      expect(rental2.id).to.equal(2);
      expect(rental3.id).to.equal(3);
      expect(rentalService.rentals).to.have.length(3);
    });

    it('should handle null or undefined values gracefully', async () => {
      const rentalData = {
        userId: 1,
        carId: 'CAR999',
        startDate: null,
        endDate: undefined
      };

      const rental = await rentalService.rentCar(rentalData);

      expect(rental).to.have.property('startDate', null);
      expect(rental).to.have.property('endDate', null);
    });
  });

  describe('getRentalById', () => {
    it('should return rental when found', async () => {
      const createdRental = await rentalService.rentCar({ userId: 1, carId: 'CAR123' });
      const foundRental = await rentalService.getRentalById(createdRental.id);

      expect(foundRental).to.deep.equal(createdRental);
    });

    it('should return null when rental not found', async () => {
      const rental = await rentalService.getRentalById(999);
      expect(rental).to.be.null;
    });
  });

  describe('getRentalsByUserId', () => {
    it('should return rentals for specific user', async () => {
      await rentalService.rentCar({ userId: 1, carId: 'CAR1' });
      await rentalService.rentCar({ userId: 2, carId: 'CAR2' });
      await rentalService.rentCar({ userId: 1, carId: 'CAR3' });

      const userRentals = await rentalService.getRentalsByUserId(1);
      expect(userRentals).to.have.length(2);
      expect(userRentals.every(r => r.userId === 1)).to.be.true;
    });

    it('should return empty array when user has no rentals', async () => {
      const userRentals = await rentalService.getRentalsByUserId(999);
      expect(userRentals).to.be.an('array').that.is.empty;
    });
  });

  describe('completeRental', () => {
    it('should complete existing rental', async () => {
      const rental = await rentalService.rentCar({ userId: 1, carId: 'CAR123' });
      const completed = await rentalService.completeRental(rental.id);

      expect(completed.status).to.equal('COMPLETED');
      expect(completed.endDate).to.be.a('string');
    });

    it('should throw error when rental not found', async () => {
      try {
        await rentalService.completeRental(999);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Rental not found');
      }
    });
  });

  describe('cancelRental', () => {
    it('should cancel existing rental', async () => {
      const rental = await rentalService.rentCar({ userId: 1, carId: 'CAR123' });
      const cancelled = await rentalService.cancelRental(rental.id);

      expect(cancelled.status).to.equal('CANCELLED');
    });

    it('should throw error when rental not found', async () => {
      try {
        await rentalService.cancelRental(999);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Rental not found');
      }
    });
  });
});
