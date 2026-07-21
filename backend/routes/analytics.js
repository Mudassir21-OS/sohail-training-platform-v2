<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv'); 
const pool = require('../db'); 

// GET /api/analytics - Computes and serves metrics for the UI
router.get('/', async (req, res) => {
    try {
        // 1. Compute Average Score per Trainee
        const avgScores = await pool.query(`
            SELECT trainee_name, ROUND(AVG(score), 2) as average_score 
            FROM vw_individual_task_analytics 
            WHERE score IS NOT NULL 
            GROUP BY trainee_name
        `);

        // 2. Compute Submission Rates & Deadline Counts
        const submissionStats = await pool.query(`
            SELECT 
                COUNT(*) as total_assigned,
                SUM(submitted_flag) as total_submitted,
                SUM(CASE WHEN submission_status = 'on_time' THEN 1 ELSE 0 END) as on_time_count,
                SUM(CASE WHEN submission_status = 'late' THEN 1 ELSE 0 END) as late_count,
                SUM(CASE WHEN submission_status = 'not_submitted' THEN 1 ELSE 0 END) as not_submitted_count
            FROM vw_individual_task_analytics
        `);

        // 3. Compute Team Task Performance
        const teamStats = await pool.query(`
            SELECT 
                team_task_title, 
                ROUND(AVG(score), 2) as team_avg_score,
                SUM(submitted_flag) as team_total_submitted
            FROM vw_team_task_analytics
            GROUP BY team_task_title
        `);
        
        // Bundle all the computed metrics into one clean JSON payload for the frontend
        res.json({
            success: true,
            data: {
                traineeScores: avgScores.rows,
                overallSubmissions: submissionStats.rows[0],
                teamPerformance: teamStats.rows
            }
        });
    } catch (err) {
        console.error("Analytics Error:", err.message);
        res.status(500).json({ success: false, error: "Server error fetching analytics data" });
    }
});

// GET /api/analytics/export - Generates the downloadable CSV report
router.get('/export', async (req, res) => {
    try {
        // Fetch the raw dataset to export (using the individual tasks view for detailed rows)
        const exportData = await pool.query('SELECT * FROM vw_individual_task_analytics');

        if (exportData.rows.length === 0) {
            return res.status(404).json({ success: false, error: "No data available to export" });
        }

        // Convert the JSON SQL output into a structured CSV string
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(exportData.rows);

        // Set headers so the browser triggers a file download
        res.header('Content-Type', 'text/csv');
        res.attachment('sohail-analytics-report.csv'); 
        return res.send(csv);

    } catch (err) {
        console.error("Export Error:", err.message);
        res.status(500).json({ success: false, error: "Server error generating CSV report" });
    }
});

module.exports = router;
=======
const express = require("express");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
// All routes here are already behind `authenticate` (mounted in index.js)
// requireAdmin added to every route — only admins can access analytics

