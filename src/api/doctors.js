import api from "./axios";

export const getDoctors = async (params = {}) => {
  const response = await api.get("/api/doctors", {
    params: { all: "true", ...params }
  });
  return response.data;
};

export const getDoctorById = async (id) => {
  const response = await api.get(`/api/doctors/${id}`);
  return response.data;
};

export const createDoctor = async (doctorData) => {
  const response = await api.post("/api/doctors", doctorData);
  return response.data;
};

export const updateDoctor = async (id, doctorData) => {
  const response = await api.put(`/api/doctors/${id}`, doctorData);
  return response.data;
};

export const deleteDoctor = async (id) => {
  const response = await api.delete(`/api/doctors/${id}`);
  return response.data;
};

export const toggleDoctorStatus = async (id, isActive) => {
  const response = await api.patch(`/api/doctors/${id}/status`, { isActive });
  return response.data;
};

export const uploadDoctorImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await api.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  } catch (error) {
    if (error.status === 404 || (error.response && error.response.status === 404)) {
      const fallbackResponse = await api.post("/api/services/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return fallbackResponse.data;
    }
    throw error;
  }
};
