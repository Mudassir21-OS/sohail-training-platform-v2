const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;
const TOKEN_TTL = "7d";

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: { message: "name, email, password, and role are required", code: "VALIDATION_ERROR" },
      });
    }
    if (!["admin", "trainee"].includes(role)) {
      return res.status(400).json({
        error: { message: 'role must be "admin" or "trainee"', code: "VALIDATION_ERROR" },
      });
    }

    const db = req.app.get("db");

    const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: { message: "Email already in use", code: "VALIDATION_ERROR" },
      });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, password_hash, role]
    );

    const user = result.rows[0];
    const token = signToken(user);

    return res.status(201).json({ user: publicUser(user), token });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: { message: "email and password are required", code: "VALIDATION_ERROR" },
      });
    }

    const db = req.app.get("db");

    const result = await db.query(
      "SELECT id, name, email, role, password_hash FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    const passwordMatch = user
      ? await bcrypt.compare(password, user.password_hash)
      : await bcrypt.compare(password, "$2b$10$invalidhashpadding000000000000000");

    if (!user || !passwordMatch) {
      return res.status(401).json({
        error: { message: "Invalid email or password", code: "UNAUTHORIZED" },
      });
    }

    const token = signToken(user);
    return res.status(200).json({ user: publicUser(user), token });
  } catch (err) {
    next(err);
  }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const db = req.app.get("db");
    const result = await db.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: { message: "User not found", code: "NOT_FOUND" },
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
