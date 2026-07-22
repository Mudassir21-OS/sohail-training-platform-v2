const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET env variable is not set");

// ── Core auth ─────────────────────────────────────────────────────────────────
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: { message: "No token provided", code: "UNAUTHORIZED" },
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    const message = err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ error: { message, code: "UNAUTHORIZED" } });
  }
}

// ── RBAC ──────────────────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: { message: "Not authenticated", code: "UNAUTHORIZED" } });
  if (req.user.role !== "admin") return res.status(403).json({ error: { message: "Admin access required", code: "FORBIDDEN" } });
  next();
}

function requireTrainee(req, res, next) {
  if (!req.user) return res.status(401).json({ error: { message: "Not authenticated", code: "UNAUTHORIZED" } });
  if (req.user.role !== "trainee") return res.status(403).json({ error: { message: "Trainee access required", code: "FORBIDDEN" } });
  next();
}

// ── Individual task ownership (Week 1/2) ──────────────────────────────────────
function requireTaskOwnership(taskFetcher) {
  return async function (req, res, next) {
    try {
      const task = await taskFetcher(req);
      if (!task) return res.status(404).json({ error: { message: "Task not found", code: "NOT_FOUND" } });
      if (task.assigned_to !== req.user.id) return res.status(403).json({ error: { message: "You are not assigned to this task", code: "FORBIDDEN" } });
      req.task = task;
      next();
    } catch (err) { next(err); }
  };
}

// ── Team-task part ownership (Week 3) ─────────────────────────────────────────
// Ensures a trainee can only access their OWN part of a team task.
// partFetcher(req) must return the team_task_part row or null.
function requirePartOwnership(partFetcher) {
  return async function (req, res, next) {
    try {
      const part = await partFetcher(req);
      if (!part) return res.status(404).json({ error: { message: "Part not found", code: "NOT_FOUND" } });
      if (part.assigned_to !== req.user.id) {
        return res.status(403).json({ error: { message: "You can only access your own part", code: "FORBIDDEN" } });
      }
      req.part = part;
      next();
    } catch (err) { next(err); }
  };
}

module.exports = { authenticate, requireAdmin, requireTrainee, requireTaskOwnership, requirePartOwnership };
