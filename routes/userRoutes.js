const express = require('express');
const { getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.get('/', protect, authorize('Admin'), getUsers);

module.exports = router;
