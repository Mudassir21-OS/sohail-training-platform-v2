const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const register = async (req, res, next) => {
    try {
        // Mapped to the API PDF: using 'name' instead of 'full_name'
        const { name, email, password, role } = req.body;

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, password_hash, role || 'trainee']
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ user, token });
    } catch (err) {
        if (err.code === '23505') { // PostgreSQL unique violation
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            err.message = 'Email already exists';
        }
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            error.code = 'UNAUTHORIZED';
            return next(error);
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            error.code = 'UNAUTHORIZED';
            return next(error);
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login };