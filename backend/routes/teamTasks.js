const express = require("express");
const { requireAdmin, requireTrainee, requirePartOwnership } = require("../middleware/auth");

const router = express.Router();
// All routes here are already behind `authenticate` (mounted in index.js)

// ── Admin: create a team task with parts ──────────────────────────────────────
// POST /api/team-tasks
// Body: { title, description, deadline, parts: [{ trainee_id, part_description }] }
router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const { title, description, deadline, parts } = req.body;
    if (!title || !parts || !Array.isArray(parts) || parts.length === 0) {
      return res.status(400).json({
        error: { message: "title and at least one part are required", code: "VALIDATION_ERROR" }
      });
    }

    const db = req.app.get("db");

    // Insert the team task
    const taskResult = await db.query(
      `INSERT INTO team_tasks (title, description, created_by, deadline)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, req.user.id, deadline]
    );
    const teamTask = taskResult.rows[0];

    // Insert each part
    const partPromises = parts.map((p) =>
      db.query(
        `INSERT INTO team_task_parts (team_task_id, assigned_to, part_description, status)
         VALUES ($1, $2, $3, 'assigned') RETURNING *`,
        [teamTask.id, p.trainee_id, p.part_description]
      )
    );
    const partResults = await Promise.all(partPromises);
    const insertedParts = partResults.map((r) => r.rows[0]);

    return res.status(201).json({ ...teamTask, parts: insertedParts });
  } catch (err) { next(err); }
});

// ── Admin: get all team tasks (with all parts) ────────────────────────────────
// GET /api/team-tasks
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const db = req.app.get("db");
    const result = await db.query(`
      SELECT
        tt.*,
        json_agg(json_build_object(
          'part_id', ttp.id,
          'assigned_to', ttp.assigned_to,
          'assigned_to_name', u.name,
          'part_description', ttp.part_description,
          'status', ttp.status,
          'file_url', ttp.file_url,
          'submission_text', ttp.submission_text,
          'submitted_at', ttp.submitted_at
        ) ORDER BY ttp.id) AS parts
      FROM team_tasks tt
      LEFT JOIN team_task_parts ttp ON ttp.team_task_id = tt.id
      LEFT JOIN users u ON u.id = ttp.assigned_to
      GROUP BY tt.id
      ORDER BY tt.created_at DESC
    `);
    return res.status(200).json(result.rows);
  } catch (err) { next(err); }
});

// ── Trainee: get only their own parts ─────────────────────────────────────────
// GET /api/team-tasks/my-parts
router.get("/my-parts", requireTrainee, async (req, res, next) => {
  try {
    const db = req.app.get("db");
    const result = await db.query(`
      SELECT
        ttp.id AS part_id,
        ttp.part_description,
        ttp.status,
        ttp.submission_text,
        ttp.file_url,
        ttp.submitted_at,
        tt.id AS team_task_id,
        tt.title,
        tt.description,
        tt.deadline
      FROM team_task_parts ttp
      JOIN team_tasks tt ON tt.id = ttp.team_task_id
      WHERE ttp.assigned_to = $1
      ORDER BY tt.created_at DESC
    `, [req.user.id]);
    return res.status(200).json(result.rows);
  } catch (err) { next(err); }
});

// ── Trainee: submit their own part ────────────────────────────────────────────
// POST /api/team-tasks/parts/:partId/submit
router.post(
  "/parts/:partId/submit",
  requireTrainee,
  requirePartOwnership(async (req) => {
    const db = req.app.get("db");
    const r = await db.query("SELECT * FROM team_task_parts WHERE id = $1", [req.params.partId]);
    return r.rows[0] || null;
  }),
  async (req, res, next) => {
    try {
      const { submission_text, file_url } = req.body;
      if (!submission_text) {
        return res.status(400).json({ error: { message: "submission_text is required", code: "VALIDATION_ERROR" } });
      }
      const db = req.app.get("db");
      const result = await db.query(`
        UPDATE team_task_parts
        SET submission_text = $1, file_url = $2, status = 'submitted', submitted_at = NOW()
        WHERE id = $3 RETURNING *
      `, [submission_text, file_url || null, req.params.partId]);
      return res.status(200).json(result.rows[0]);
    } catch (err) { next(err); }
  }
);

// ── Admin: grade a part ───────────────────────────────────────────────────────
// PUT /api/team-tasks/parts/:partId/grade
router.put("/parts/:partId/grade", requireAdmin, async (req, res, next) => {
  try {
    const { score, feedback } = req.body;
    if (score === undefined || score === null) {
      return res.status(400).json({ error: { message: "score is required", code: "VALIDATION_ERROR" } });
    }
    const db = req.app.get("db");

    // Insert score into scores table
    const scoreResult = await db.query(`
      INSERT INTO scores (submission_id, graded_by, score, feedback)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (submission_id) DO UPDATE SET score = $3, feedback = $4, graded_at = NOW()
      RETURNING *
    `, [req.params.partId, req.user.id, score, feedback]);

    // Update part status to graded
    await db.query(
      "UPDATE team_task_parts SET status = 'graded' WHERE id = $1",
      [req.params.partId]
    );

    return res.status(200).json(scoreResult.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
