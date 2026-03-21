import axios from "axios";

// ─── Axios Instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ruraldev_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ──────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("ruraldev_refresh_token");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const { data } = await axios.post("/api/auth/refresh", {
          refreshToken,
        });

        const newAccessToken = data.accessToken;
        localStorage.setItem("ruraldev_token", newAccessToken);

        if (data.refreshToken) {
          localStorage.setItem("ruraldev_refresh_token", data.refreshToken);
        }

        api.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear auth state and redirect to login
        localStorage.removeItem("ruraldev_token");
        localStorage.removeItem("ruraldev_refresh_token");
        localStorage.removeItem("ruraldev_user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Construct a meaningful error message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";

    return Promise.reject({ ...error, friendlyMessage: message });
  },
);

// ─── Auth Endpoints ────────────────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  dashboard: () => api.get("/auth/dashboard"),
  refresh: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
  logout: () => api.post("/auth/logout"),
};

// ─── User Endpoints ────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
  uploadAvatar: (id, formData) =>
    api.post(`/users/${id}/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ─── Workshop Endpoints ────────────────────────────────────────────────────────
export const workshopAPI = {
  getAll: (params) => api.get("/workshops", { params }),
  getById: (id) => api.get(`/workshops/${id}`),
  create: (data) => api.post("/workshops", data),
  update: (id, data) => api.put(`/workshops/${id}`, data),
  approve: (id) => api.patch(`/workshops/${id}/approve`),
  reject: (id, reason) => api.patch(`/workshops/${id}/reject`, { reason }),
  enroll: (id) => api.post(`/workshops/${id}/enroll`),
};

// ─── Jobs Endpoints ───────────────────────────────────────────────────────────
export const jobsAPI = {
  getAll: (params) => api.get("/jobs", { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post("/jobs", data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  approve: (id) => api.patch(`/jobs/${id}/approve`),
  reject: (id, reason) => api.patch(`/jobs/${id}/reject`, { reason }),
};

// ─── Products Endpoints ────────────────────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  approve: (id) => api.patch(`/products/${id}/approve`),
  reject: (id, reason) => api.patch(`/products/${id}/reject`, { reason }),
};

// ─── Marketplace Endpoints ────────────────────────────────────────────────────
export const marketplaceAPI = {
  getProducts: (params) => api.get("/products", { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post("/products", data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// ─── Admin Endpoints ──────────────────────────────────────────────────────────
export const adminAPI = {
  getPendingApprovals: () => api.get("/admin/approvals"),
  getUsers: (params) => api.get("/admin/users", { params }),
  getFraudAlerts: () => api.get("/admin/fraud-alerts"),
  updateUserStatus: (id, status) =>
    api.patch(`/admin/users/${id}/status`, { status }),
};

// ─── Skill Pathway Endpoints ──────────────────────────────────────────────────
export const skillAPI = {
  getPathways: () => api.get("/skills/pathways"),
  getUserProgress: (userId) => api.get(`/skills/progress/${userId}`),
  updateProgress: (userId, skillId, data) =>
    api.patch(`/skills/progress/${userId}/${skillId}`, data),
};

export default api;
