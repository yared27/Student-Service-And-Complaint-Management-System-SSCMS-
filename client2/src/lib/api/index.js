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

export { apiRequest };