const pool = require('../db');

// @desc    Create a new task (Admin Only)
// @route   POST /api/tasks
const createTask = async (req, res, next) => {
    try {
        const { title, description, assigned_to, deadline } = req.body;

        if (!title || !assigned_to || !deadline) {
            const error = new Error('Title, assigned_to, and deadline are required');
            error.statusCode = 400;
            error.code = 'VALIDATION_ERROR';
            return next(error);
        }

        // status defaults to 'assigned' as per the PDF contract
        const result = await pool.query(
            `INSERT INTO tasks (title, description, created_by, assigned_to, deadline, status) 
             VALUES ($1, $2, $3, $4, $5, 'assigned') RETURNING *`,
            [title, description, req.user.id, assigned_to, deadline]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

// @desc    Get all tasks (Role-Aware)
// @route   GET /api/tasks
const getTasks = async (req, res, next) => {
    try {
        let queryText = `
            SELECT tasks.*, users.name AS assigned_to_name 
            FROM tasks 
            LEFT JOIN users ON tasks.assigned_to = users.id
        `;
        let values = [];

        // If trainee, only show their assigned tasks
        if (req.user.role === 'trainee') {
            queryText += ` WHERE tasks.assigned_to = $1`;
            values.push(req.user.id);
        }

        queryText += ` ORDER BY tasks.id DESC`;

        const result = await pool.query(queryText, values);
        res.status(200).json(result.rows);
    } catch (err) {
        next(err);
    }
};

// @desc    Update a task (Admin Only)
// @route   PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, assigned_to, deadline } = req.body;

        const result = await pool.query(
            `UPDATE tasks 
             SET title = COALESCE($1, title), 
                 description = COALESCE($2, description), 
                 assigned_to = COALESCE($3, assigned_to), 
                 deadline = COALESCE($4, deadline) 
             WHERE id = $5 RETURNING *`,
            [title, description, assigned_to, deadline, id]
        );

        if (result.rows.length === 0) {
            const error = new Error('Task not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            return next(error);
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a task (Admin Only)
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            const error = new Error('Task not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            return next(error);
        }

        // 204 No Content for successful deletion
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };