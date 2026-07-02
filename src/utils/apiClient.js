const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiFetch = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(responseBody.message || "Request failed");
    error.response = responseBody;
    throw error;
  }

  return responseBody;
};

export const logout = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  localStorage.removeItem("isAuthenticated");
  sessionStorage.removeItem("isAuthenticated");
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
};
