import axios from "axios";
import { LocalStorage } from "../utils";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = LocalStorage.get("accessToken") as string | null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/refresh")
    ) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${API_BASE}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data?.data?.accessToken;
        if (newToken) {
          LocalStorage.set("accessToken", newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(original);
        }
      } catch {
        LocalStorage.clear();
        window.location.href = "/login";
      }
    }

    // Axios otherwise exposes only e.g. "Request failed with status code 502",
    // hiding the API's actionable upload error from the settings page.
    const apiMessage = error.response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.trim()) {
      error.message = apiMessage;
    }

    return Promise.reject(error);
  }
);

export { apiClient, API_BASE };
