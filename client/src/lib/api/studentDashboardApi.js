import { apiRequest } from "@/lib/api/httpClient";

function normalizeStatus(status) {
  return String(status || "").toUpperCase();
}

function toActivityItem(item, type) {
  return {
    id: item.id,
    title: item.title,
    type,
    status: normalizeStatus(item.status),
    date: item.createdAt,
    createdAt: item.createdAt,
  };
}

function isActiveRequest(status) {
  const normalized = normalizeStatus(status);
  return normalized === "SUBMITTED" || normalized === "IN_PROGRESS";
}

function isPendingComplaint(status) {
  const normalized = normalizeStatus(status);
  return ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS"].includes(normalized);
}

export async function fetchStudentDashboardData() {
  const [profileRes, requestsRes, complaintsRes] = await Promise.all([
    apiRequest("/users/me"),
    apiRequest("/service-requests?limit=8&page=1"),
    apiRequest("/complaints?limit=8&page=1"),
  ]);

  const serviceRequests = requestsRes?.items || [];
  const complaints = complaintsRes?.items || [];

  const activities = [
    ...serviceRequests.map((item) => toActivityItem(item, "Service Request")),
    ...complaints.map((item) => toActivityItem(item, "Complaint")),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  return {
    userName: profileRes?.user?.name || "Student",
    activeRequestsCount: serviceRequests.filter((item) => isActiveRequest(item.status)).length,
    pendingComplaintsCount: complaints.filter((item) => isPendingComplaint(item.status)).length,
    activities,
  };
}
