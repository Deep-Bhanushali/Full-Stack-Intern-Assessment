import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  signup: async (data: {
    name: string;
    email: string;
    address: string;
    password: string;
  }) => {
    const response = await api.post("/auth/signup", data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  changePassword: async (data: { userId: number; newPassword: string }) => {
    const response = await api.post("/auth/password", data);
    return response.data;
  },
};

// Admin endpoints
export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  createUser: async (data: {
    name: string;
    email: string;
    address: string;
    password: string;
    role: "ADMIN" | "USER" | "OWNER";
  }) => {
    const response = await api.post("/admin/users", data);
    return response.data;
  },

  createStore: async (data: {
    name: string;
    email?: string;
    address: string;
    ownerId?: number;
  }) => {
    const response = await api.post("/admin/stores", data);
    return response.data;
  },

  getStores: async (filters?: {
    name?: string;
    email?: string;
    address?: string;
  }) => {
    const response = await api.get("/admin/stores", { params: filters });
    return response.data;
  },

  getUsers: async (filters?: {
    name?: string;
    email?: string;
    address?: string;
    role?: string;
  }) => {
    const response = await api.get("/admin/users", { params: filters });
    return response.data;
  },
};

// User endpoints
export const userAPI = {
  getStores: async (filters?: { qName?: string; qAddress?: string }) => {
    const response = await api.get("/user/stores", { params: filters });
    return response.data;
  },

  submitRating: async (data: { storeId: number; value: number }) => {
    const response = await api.post("/user/rate", data);
    return response.data;
  },
};

// Store owner endpoints
export const ownerAPI = {
  getStoreRatings: async () => {
    const response = await api.get("/owner/ratings");
    return response.data;
  },
};

export default api;
