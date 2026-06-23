const pool = require('../db');

// @desc    Trainee submits a task
// @route   POST /api/tasks/:taskId/submissions
const createSubmission = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { submission_text } = req.body;

        if (!submission_text) {
            const error = new Error('Submission text is required');
            error.statusCode = 400;
            error.code = 'VALIDATION_ERROR';
            return next(error);
        }

        // 1. Verify the task exists and is assigned to this trainee
        const taskCheck = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
        if (taskCheck.rows.length === 0) {
            const error = new Error('Task not found');
            error.statusCode = 404;
            return next(error);
        }
        if (taskCheck.rows[0].assigned_to !== req.user.id) {
            const error = new Error('You can only submit tasks assigned to you');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            return next(error);
        }

        // 2. Insert the submission
        const subResult = await pool.query(
            `INSERT INTO submissions (task_id, trainee_id, submission_text) 
             VALUES ($1, $2, $3) RETURNING *`,
            [taskId, req.user.id, submission_text]
        );

        // 3. Update the task status to 'submitted'
        await pool.query(`UPDATE tasks SET status = 'submitted' WHERE id = $1`, [taskId]);

        res.status(201).json(subResult.rows[0]);
    } catch (err) {
        next(err);
    }
};

// @desc    Get submissions (Role-Aware)
// @route   GET /api/submissions
const getSubmissions = async (req, res, next) => {
    try {
        let queryText = `
            SELECT 
                s.id, s.task_id, t.title AS task_title, s.trainee_id, u.name AS trainee_name, 
                s.submission_text, s.file_url, s.submitted_at, 
                sc.score, sc.feedback, sc.graded_by, sc.graded_at, t.status
            FROM submissions s
            JOIN tasks t ON s.task_id = t.id
            JOIN users u ON s.trainee_id = u.id
            LEFT JOIN scores sc ON s.id = sc.submission_id
        `;
        let values = [];

        // If trainee, only show their own submissions
        if (req.user.role === 'trainee') {
            queryText += ` WHERE s.trainee_id = $1`;
            values.push(req.user.id);
        }

        queryText += ` ORDER BY s.submitted_at DESC`;

        const result = await pool.query(queryText, values);
        res.status(200).json(result.rows);
    } catch (err) {
        next(err);
    }
};

// @desc    Admin grades a submission
// @route   PUT /api/submissions/:id/grade
const gradeSubmission = async (req, res, next) => {
    try {
        const { id } = req.params; // This is the submission ID
        const { score, feedback } = req.body;

        if (score === undefined) {
            const error = new Error('Score is required');
            error.statusCode = 400;
            return next(error);
        }

        // 1. Verify submission exists and get the task_id
        const subCheck = await pool.query('SELECT task_id FROM submissions WHERE id = $1', [id]);
        if (subCheck.rows.length === 0) {
            const error = new Error('Submission not found');
            error.statusCode = 404;
            return next(error);
        }
        const taskId = subCheck.rows[0].task_id;

        // 2. Insert the grade into the scores table
        const scoreResult = await pool.query(
            `INSERT INTO scores (submission_id, graded_by, score, feedback) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [id, req.user.id, score, feedback]
        );

        // 3. Update the task status to 'graded'
        await pool.query(`UPDATE tasks SET status = 'graded' WHERE id = $1`, [taskId]);

        res.status(200).json(scoreResult.rows[0]);
    } catch (err) {
        next(err);
    }
};

module.exports = { createSubmission, getSubmissions, gradeSubmission };