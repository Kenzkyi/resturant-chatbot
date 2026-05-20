import axios, { AxiosError } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3012/api";

const getDeviceId = (): string => {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);
  }
  return id;
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  config.headers["X-Device-Id"] = getDeviceId();
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status && status >= 500) {
      console.error("Server error:", error.response?.data);
    }
    return Promise.reject(error);
  },
);

export default api;
