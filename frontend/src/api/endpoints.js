import client from "./client";

export const authAPI = {
  register: (data) =>
    client.post("/api/auth/register", data).then((r) => r.data),
  login: (email, password) =>
    client.post("/api/auth/login", { email, password }).then((r) => r.data),
  me: () => client.get("/api/auth/me").then((r) => r.data),
};

export const usersAPI = {
  listTrainees: () =>
    client.get("/api/users", { params: { role: "trainee" } }).then((r) => r.data),
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
