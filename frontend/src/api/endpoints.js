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

// ── Week 3: Team Tasks ────────────────────────────────────────────────────────

export const teamTasksAPI = {
  // Admin: create a team task with parts
  create: (data) =>
    client.post("/api/team-tasks", data).then((r) => r.data),

  // Admin: list all team tasks with all parts
  listAll: () =>
    client.get("/api/team-tasks").then((r) => r.data),

  // Trainee: get ONLY their own parts (enforced server-side)
  myParts: () =>
    client.get("/api/team-tasks/my-parts").then((r) => r.data),

  // Trainee: submit their part
  submitPart: (partId, submissionText, fileUrl = null) =>
    client.post(`/api/team-tasks/parts/${partId}/submit`, {
      submission_text: submissionText,
      file_url: fileUrl,
    }).then((r) => r.data),

  // Admin: grade a part
  gradePart: (partId, score, feedback) =>
    client.put(`/api/team-tasks/parts/${partId}/grade`, { score, feedback }).then((r) => r.data),
};
