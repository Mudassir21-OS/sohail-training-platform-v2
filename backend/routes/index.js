const authRouter = require("./auth");
const teamTasksRouter = require("./teamTasks");
const { authenticate, requireAdmin, requireTrainee, requireTaskOwnership, requirePartOwnership } = require("../middleware/auth");

module.exports = function mountRoutes(app) {
  // Public
  app.use("/api/auth", authRouter);

  // Protected — existing routes
  const usersRouter = require("./users");
  app.use("/api/users", authenticate, requireAdmin, usersRouter);

  const tasksRouter = require("./tasks");
  app.use("/api/tasks", authenticate, tasksRouter);

  const submissionsRouter = require("./submissions");
  app.use("/api/submissions", authenticate, submissionsRouter);

  // Protected — Week 3: team tasks
  app.use("/api/team-tasks", authenticate, teamTasksRouter);

  // Global error handler
  app.use((err, req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: { message: "Internal server error", code: "SERVER_ERROR" } });
  });
};

module.exports.authenticate = authenticate;
module.exports.requireAdmin = requireAdmin;
module.exports.requireTrainee = requireTrainee;
module.exports.requireTaskOwnership = requireTaskOwnership;
module.exports.requirePartOwnership = requirePartOwnership;
