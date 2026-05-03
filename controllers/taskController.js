const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Project = require('../models/Project');

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, assignedTo, projectId, deadline } = req.body;

  if (!title || !assignedTo || !projectId || !deadline) {
    res.status(400);
    throw new Error('Title, assigned user, project, and deadline are required');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const task = await Task.create({
    title,
    description,
    status: status || 'todo',
    deadline,
    assignedTo,
    project: projectId,
    createdBy: req.user._id,
  });

  res.status(201).json(task);
});

const getTasks = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'member') {
    filter.assignedTo = req.user._id;
  }

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email')
    .populate('project', 'name');
  res.json(tasks);
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('project', 'name');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (req.user.role === 'member' && !task.assignedTo._id.equals(req.user._id)) {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (req.user.role === 'member' && !task.assignedTo.equals(req.user._id)) {
    res.status(403);
    throw new Error('Access denied');
  }

  const { title, description, status, deadline, assignedTo } = req.body;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (deadline !== undefined) task.deadline = deadline;
  if (req.user.role === 'admin' && assignedTo !== undefined) task.assignedTo = assignedTo;

  const updatedTask = await task.save();
  res.json(updatedTask);
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await task.deleteOne();
  res.json({ message: 'Task removed' });
});

module.exports = { createTask, getTasks, updateTask, deleteTask, getTaskById };
