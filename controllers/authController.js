const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role) => {
  return jwt.sign({ userId: id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role: requestedRole } = req.body;
  const normalizedRole = requestedRole?.toLowerCase();
  const allowedRoles = ['admin', 'member'];
  const role = allowedRoles.includes(normalizedRole) ? normalizedRole : 'member';

  console.log('[Auth] Signup request role:', requestedRole, 'normalizedRole:', role);

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  if (user) {
    const token = generateToken(user._id, user.role);
    console.log('[Auth] Signup response role:', user.role, 'tokenPayload:', { userId: user._id, role: user.role });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = generateToken(user._id, user.role);
    console.log('[Auth] Login response role:', user.role, 'tokenPayload:', { userId: user._id, role: user.role });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user.role) {
    res.status(500);
    throw new Error('Authenticated user missing role');
  }
  console.log('[Auth] /auth/me response role:', req.user.role, 'userId:', req.user._id);
  res.json(req.user);
});

module.exports = { registerUser, loginUser, getCurrentUser };
