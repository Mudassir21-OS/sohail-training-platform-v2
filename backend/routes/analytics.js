const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/analytics/summary
router.get('/summary', authenticate, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                COALESCE((SELECT ROUND(AVG(score)::numeric, 2) FROM scores), 0) AS avg_score,
                COALESCE((
                    SELECT ROUND(COUNT(DISTINCT s.task_id)::numeric / NULLIF(COUNT(DISTINCT t.id)::numeric, 0), 4)
                    FROM tasks t LEFT JOIN submissions s ON s.task_id = t.id
                ), 0) AS submission_rate,
                COALESCE((
                    SELECT ROUND(COUNT(CASE WHEN s.submitted_at <= t.deadline THEN 1 END)::numeric / NULLIF(COUNT(s.id)::numeric, 0), 4)
                    FROM tasks t JOIN submissions s ON s.task_id = t.id
                ), 0) AS on_time_rate,
                (SELECT COUNT(*) FROM team_tasks) AS active_team_tasks,
                (SELECT COUNT(*) FROM users WHERE role = 'trainee') AS total_trainees,
                (
                    SELECT COUNT(*) FROM scores sc
                    JOIN submissions s ON sc.submission_id = s.id
                    WHERE s.submitted_at >= NOW() - INTERVAL '7 days'
                ) AS graded_this_week
        `);

        const row = result.rows[0];
        res.json({
            avgScore: Number(row.avg_score),
            submissionRate: Number(row.submission_rate),
            onTimeRate: Number(row.on_time_rate),
            activeTeamTasks: Number(row.active_team_tasks),
            totalTrainees: Number(row.total_trainees),
            gradedThisWeek: Number(row.graded_this_week)
        });
    } catch (err) {
        console.error("Analytics Summary Error:", err.message);
        res.status(500).json({ error: "Server error fetching analytics summary" });
    }
});

// GET /api/analytics/submission-trend?days=30
router.get('/submission-trend', authenticate, requireAdmin, async (req, res) => {
    try {
        const days = Number(req.query.days) || 30;
        const result = await pool.query(`
            SELECT
                date_trunc('day', s.submitted_at)::date AS date,
                COUNT(*) AS submissions,
                COALESCE(ROUND(AVG(sc.score)::numeric, 2), 0) AS avg_score
            FROM submissions s
            LEFT JOIN scores sc ON sc.submission_id = s.id
            WHERE s.submitted_at >= NOW() - ($1 || ' days')::interval
            GROUP BY date_trunc('day', s.submitted_at)
            ORDER BY date ASC
        `, [days]);

        const data = result.rows.map(r => ({
            date: r.date.toISOString().split('T')[0],
            submissions: Number(r.submissions),
            avgScore: Number(r.avg_score)
        }));

        res.json(data);
    } catch (err) {
        console.error("Analytics Trend Error:", err.message);
        res.status(500).json({ error: "Server error fetching submission trend" });
    }
});

// GET /api/analytics/trainees
router.get('/trainees', authenticate, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.id,
                u.name,
                COALESCE(ROUND(AVG(sc.score)::numeric, 2), 0) AS avg_score,
                COUNT(DISTINCT CASE WHEN sc.score IS NOT NULL THEN t.id END) AS tasks_completed,
                COUNT(DISTINCT t.id) AS tasks_assigned,
                COALESCE(ROUND(COUNT(DISTINCT s.id)::numeric / NULLIF(COUNT(DISTINCT t.id)::numeric, 0), 4), 0) AS submission_rate,
                COUNT(DISTINCT CASE WHEN s.submitted_at <= t.deadline THEN t.id END) AS on_time_count,
                COUNT(DISTINCT CASE WHEN s.submitted_at > t.deadline THEN t.id END) AS late_count
            FROM users u
            LEFT JOIN tasks t ON t.assigned_to = u.id
            LEFT JOIN submissions s ON s.task_id = t.id AND s.trainee_id = u.id
            LEFT JOIN scores sc ON sc.submission_id = s.id
            WHERE u.role = 'trainee'
            GROUP BY u.id, u.name
            ORDER BY avg_score DESC
        `);

        const data = result.rows.map(r => ({
            id: r.id,
            name: r.name,
            avgScore: Number(r.avg_score),
            tasksCompleted: Number(r.tasks_completed),
            tasksAssigned: Number(r.tasks_assigned),
            submissionRate: Number(r.submission_rate),
            onTimeCount: Number(r.on_time_count),
            lateCount: Number(r.late_count)
        }));

        res.json(data);
    } catch (err) {
        console.error("Analytics Trainees Error:", err.message);
        res.status(500).json({ error: "Server error fetching trainee performance" });
    }
});

// GET /api/analytics/export - CSV export (kept from earlier merge, uses existing views)
router.get('/export', authenticate, requireAdmin, async (req, res) => {
    try {
        const exportData = await pool.query('SELECT * FROM vw_individual_task_analytics');

        if (exportData.rows.length === 0) {
            return res.status(404).json({ success: false, error: "No data available to export" });
        }

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(exportData.rows);

        res.header('Content-Type', 'text/csv');
        res.attachment('sohail-analytics-report.csv');
        return res.send(csv);

    } catch (err) {
        console.error("Export Error:", err.message);
        res.status(500).json({ success: false, error: "Server error generating CSV report" });
    }
});

module.exports = router;