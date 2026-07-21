const express = require("express");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
// authenticate is applied at mount point in index.js
// requireAdmin added here — only admins can access any analytics route

// ── GET /api/analytics ────────────────────────────────────────────────────────
// Abdul's query using vw_individual_task_analytics view + Mayaz's auth guard
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const db = req.app.get("db");
    const result = await db.query(`SELECT * FROM vw_individual_task_analytics`);
    return res.status(200).json(result.rows);
  } catch (err) { next(err); }
});

// ── GET /api/analytics/export ─────────────────────────────────────────────────
// Abdul's export route + Mayaz's auth guard + CSV headers
router.get("/export", requireAdmin, async (req, res, next) => {
  try {
    const db = req.app.get("db");
    const result = await db.query(`SELECT * FROM vw_individual_task_analytics`);
    const rows = result.rows;

    if (rows.length === 0) {
      return res.status(200).send("No data available");
    }

    const header = Object.keys(rows[0]).join(",");
    const lines = rows.map(r =>
      Object.values(r).map(v => `"${v ?? ""}"`).join(",")
    );
    const csv = [header, ...lines].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=analytics_report.csv");
    return res.status(200).send(csv);
  } catch (err) { next(err); }
});

module.exports = router;
