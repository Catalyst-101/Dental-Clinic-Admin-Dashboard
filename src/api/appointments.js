import api from "./axios";

export const getAppointments = async (params = {}) => {
  const response = await api.get("/api/appointments", {
    params: { all: "true", ...params }
  });
  return response.data;
};

export const getAppointmentById = async (id) => {
  const response = await api.get(`/api/appointments/${id}`);
  return response.data;
};

export const createAppointment = async (appointmentData) => {
  const response = await api.post("/api/appointments", appointmentData);
  return response.data;
};

export const updateAppointment = async (id, appointmentData) => {
  const response = await api.put(`/api/appointments/${id}`, appointmentData);
  return response.data;
};

export const updateAppointmentStatus = async (id, status) => {
  const response = await api.patch(`/api/appointments/${id}/status`, { status });
  return response.data;
};

export const deleteAppointment = async (id) => {
  const response = await api.delete(`/api/appointments/${id}`);
  return response.data;
};
