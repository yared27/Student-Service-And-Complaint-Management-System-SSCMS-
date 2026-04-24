import { apiRequest } from "@/lib/api/httpClient";

function toTitleCaseFromEnum(value) {
  return String(value || "")
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Recently";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function toComplaintItem(item) {
  const attachments = Array.isArray(item.attachments)
    ? item.attachments
        .map((attachment) => ({
          id: attachment.id,
          url: attachment.url,
          publicId: attachment.publicId || null,
          width: attachment.width || null,
          height: attachment.height || null,
          format: attachment.format || null,
          bytes: attachment.bytes || null,
        }))
        .filter((attachment) => attachment.url)
    : [];

  return {
    id: item.id,
    title: item.title,
    type: "Complaint",
    description: item.description,
    attachments,
    priority: item.priority,
    status: toTitleCaseFromEnum(item.status),
    statusRaw: String(item.status || "").toUpperCase(),
    date: formatDate(item.createdAt),
    createdAt: item.createdAt,
  };
}

function toServiceRequestItem(item) {
  return {
    id: item.id,
    title: item.title,
    type: "Service Request",
    description: item.description,
    attachments: [],
    priority: item.priority,
    status: toTitleCaseFromEnum(item.status),
    statusRaw: String(item.status || "").toUpperCase(),
    date: formatDate(item.createdAt),
    createdAt: item.createdAt,
  };
}

function sortByCreatedAtDesc(items) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left.createdAt || 0).getTime();
    const rightTime = new Date(right.createdAt || 0).getTime();
    return rightTime - leftTime;
  });
}

export async function fetchMyComplaints({ search = "", limit = 30, page = 1 } = {}) {
  const response = await apiRequest(`/complaints?limit=${limit}&page=${page}`);
  const normalizedSearch = search.trim().toLowerCase();

  const items = (response?.items || [])
    .map(toComplaintItem)
    .filter((item) =>
      normalizedSearch
        ? item.title.toLowerCase().includes(normalizedSearch) || item.id.toLowerCase().includes(normalizedSearch)
        : true,
    );

  return {
    total: response?.total || items.length,
    page: response?.page || page,
    limit: response?.limit || limit,
    items,
  };
}

export async function fetchMyServiceRequests({ search = "", limit = 30, page = 1 } = {}) {
  const response = await apiRequest(`/service-requests?limit=${limit}&page=${page}`);
  const normalizedSearch = search.trim().toLowerCase();

  const items = (response?.items || [])
    .map(toServiceRequestItem)
    .filter((item) =>
      normalizedSearch
        ? item.title.toLowerCase().includes(normalizedSearch) || item.id.toLowerCase().includes(normalizedSearch)
        : true,
    );

  return {
    total: response?.total || items.length,
    page: response?.page || page,
    limit: response?.limit || limit,
    items,
  };
}

export async function fetchSubmissionDirectory({ search = "", limit = 100, page = 1 } = {}) {
  const [complaints, serviceRequests] = await Promise.all([
    fetchMyComplaints({ search, limit, page }),
    fetchMyServiceRequests({ search, limit, page }),
  ]);

  const items = sortByCreatedAtDesc([...(complaints.items || []), ...(serviceRequests.items || [])]);

  return {
    total: items.length,
    page,
    limit,
    items,
  };
}

export async function fetchSubmissionDetail(id) {
  const recordId = String(id || "").trim();
  if (!recordId) {
    throw new Error("Submission id is required.");
  }

  const [complaintResult, requestResult] = await Promise.allSettled([
    apiRequest(`/complaints/${recordId}`),
    apiRequest(`/service-requests/${recordId}`),
  ]);

  if (complaintResult.status === "fulfilled" && complaintResult.value?.complaint) {
    return toComplaintItem(complaintResult.value.complaint);
  }

  if (requestResult.status === "fulfilled" && requestResult.value?.serviceRequest) {
    return toServiceRequestItem(requestResult.value.serviceRequest);
  }

  throw new Error("Submission not found.");
}

export async function createComplaint(payload) {
  return apiRequest("/complaints", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createServiceRequest(payload) {
  return apiRequest("/service-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadImages(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return apiRequest("/uploads/images", {
    method: "POST",
    body: formData,
  });
}
