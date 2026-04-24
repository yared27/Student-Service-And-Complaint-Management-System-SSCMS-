import { apiRequest } from "@/lib/api/httpClient";

export async function loginStudent({ identifier, password, rememberMe = true }) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      identity: "student",
      identifier,
      password,
      rememberMe,
    }),
  });
}

export async function logoutSession(refreshToken) {
  try {
    if (!refreshToken) {
      return null;
    }

    return await apiRequest("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return null;
  }
}
