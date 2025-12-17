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

async function getCurrentUser(req, res) {
  try {
    const userId = req.user.id;
    const user = await userService.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createUser, getCurrentUser };
