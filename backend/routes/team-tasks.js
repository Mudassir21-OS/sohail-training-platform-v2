const express = require('express');
const router = express.Router();
const pool = require('../db'); // Adjust this path to your db.js
const { authenticate, requireAdmin } = require('../middleware/auth'); 

// POST /api/team-tasks
// Create a team task and assign multiple members (Transaction)
router.post('/', authenticate, requireAdmin, async (req, res) => { 
  const { title, description, deadline, members } = req.body;
  const created_by = req.user.id; 

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const taskInsertQuery = `
      INSERT INTO team_tasks (title, description, created_by, deadline) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, title;
    `;
    const taskResult = await client.query(taskInsertQuery, [title, description, created_by, deadline]);
    const newTask = taskResult.rows[0];

    const memberInsertQuery = `
      INSERT INTO task_members (task_id, user_id, part) 
      VALUES ($1, $2, $3);
    `;
    
    for (const member of members) {
      await client.query(memberInsertQuery, [newTask.id, member.user_id, member.part]);
    }

    await client.query('COMMIT');

    res.status(201).json({ 
      message: 'Team task and member parts created successfully', 
      task: newTask 
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating team task:', error);
    res.status(500).json({ error: 'Failed to create team task.' });
  } finally {
    client.release();
  }
});

// PUT /api/team-tasks/:taskId/members/:userId/submit
// Trainees use this to submit their specific part
router.put('/:taskId/members/:userId/submit', authenticate, async (req, res) => {
  const { taskId, userId } = req.params;
  const { submission_link } = req.body;

  if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to submit for this user.' });
  }

  try {
    const updateQuery = `
      UPDATE task_members 
      SET submission_link = $1, submitted_at = NOW() 
      WHERE task_id = $2 AND user_id = $3
      RETURNING *;
    `;
    const result = await pool.query(updateQuery, [submission_link, taskId, userId]);

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task assignment not found.' });
    }

    res.json({ message: 'Part submitted successfully', part: result.rows[0] });
  } catch (error) {
    console.error('Error submitting part:', error);
    res.status(500).json({ error: 'Failed to submit part.' });
  }
});

// PUT /api/team-tasks/:taskId/members/:userId/grade
// Admins use this to grade a specific trainee's part
router.put('/:taskId/members/:userId/grade', authenticate, requireAdmin, async (req, res) => { 
  const { taskId, userId } = req.params;
  const { score, feedback } = req.body;

  try {
    const updateQuery = `
      UPDATE task_members 
      SET score = $1, feedback = $2, graded_at = NOW() 
      WHERE task_id = $3 AND user_id = $4
      RETURNING *;
    `;
    const result = await pool.query(updateQuery, [score, feedback, taskId, userId]);

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task assignment not found.' });
    }

    res.json({ message: 'Part graded successfully', part: result.rows[0] });
  } catch (error) {
    console.error('Error grading part:', error);
    res.status(500).json({ error: 'Failed to grade part.' });
  }
});

// GET /api/team-tasks
// List team tasks (Now completely formatted with Emna's nested members array!)
router.get('/', authenticate, async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.role === 'admin') {
      // Admins pull all tasks and ALL members
      query = `
        SELECT 
          tt.id, tt.title, tt.description, tt.deadline, tt.status, tt.created_at,
          tm.user_id, tm.part, tm.submission_link, tm.score, tm.feedback, tm.submitted_at, tm.graded_at,
          u.name
        FROM team_tasks tt
        LEFT JOIN task_members tm ON tt.id = tm.task_id
        LEFT JOIN users u ON tm.user_id = u.id
        ORDER BY tt.created_at DESC;
      `;
    } else {
      // Trainees pull only their tasks, and the members array will contain just their assignment
      query = `
        SELECT 
          tt.id, tt.title, tt.description, tt.deadline, tt.status, tt.created_at,
          tm.user_id, tm.part, tm.submission_link, tm.score, tm.feedback, tm.submitted_at, tm.graded_at,
          u.name
        FROM team_tasks tt
        JOIN task_members tm ON tt.id = tm.task_id
        JOIN users u ON tm.user_id = u.id
        WHERE tm.user_id = $1
        ORDER BY tt.created_at DESC;
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);

    // Emna's grouping logic applied exactly as requested
    const grouped = {};
    result.rows.forEach(row => {
      if (!grouped[row.id]) {
        grouped[row.id] = {
          id: row.id,
          title: row.title,
          description: row.description,
          deadline: row.deadline,
          status: row.status,
          created_at: row.created_at,
          members: []
        };
      }
      if (row.user_id) {
        grouped[row.id].members.push({
          user_id: row.user_id,
          name: row.name,
          part: row.part,
          submission_link: row.submission_link,
          score: row.score,
          feedback: row.feedback,
          submitted_at: row.submitted_at,
          graded_at: row.graded_at
        });
      }
    });

    return res.json(Object.values(grouped));

  } catch (error) {
    console.error('Error fetching team tasks:', error);
    res.status(500).json({ error: 'Failed to fetch team tasks.' });
  }
});

// GET /api/team-tasks/:id
// Get full team task view 
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  
  try {
    const query = `
      SELECT 
        t.id AS task_id, t.title, t.description, t.deadline, t.status, t.created_at,
        creator.name AS created_by_name,
        tm.user_id, tm.part, tm.submission_link, tm.score, tm.feedback, tm.submitted_at, tm.graded_at,
        member.name AS member_name, member.email AS member_email
      FROM team_tasks t
      JOIN users creator ON t.created_by = creator.id
      LEFT JOIN task_members tm ON t.id = tm.task_id
      LEFT JOIN users member ON tm.user_id = member.id
      WHERE t.id = $1;
    `;
    
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Team task not found.' });
    }

    const taskDetails = {
        id: result.rows[0].task_id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        deadline: result.rows[0].deadline,
        status: result.rows[0].status,
        created_at: result.rows[0].created_at,
        created_by_name: result.rows[0].created_by_name,
        members: result.rows.map(row => ({
            user_id: row.user_id,
            name: row.member_name,
            email: row.member_email,
            part: row.part,
            submission_link: row.submission_link,
            score: row.score,
            feedback: row.feedback,
            submitted_at: row.submitted_at,
            graded_at: row.graded_at
        }))
    };

    res.json(taskDetails);
  } catch (error) {
    console.error('Error fetching team task details:', error);
    res.status(500).json({ error: 'Failed to fetch team task details.' });
  }
});

module.exports = router;