const express = require('express');
const {
  createProject,
  getProjects,
  addProjectMember,
  getProjectById,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.route('/').get(protect, getProjects).post(protect, authorize('Admin'), createProject);
router.route('/:id').get(protect, getProjectById);
router.route('/:id/members').post(protect, authorize('Admin'), addProjectMember);

module.exports = router;
