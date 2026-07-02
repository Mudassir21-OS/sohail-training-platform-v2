const pool = require('../db');

// Create a new trainee account
const createTrainee = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const newTrainee = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, password, 'trainee']
    );

    res.status(201).json(newTrainee.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
        return res.status(400).json({ error: 'Email already exists' });
    }
    next(error);
  }
};

// Retrieve a list of all trainees
const getTrainees = async (req, res, next) => {
  try {
    const trainees = await pool.query(
      "SELECT id, name, email, role FROM users WHERE role = 'trainee' ORDER BY created_at DESC"
    );

    res.status(200).json(trainees.rows);
  } catch (error) {
    next(error);
  }
};

// Update an existing trainee's details
const updateTrainee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const updatedTrainee = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 AND role = $4 RETURNING id, name, email, role',
      [name, email, id, 'trainee']
    );

    if (updatedTrainee.rows.length === 0) {
      return res.status(404).json({ error: 'Trainee not found' });
    }

    res.status(200).json(updatedTrainee.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
        return res.status(400).json({ error: 'Email already exists' });
    }
    next(error);
  }
};

// Delete a trainee account
const deleteTrainee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedTrainee = await pool.query(
      'DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id',
      [id, 'trainee']
    );

    if (deletedTrainee.rows.length === 0) {
      return res.status(404).json({ error: 'Trainee not found' });
    }

    res.status(200).json({ message: 'Trainee deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrainee,
  getTrainees,
  updateTrainee,
  deleteTrainee,
};