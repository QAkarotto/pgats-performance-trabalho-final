const { expect } = require('chai');
const sinon = require('sinon');

const rentalService = require('../../../src/services/rentalService');
const { createRental } = require('../../../src/controllers/rentalController');

describe('rentalController.createRental', () => {
  afterEach(() => sinon.restore());

  it('should return 401 when no user in request', async () => {
    const req = { body: { carId: 10 } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await createRental(req, res);
    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWithMatch({ error: 'Unauthorized' })).to.be.true;
  });

  it('should create a rental when authorized', async () => {
    const rentalMock = { id: 1, userId: 1, carId: 10, status: 'ACTIVE' };
    const rentStub = sinon.stub(rentalService, 'rentCar').resolves(rentalMock);
    const req = { user: { id: 1 }, body: { carId: 10 } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await createRental(req, res);
    expect(rentStub.calledOnceWithMatch({ userId: 1, carId: 10 })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(rentalMock)).to.be.true;
  });

  it('should return 400 when service throws', async () => {
    sinon.stub(rentalService, 'rentCar').rejects(new Error('Car required'));
    const req = { user: { id: 1 }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    await createRental(req, res);
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ error: 'Car required' })).to.be.true;
  });
});

