const authRouter = require("./auth");
const { authenticate, requireAdmin, requireTrainee, requireTaskOwnership } = require("../middleware/auth");

module.exports = function mountRoutes(app) {
  app.use("/api/auth", authRouter);

  const usersRouter = require("./users");
  app.use("/api/users", authenticate, requireAdmin, usersRouter);

  const tasksRouter = require("./tasks");
  app.use("/api/tasks", authenticate, tasksRouter);

  const submissionsRouter = require("./submissions");
  app.use("/api/submissions", authenticate, submissionsRouter);

  app.use((err, req, res, _next) => {
    console.error(err);
    res.status(500).json({
      error: { message: "Internal server error", code: "SERVER_ERROR" },
    });
  });
};

module.exports.authenticate = authenticate;
module.exports.requireAdmin = requireAdmin;
module.exports.requireTrainee = requireTrainee;
module.exports.requireTaskOwnership = requireTaskOwnership;
