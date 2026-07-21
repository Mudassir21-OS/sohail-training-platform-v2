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