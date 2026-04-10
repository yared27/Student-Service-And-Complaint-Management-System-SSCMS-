const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function parseResponse(response) {
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || "Request failed.";
    throw new Error(message);
  }

  return data;
}

export async function loginRequest(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function registerStudentRequest(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register-student`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}
