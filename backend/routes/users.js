const express = require('express')
const router = express.Router()
const pool = require('../db')

router.get('/', async (req, res) => {
  try {
    const role = req.query.role
    let result
    if (role) {
      result = await pool.query('SELECT id, name, email, role FROM users WHERE role = $1', [role])
    } else {
      result = await pool.query('SELECT id, name, email, role FROM users')
    }
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: { message: 'Server error', code: 'SERVER_ERROR' } })
  }
})

module.exports = router
