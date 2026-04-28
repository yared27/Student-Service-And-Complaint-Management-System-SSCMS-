import axios from "axios";
import { toast } from "sonner";

const AUTH_STORAGE_KEY = "sscms-auth";
const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

const REACT_APP_API_URL = typeof process !== "undefined" ? process.env?.REACT_APP_API_URL : undefined;
const VITE_API_BASE_URL = typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_BASE_URL : undefined;

const baseURL = (REACT_APP_API_URL || VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");

function getStoredAuthFromLocalStorage() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getTokenFromLocalStorage() {
  return getStoredAuthFromLocalStorage()?.token || null;
}

function getDeptFromContext(dept) {
  if (dept) {
    return dept;
  }

  const user = getStoredAuthFromLocalStorage()?.user;
  return user?.department || user?.dept || null;
}

function clearAuthAndNotify() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event("sscms-auth-expired"));
}

function toQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axios.defaults.withCredentials = true;

api.interceptors.request.use(
  (config) => {
    const token = getTokenFromLocalStorage();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message || "Request failed.";

    if (status === 401) {
      clearAuthAndNotify();
      toast.error("Session expired. Please sign in again.");
    } else if (status >= 400) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export const auth = {
  async login(email, pass) {
    const { data } = await api.post("/auth/login", { email, password: pass });
    return data;
  },

  async logout() {
    try {
      const refreshToken = getStoredAuthFromLocalStorage()?.refreshToken;

      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } finally {
      clearAuthAndNotify();
    }
  },
};

export const requests = {
  async getDashboard(role, dept) {
    const resolvedDept = getDeptFromContext(dept);
    const { data } = await api.get(`/requests/dashboard${toQuery({ role, dept: resolvedDept })}`);
    return data;
  },

  async getRequests(status, dept) {
    const resolvedDept = getDeptFromContext(dept);
    const { data } = await api.get(`/requests${toQuery({ status, dept: resolvedDept })}`);
    return data;
  },

  async postRequest(data) {
    const { data: payload } = await api.post("/requests", data);
    return payload;
  },

  async postTaskAssign(reqId, staffId, dept) {
    const resolvedDept = getDeptFromContext(dept);
    const { data } = await api.post(`/requests/${reqId}/assign`, {
      staffId,
      dept: resolvedDept,
    });
    return data;
  },

  async getAvailableStaff(dept) {
    const resolvedDept = getDeptFromContext(dept);
    const { data } = await api.get(`/users/available-staff${toQuery({ dept: resolvedDept })}`);
    return data;
  },

  async getTask(id) {
    const { data } = await api.get(`/tasks/${id}`);
    return data;
  },

  async updateTaskProgress(id, data) {
    const { data: payload } = await api.patch(`/tasks/${id}/progress`, data);
    return payload;
  },
};

export const users = {
  async getUsers() {
    const { data } = await api.get("/users");
    return data;
  },

  async createUser(data) {
    const { data: payload } = await api.post("/users", data);
    return payload;
  },
};

export default {
  auth,
  requests,
  users,
};
