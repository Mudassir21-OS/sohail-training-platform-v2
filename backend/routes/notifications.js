const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

// GET /api/notifications - Fetch user's notification feed
router.get('/', authenticate, async (req, res) => {
    try {
        // IMPORTANT: Swap '6' with your auth middleware variable (e.g., req.user.id) once authentication is wired up.
        const userId = req.user.id; 

        // Uses Mudassir's Query #2 structure, mapped to Emna's requested JSON shape
        const feedQuery = `
            SELECT 
                n.id, 
                n.type, 
                n.title, 
                n.message, 
                n.payload, 
                n.is_read, 
                n.created_at
            FROM notifications n
            WHERE n.recipient_id = $1
            ORDER BY n.created_at DESC
            LIMIT 20;
        `;
        const result = await pool.query(feedQuery, [userId]);
        
        res.json(result.rows);
    } catch (err) {
        console.error("Fetch Notifications Error:", err.message);
        res.status(500).json({ success: false, error: "Server error fetching notifications" });
    }
});

// PUT /api/notifications/:id/read - Mark a single notification as read
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        const notificationId = req.params.id;
        
        const updateQuery = `
            UPDATE notifications 
            SET is_read = TRUE, read_at = CURRENT_TIMESTAMP 
            WHERE id = $1 AND recipient_id = $2 
            RETURNING id, is_read;
        `;
        const result = await pool.query(updateQuery, [notificationId, req.user.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: "Notification not found" });
        }

        res.json({
            success: true,
            id: result.rows[0].id,
            is_read: result.rows[0].is_read
        });
    } catch (err) {
        console.error("Mark Read Error:", err.message);
        res.status(500).json({ success: false, error: "Server error marking notification as read" });
    }
});

module.exports = router;
