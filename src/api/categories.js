import api from "./axios";

export const getCategories = async (params = {}) => {
  const response = await api.get("/api/categories", { params });
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/api/categories/${id}`);
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post("/api/categories", categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/api/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/api/categories/${id}`);
  return response.data;
};
