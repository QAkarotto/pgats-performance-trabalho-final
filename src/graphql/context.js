const jwt = require('jsonwebtoken');

function buildContext({ req }) {
  let user = null;
  const header = req && req.headers ? req.headers.authorization || '' : '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    } catch (e) {
      user = null;
    }
  }
  return { user };
}

module.exports = { buildContext };

