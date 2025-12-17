const { expect } = require('chai');
const Rental = require('../../../src/models/Rental');

describe('Rental Model', () => {
  describe('constructor', () => {
    it('should create a rental with all properties', () => {
      const rentalData = {
        id: 1,
        userId: 123,
        carId: 'CAR456',
        startDate: '2023-12-25T10:00:00Z',
        endDate: '2023-12-30T10:00:00Z',
        status: 'ACTIVE'
      };

      const rental = new Rental(rentalData);

      expect(rental.id).to.equal(1);
      expect(rental.userId).to.equal(123);
      expect(rental.carId).to.equal('CAR456');
      expect(rental.startDate).to.equal('2023-12-25T10:00:00Z');
      expect(rental.endDate).to.equal('2023-12-30T10:00:00Z');
      expect(rental.status).to.equal('ACTIVE');
    });

    it('should set default values when not provided', () => {
      const rental = new Rental({
        id: 1,
        userId: 123,
        carId: 'CAR789'
      });

      expect(rental.status).to.equal('ACTIVE');
      expect(rental.endDate).to.be.null;
      expect(rental.startDate).to.be.a('string');
    });
  });

  describe('validateData', () => {
    it('should return no errors for valid data', () => {
      const validData = {
        userId: 123,
        carId: 'CAR456'
      };

      const errors = Rental.validateData(validData);
      expect(errors).to.be.an('array').that.is.empty;
    });

    it('should return error when userId is missing', () => {
      const invalidData = {
        carId: 'CAR456'
      };

      const errors = Rental.validateData(invalidData);
      expect(errors).to.include('User ID is required');
    });

    it('should return error when carId is missing', () => {
      const invalidData = {
        userId: 123
      };

      const errors = Rental.validateData(invalidData);
      expect(errors).to.include('Car ID is required');
    });

    it('should return error when userId is not a positive integer', () => {
      const invalidData = {
        userId: -1,
        carId: 'CAR456'
      };

      const errors = Rental.validateData(invalidData);
      expect(errors).to.include('User ID must be a positive integer');
    });

    it('should return error when carId is not a string or number', () => {
      const invalidData = {
        userId: 123,
        carId: true
      };

      const errors = Rental.validateData(invalidData);
      expect(errors).to.include('Car ID must be a string or number');
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const invalidData = {
        userId: 0,
        carId: null
      };

      const errors = Rental.validateData(invalidData);
      expect(errors).to.have.length.greaterThan(1);
    });
  });

  describe('create', () => {
    it('should create a rental with valid data', () => {
      const validData = {
        id: 1,
        userId: 123,
        carId: 'CAR456'
      };

      const rental = Rental.create(validData);
      expect(rental).to.be.instanceOf(Rental);
      expect(rental.userId).to.equal(123);
      expect(rental.carId).to.equal('CAR456');
    });

    it('should throw error with invalid data', () => {
      const invalidData = {
        carId: 'CAR456'
        // missing userId
      };

      expect(() => {
        Rental.create(invalidData);
      }).to.throw('Validation failed: User ID is required');
    });
  });

  describe('isActive', () => {
    it('should return true for active rental', () => {
      const rental = new Rental({
        id: 1,
        userId: 123,
        carId: 'CAR456',
        status: 'ACTIVE'
      });

      expect(rental.isActive()).to.be.true;
    });

    it('should return false for completed rental', () => {
      const rental = new Rental({
        id: 1,
        userId: 123,
        carId: 'CAR456',
        status: 'COMPLETED'
      });

      expect(rental.isActive()).to.be.false;
    });
  });

  describe('complete', () => {
    it('should change status to COMPLETED', () => {
      const rental = new Rental({
        id: 1,
        userId: 123,
        carId: 'CAR456',
        status: 'ACTIVE'
      });

      rental.complete();
      expect(rental.status).to.equal('COMPLETED');
    });

    it('should set endDate if not already set', () => {
      const rental = new Rental({
        id: 1,
        userId: 123,
        carId: 'CAR456',
        endDate: null
      });

      rental.complete();
      expect(rental.endDate).to.be.a('string');
    });

    it('should not change endDate if already set', () => {
      const existingEndDate = '2023-12-30T10:00:00Z';
      const rental = new Rental({
        id: 1,
        userId: 123,
        carId: 'CAR456',
        endDate: existingEndDate
      });

      rental.complete();
      expect(rental.endDate).to.equal(existingEndDate);
    });
  });

  describe('cancel', () => {
    it('should change status to CANCELLED', () => {
      const rental = new Rental({
        id: 1,
        userId: 123,
        carId: 'CAR456',
        status: 'ACTIVE'
      });

      rental.cancel();
      expect(rental.status).to.equal('CANCELLED');
    });
  });

  describe('getDuration', () => {
    it('should return null when endDate is not set', () => {
      const rental = new Rental({
        id: 1,
        userId: 123,
        carId: 'CAR456',
        startDate: '2023-12-25T10:00:00Z',
        endDate: null
      });

      expect(rental.getDuration()).to.be.null;
    });

    it('should calculate duration in days', () => {
      const rental = new Rental({
        id: 1,
        userId: 123,
        carId: 'CAR456',
        startDate: '2023-12-25T10:00:00Z',
        endDate: '2023-12-30T10:00:00Z'
      });

      const duration = rental.getDuration();
      expect(duration).to.equal(5);
    });
  });

  describe('toJSON', () => {
    it('should return plain object with all properties', () => {
      const rental = new Rental({
        id: 1,
        userId: 123,
        carId: 'CAR456',
        startDate: '2023-12-25T10:00:00Z',
        endDate: '2023-12-30T10:00:00Z',
        status: 'ACTIVE'
      });

      const json = rental.toJSON();
      
      expect(json).to.deep.equal({
        id: 1,
        userId: 123,
        carId: 'CAR456',
        startDate: '2023-12-25T10:00:00Z',
        endDate: '2023-12-30T10:00:00Z',
        status: 'ACTIVE'
      });
    });
  });
});
