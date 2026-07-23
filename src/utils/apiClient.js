import api, { getFullImageUrl } from "../api/axios";

export { api, getFullImageUrl };

export const apiFetch = async (path, options = {}) => {
  const method = (options.method || "GET").toLowerCase();

  const config = {
    method,
    url: path,
    headers: { ...options.headers },
  };

  if (options.body) {
    if (options.body instanceof FormData) {
      config.data = options.body;
    } else if (typeof options.body === "object") {
      config.data = options.body;
    } else {
      try {
        config.data = JSON.parse(options.body);
      } catch {
        config.data = options.body;
      }
    }
  }

  const response = await api(config);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  localStorage.removeItem("isAuthenticated");
  sessionStorage.removeItem("isAuthenticated");
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
};
