const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('name email role');
  res.json(users);
});

module.exports = { getUsers };
