const express = require('express');
const {
  createProject,
  getProjects,
  assignProjectMember,
  getProjectById,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.route('/').get(protect, getProjects).post(protect, authorize('admin'), createProject);
router.route('/:id').get(protect, getProjectById);
router.route('/assign').post(protect, authorize('admin'), assignProjectMember);
router.route('/:id/members').post(protect, authorize('admin'), assignProjectMember);

module.exports = router;
