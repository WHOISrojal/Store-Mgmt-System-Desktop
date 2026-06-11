import axios from "axios";

const api = axios.create({
  baseURL:
    "https://store-mgmt-system-backend.onrender.com/api",
});

api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem(
        "token"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    config.headers["x-user"] =
      localStorage.getItem("name") ||
      "Unknown";

    return config;
  }
);

export default api;