// ── 1. Overview stats ─────────────────────────────────────────────────────────
// GET /api/analytics/overview
// Returns: total trainees, total tasks, total submissions, avg score, submission rate
router.get("/overview", requireAdmin, async (req, res, next) => {
  try {
    const db = req.app.get("db");
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'trainee')                    AS total_trainees,
        (SELECT COUNT(*) FROM tasks)                                            AS total_tasks,
        (SELECT COUNT(*) FROM submissions)                                      AS total_submissions,
        (SELECT COUNT(*) FROM tasks WHERE status = 'graded')                   AS graded_tasks,
        (SELECT COUNT(*) FROM tasks WHERE status = 'submitted')                AS pending_grading,
        (SELECT ROUND(AVG(score)::numeric, 2) FROM scores)                     AS avg_score,
        (SELECT ROUND(
          COUNT(DISTINCT s.task_id)::numeric /
          NULLIF(COUNT(DISTINCT t.id)::numeric, 0) * 100, 2
          )
          FROM tasks t
          LEFT JOIN submissions s ON s.task_id = t.id
        )                                                                       AS submission_rate_pct
    `);
    return res.status(200).json(result.rows[0]);
  } catch (err) { next(err); }
});

// ── 2. Per-trainee performance ────────────────────────────────────────────────
// GET /api/analytics/trainees
// Returns: each trainee's name, tasks assigned, submitted, avg score
router.get("/trainees", requireAdmin, async (req, res, next) => {
  try {
    const db = req.app.get("db");
    const result = await db.query(`
      SELECT
        u.id                                                          AS trainee_id,
        u.name                                                        AS trainee_name,
        u.email,
        COUNT(DISTINCT t.id)                                          AS tasks_assigned,
        COUNT(DISTINCT s.id)                                          AS tasks_submitted,
        ROUND(AVG(sc.score)::numeric, 2)                             AS avg_score,
        COUNT(DISTINCT CASE WHEN t.status = 'graded' THEN t.id END)  AS tasks_graded
      FROM users u
      LEFT JOIN tasks t   ON t.assigned_to = u.id
      LEFT JOIN submissions s ON s.task_id = t.id AND s.trainee_id = u.id
      LEFT JOIN scores sc  ON sc.submission_id = s.id
      WHERE u.role = 'trainee'
      GROUP BY u.id, u.name, u.email
      ORDER BY avg_score DESC NULLS LAST
    `);
    return res.status(200).json(result.rows);
  } catch (err) { next(err); }
});

// ── 3. Per-task stats ─────────────────────────────────────────────────────────
// GET /api/analytics/tasks
// Returns: each task's title, assignee, status, score, on-time or late
router.get("/tasks", requireAdmin, async (req, res, next) => {
  try {
    const db = req.app.get("db");
    const result = await db.query(`
      SELECT
        t.id                                                        AS task_id,
        t.title,
        t.deadline,
        t.status,
        u.name                                                      AS assigned_to_name,
        sc.score,
        sc.feedback,
        s.submitted_at,
        CASE
          WHEN s.submitted_at IS NULL THEN 'not_submitted'
          WHEN s.submitted_at <= t.deadline THEN 'on_time'
          ELSE 'late'
        END                                                         AS submission_timing
      FROM tasks t
      LEFT JOIN users u       ON u.id = t.assigned_to
      LEFT JOIN submissions s ON s.task_id = t.id
      LEFT JOIN scores sc     ON sc.submission_id = s.id
      ORDER BY t.created_at DESC
    `);
    return res.status(200).json(result.rows);
  } catch (err) { next(err); }
});

// ── 4. Submission timing breakdown ────────────────────────────────────────────
// GET /api/analytics/timing
// Returns: count of on_time, late, not_submitted across all tasks
router.get("/timing", requireAdmin, async (req, res, next) => {
  try {
    const db = req.app.get("db");
    const result = await db.query(`
      SELECT
        COUNT(CASE WHEN s.submitted_at <= t.deadline THEN 1 END)  AS on_time,
        COUNT(CASE WHEN s.submitted_at > t.deadline  THEN 1 END)  AS late,
        COUNT(CASE WHEN s.submitted_at IS NULL        THEN 1 END)  AS not_submitted
      FROM tasks t
      LEFT JOIN submissions s ON s.task_id = t.id
    `);
    return res.status(200).json(result.rows[0]);
  } catch (err) { next(err); }
});

// ── 5. Score distribution ─────────────────────────────────────────────────────
// GET /api/analytics/scores
// Returns: score buckets (0-49, 50-69, 70-84, 85-100) and count in each
router.get("/scores", requireAdmin, async (req, res, next) => {
  try {
    const db = req.app.get("db");
    const result = await db.query(`
      SELECT
        COUNT(CASE WHEN score BETWEEN 0  AND 49  THEN 1 END) AS failing,
        COUNT(CASE WHEN score BETWEEN 50 AND 69  THEN 1 END) AS passing,
        COUNT(CASE WHEN score BETWEEN 70 AND 84  THEN 1 END) AS good,
        COUNT(CASE WHEN score BETWEEN 85 AND 100 THEN 1 END) AS excellent
      FROM scores
    `);
    return res.status(200).json(result.rows[0]);
  } catch (err) { next(err); }
});

// ── 6. CSV export ─────────────────────────────────────────────────────────────
// GET /api/analytics/export
// Returns a CSV file of the full per-trainee performance report
router.get("/export", requireAdmin, async (req, res, next) => {
  try {
    const db = req.app.get("db");
    const result = await db.query(`
      SELECT
        u.name                                AS trainee_name,
        u.email,
        COUNT(DISTINCT t.id)                  AS tasks_assigned,
        COUNT(DISTINCT s.id)                  AS tasks_submitted,
        ROUND(AVG(sc.score)::numeric, 2)      AS avg_score,
        COUNT(DISTINCT CASE WHEN s.submitted_at <= t.deadline THEN t.id END) AS on_time,
        COUNT(DISTINCT CASE WHEN s.submitted_at > t.deadline  THEN t.id END) AS late
      FROM users u
      LEFT JOIN tasks t       ON t.assigned_to = u.id
      LEFT JOIN submissions s ON s.task_id = t.id AND s.trainee_id = u.id
      LEFT JOIN scores sc     ON sc.submission_id = s.id
      WHERE u.role = 'trainee'
      GROUP BY u.id, u.name, u.email
      ORDER BY avg_score DESC NULLS LAST
    `);

    const rows = result.rows;
    const header = "Trainee Name,Email,Tasks Assigned,Tasks Submitted,Avg Score,On Time,Late";
    const lines = rows.map(r =>
      `"${r.trainee_name}","${r.email}",${r.tasks_assigned},${r.tasks_submitted},${r.avg_score ?? "N/A"},${r.on_time},${r.late}`
    );
    const csv = [header, ...lines].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=analytics_report.csv");
    return res.status(200).send(csv);
  } catch (err) { next(err); }
});

module.exports = router;
>>>>>>> origin/mayaz-security-integration
