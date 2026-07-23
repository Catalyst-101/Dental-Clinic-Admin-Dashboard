import api from "./axios";

export const getServices = async (params = {}) => {
  const response = await api.get("/api/services", {
    params: { all: "true", ...params }
  });
  return response.data;
};

export const getServiceById = async (id) => {
  const response = await api.get(`/api/services/${id}`);
  return response.data;
};

export const createService = async (serviceData) => {
  const response = await api.post("/api/services", serviceData);
  return response.data;
};

export const updateService = async (id, serviceData) => {
  const response = await api.put(`/api/services/${id}`, serviceData);
  return response.data;
};

export const deleteService = async (id) => {
  const response = await api.delete(`/api/services/${id}`);
  return response.data;
};

export const toggleServiceStatus = async (id, isActive) => {
  const response = await api.patch(`/api/services/${id}/status`, { isActive });
  return response.data;
};

export const uploadServiceImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await api.post("/api/services/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  } catch (error) {
    if (error.status === 404 || (error.response && error.response.status === 404)) {
      const fallbackResponse = await api.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return fallbackResponse.data;
    }
    throw error;
  }
};
