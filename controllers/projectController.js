const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const User = require('../models/User');

const createProject = asyncHandler(async (req, res) => {
  const { name, memberIds } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Project name is required');
  }

  const project = await Project.create({
    name,
    members: memberIds || [],
    createdBy: req.user._id,
  });

  res.status(201).json(project);
});

const getProjects = asyncHandler(async (req, res) => {
  let projects;
  if (req.user.role === 'admin') {
    projects = await Project.find().populate('members', 'name email role').populate('createdBy', 'name email');
  } else {
    projects = await Project.find({ members: req.user._id }).populate('members', 'name email role').populate('createdBy', 'name email');
  }
  res.json(projects);
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('members', 'name email role').populate('createdBy', 'name email');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (req.user.role !== 'admin' && !project.members.some((member) => member._id.equals(req.user._id))) {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json(project);
});

const assignProjectMember = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.body;
  const targetProjectId = req.params.id || projectId;
  const project = await Project.findById(targetProjectId);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const user = await User.findById(memberId);
  if (!user) {
    res.status(404);
    throw new Error('Member not found');
  }

  if (project.members.includes(user._id)) {
    res.status(400);
    throw new Error('Member already on project');
  }

  project.members.push(user._id);
  await project.save();
  await project.populate('members', 'name email role');
  res.json(project);
});

module.exports = { createProject, getProjects, assignProjectMember, getProjectById };
