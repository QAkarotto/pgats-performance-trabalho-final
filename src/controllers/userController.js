const userService = require('../services/userService');

async function createUser(req, res) {
  try {
    const { email, password, name } = req.body || {};
    const user = await userService.createUser({ email, password, name });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { createUser };
