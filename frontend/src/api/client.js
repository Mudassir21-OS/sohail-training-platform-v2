import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    const apiMessage =
      error.response?.data?.error?.message || "Something went wrong";
    const normalised = new Error(apiMessage);
    normalised.code = error.response?.data?.error?.code || "SERVER_ERROR";
    normalised.status = error.response?.status;
    return Promise.reject(normalised);
  }
);

export default client;
