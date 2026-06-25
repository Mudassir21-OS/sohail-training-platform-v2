const express = require('express');
const router = express.Router();
const { createSubmission, getSubmissions, gradeSubmission } = require('../controllers/submissionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// The route for a Trainee to submit work
router.post('/tasks/:taskId/submissions', protect, createSubmission);

// The route to view submissions (Role-aware: Admin sees all, Trainee sees own)
router.get('/submissions', protect, getSubmissions);

// The route for an Admin to grade a specific submission
router.put('/submissions/:id/grade', protect, adminOnly, gradeSubmission);

module.exports = router;