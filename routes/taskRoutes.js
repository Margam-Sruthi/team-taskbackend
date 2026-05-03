const express = require('express');
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskById,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.route('/').get(protect, getTasks).post(protect, authorize('admin'), createTask);
router.route('/:id').get(protect, getTaskById).put(protect, updateTask).delete(protect, authorize('admin'), deleteTask);

module.exports = router;
