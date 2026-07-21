import client from "./client";

export const authAPI = {
  login: (email, password) =>
    client.post("/api/auth/login", { email, password }).then((r) => r.data),
  me: () => client.get("/api/auth/me").then((r) => r.data),
};

export const usersAPI = {
  createTrainee: (name, email, password) =>
    client.post("/api/auth/register", { name, email, password, role: "trainee" }).then((r) => r.data),
  listTrainees: () =>
    client.get("/api/users", { params: { role: "trainee" } }).then((r) => r.data),
  update: (id, data) =>
    client.put(`/api/users/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/api/users/${id}`),
};

export const tasksAPI = {
  list: () => client.get("/api/tasks").then((r) => r.data),
  get: (id) => client.get(`/api/tasks/${id}`).then((r) => r.data),
  create: (data) => client.post("/api/tasks", data).then((r) => r.data),
  update: (id, data) => client.put(`/api/tasks/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/api/tasks/${id}`),
};

export const submissionsAPI = {
  submit: (taskId, submissionText) =>
    client.post(`/api/tasks/${taskId}/submissions`, {
      submission_text: submissionText,
      file_url: null,
    }).then((r) => r.data),
  list: () => client.get("/api/submissions").then((r) => r.data),
  get: (id) => client.get(`/api/submissions/${id}`).then((r) => r.data),
};

export const gradingAPI = {
  grade: (submissionId, score, feedback) =>
    client.put(`/api/submissions/${submissionId}/grade`, { score, feedback }).then((r) => r.data),
};

export const teamTasksAPI = {
  create: (data) =>
    client.post("/api/team-tasks", data).then((r) => r.data),
  listAll: () =>
    client.get("/api/team-tasks").then((r) => r.data),
  myParts: () =>
    client.get("/api/team-tasks/my-parts").then((r) => r.data),
  submitPart: (partId, submissionText, fileUrl = null) =>
    client.post(`/api/team-tasks/parts/${partId}/submit`, {
      submission_text: submissionText,
      file_url: fileUrl,
    }).then((r) => r.data),
  gradePart: (partId, score, feedback) =>
    client.put(`/api/team-tasks/parts/${partId}/grade`, { score, feedback }).then((r) => r.data),
};

// ── Week 4: Analytics (admin only — enforced server-side) ─────────────────────
export const analyticsAPI = {
  // High-level numbers: total trainees, tasks, submissions, avg score, submission rate
  overview: () =>
    client.get("/api/analytics/overview").then((r) => r.data),

  // Per-trainee breakdown: tasks assigned, submitted, avg score
  trainees: () =>
    client.get("/api/analytics/trainees").then((r) => r.data),

  // Per-task breakdown: status, score, on-time vs late
  tasks: () =>
    client.get("/api/analytics/tasks").then((r) => r.data),

  // Submission timing: count of on_time / late / not_submitted
  timing: () =>
    client.get("/api/analytics/timing").then((r) => r.data),

  // Score distribution: failing / passing / good / excellent buckets
  scores: () =>
    client.get("/api/analytics/scores").then((r) => r.data),

  // Download CSV report — triggers file download in browser
  exportCSV: () =>
    client.get("/api/analytics/export", { responseType: "blob" }).then((r) => {
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "analytics_report.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    }),
};
