import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearStoredAuth, getStoredAuth, persistAuth } from "@/lib/authStorage";
import { logoutSession } from "@/lib/api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuth(getStoredAuth());
    setLoading(false);

    const handleAuthExpired = () => {
      setAuth(null);
      clearStoredAuth();
      setLoading(false);
    };

    window.addEventListener("sscms-auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("sscms-auth-expired", handleAuthExpired);
    };
  }, []);

  const login = useCallback((payload) => {
    persistAuth(payload);
    setAuth(payload);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    await logoutSession(auth?.refreshToken);
    clearStoredAuth();
    setAuth(null);
    setLoading(false);
  }, [auth?.refreshToken]);

  const value = useMemo(
    () => ({
      auth,
      user: auth?.user || null,
      token: auth?.token || null,
      loading,
      isAuthenticated: Boolean(auth?.token),
      login,
      logout,
    }),
    [auth, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return value;
}
