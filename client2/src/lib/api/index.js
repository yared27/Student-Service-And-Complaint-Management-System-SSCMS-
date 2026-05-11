import { apiRequest } from "./httpClient";

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    query.set(key, String(value));
  });

  const text = query.toString();
  return text ? `?${text}` : "";
}

export async function listComplaints(_token, query = {}) {
  return apiRequest(`/complaints${buildQuery(query)}`);
}

export async function listServiceRequests(_token, query = {}) {
  return apiRequest(`/service-requests${buildQuery(query)}`);
}

export async function listUsers(_token, query = {}) {
  return apiRequest(`/users${buildQuery(query)}`);
}

export async function createUser(_token, payload) {
  return apiRequest("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUser(_token, userId, payload) {
  return apiRequest(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function uploadStudentImport(_token, file) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest("/admin/imports/upload", {
    method: "POST",
    body: form,
  });
}

export async function listImportHistory(_token, query = {}) {
  return apiRequest(`/admin/imports/history${buildQuery(query)}`);
}

export async function getImportBatch(_token, batchId) {
  return apiRequest(`/admin/imports/history/${batchId}`);
}

export async function listActivityLogs(_token, query = {}) {
  return apiRequest(`/activity-logs${buildQuery(query)}`);
}

export async function listMisuseReports(_token, query = {}) {
  return apiRequest(`/reports/misuse${buildQuery(query)}`);
}

export async function assignComplaint(_token, complaintId, payload) {
  return apiRequest(`/complaints/${complaintId}/assignment`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateComplaintStatus(_token, complaintId, payload) {
  return apiRequest(`/complaints/${complaintId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateGrievanceStatus(_token, complaintId, payload) {
  return apiRequest(`/complaints/${complaintId}/grievance-status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function assignServiceRequest(_token, requestId, payload) {
  return apiRequest(`/service-requests/${requestId}/assignment`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateServiceRequestStatus(_token, requestId, payload) {
  return apiRequest(`/service-requests/${requestId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function reviewMisuseReport(_token, reportId, payload) {
  return apiRequest(`/reports/misuse/${reportId}/review`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function createMisuseReport(_token, payload) {
  return apiRequest(`/reports/misuse`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export { apiRequest };