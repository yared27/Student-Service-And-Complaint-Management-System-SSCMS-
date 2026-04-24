import { createContext, useContext, useMemo, useReducer } from "react";

const AUTH_STORAGE_KEY = "sscms-auth";

const ROLES = ["student", "service_manager", "field_staff", "complaint_manager", "admin"];
const DEPARTMENTS = ["dormitory", "cafeteria", "ict", "library", "utilities"];

const AuthContext = createContext(null);

function isValidRole(role) {
  return ROLES.includes(role);
}

function isValidDepartment(dept) {
  return dept === null || DEPARTMENTS.includes(dept);
}

function normalizeUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  const normalized = {
    id: user.id ?? null,
    email: user.email ?? null,
    role: user.role ?? null,
    dept: user.dept ?? null,
  };

  if (!normalized.id || !normalized.email || !isValidRole(normalized.role) || !isValidDepartment(normalized.dept)) {
    return null;
  }

  return normalized;
}

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return { user: null, token: null, loading: false };
    }

    const parsed = JSON.parse(raw);
    const user = normalizeUser(parsed?.user);
    const token = typeof parsed?.token === "string" && parsed.token ? parsed.token : null;

    if (!user || !token) {
      return { user: null, token: null, loading: false };
    }

    return { user, token, loading: false };
  } catch {
    return { user: null, token: null, loading: false };
  }
}

function persistAuthState(state) {
  if (state?.user && state?.token) {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        user: state.user,
        token: state.token,
      }),
    );
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS": {
      const user = normalizeUser(action.payload?.user);
      const token = typeof action.payload?.token === "string" && action.payload.token ? action.payload.token : null;

      if (!user || !token) {
        const nextState = { user: null, token: null, loading: false };
        persistAuthState(nextState);
        return nextState;
      }

      const nextState = { user, token, loading: false };
      persistAuthState(nextState);
      return nextState;
    }

    case "LOGOUT": {
      const nextState = { user: null, token: null, loading: false };
      persistAuthState(nextState);
      return nextState;
    }

    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, undefined, readStoredAuth);

  const value = useMemo(
    () => ({
      ...state,
      roles: ROLES,
      departments: DEPARTMENTS,
      loginSuccess: (payload) => dispatch({ type: "LOGIN_SUCCESS", payload }),
      logout: () => dispatch({ type: "LOGOUT" }),
      isAuthenticated: Boolean(state.token && state.user),
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
