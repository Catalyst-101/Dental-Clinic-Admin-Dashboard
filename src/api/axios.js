import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const parseErrorMessage = (error, defaultMsg = "An unexpected error occurred. Please try again.") => {
  if (!error) return defaultMsg;
  if (typeof error === "string") return error;

  const status = error.status || (error.response && error.response.status);
  const dataMsg = error.response && error.response.data && error.response.data.message;

  if (dataMsg && !dataMsg.includes("status code")) {
    return dataMsg;
  }

  if (status === 404) {
    return "Requested resource was not found. Please verify the service exists.";
  }
  if (status === 401) {
    return "Your session has expired. Please log in again.";
  }
  if (status === 403) {
    return "Access denied. Admin authorization is required.";
  }
  if (status === 400) {
    return dataMsg || "Invalid request parameters or missing required fields.";
  }
  if (status >= 500) {
    return "Backend server error. Please try again in a few moments.";
  }

  if (error.message && !error.message.includes("status code") && !error.message.includes("Request failed")) {
    return error.message;
  }

  return defaultMsg;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const friendlyMessage = parseErrorMessage(error);
    const customError = new Error(friendlyMessage);
    customError.status = error.response ? error.response.status : 500;
    customError.response = error.response ? error.response.data : null;
    return Promise.reject(customError);
  }
);

export const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const cleanBase = API_BASE_URL.replace(/\/$/, "");
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${cleanBase}${cleanPath}`;
};

export default api;
