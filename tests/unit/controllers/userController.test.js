const { expect } = require('chai');
const sinon = require('sinon');

const userService = require('../../../src/services/userService');
const { createUser } = require('../../../src/controllers/userController');

describe('userController.createUser', () => {
  afterEach(() => sinon.restore());

  it('should create user successfully', async () => {
    const userMock = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      createdAt: '2023-01-01T00:00:00.000Z'
    };

    const createStub = sinon.stub(userService, 'createUser').resolves(userMock);
    
    const req = {
      body: {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };

    await createUser(req, res);

    expect(createStub.calledOnceWithMatch({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(userMock)).to.be.true;
  });

  it('should return 400 when service throws validation error', async () => {
    sinon.stub(userService, 'createUser').rejects(new Error('Validation failed: Email is required'));
    
    const req = { body: { password: 'password123' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };

    await createUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({
      error: 'Validation failed: Email is required'
    })).to.be.true;
  });

  it('should return 400 when email already exists', async () => {
    sinon.stub(userService, 'createUser').rejects(new Error('Email already exists'));
    
    const req = {
      body: {
        email: 'existing@example.com',
        password: 'password123'
      }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };

    await createUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({
      error: 'Email already exists'
    })).to.be.true;
  });

  it('should handle empty request body', async () => {
    sinon.stub(userService, 'createUser').rejects(new Error('Validation failed: Email is required'));
    
    const req = { body: null };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };

    await createUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({
      error: 'Validation failed: Email is required'
    })).to.be.true;
  });
});
