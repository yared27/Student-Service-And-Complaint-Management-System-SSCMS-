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
    date: formatDate(item.createdAt),
    createdAt: item.createdAt,
  };
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

export async function fetchSubmissionDirectory({ search = "", limit = 50, page = 1 } = {}) {
  const [complaintsRes, serviceRequestsRes] = await Promise.all([
    fetchMyComplaints({ limit, page }),
    fetchMyServiceRequests({ limit, page }),
  ]);

  const normalizedSearch = search.trim().toLowerCase();

  const items = [...complaintsRes.items, ...serviceRequestsRes.items]
    .filter((item) =>
      normalizedSearch
        ? item.title.toLowerCase().includes(normalizedSearch) || item.id.toLowerCase().includes(normalizedSearch)
        : true,
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    total: items.length,
    page,
    limit,
    items,
  };
}

export async function fetchSubmissionDetail(id) {
  try {
    const complaintRes = await apiRequest(`/complaints/${id}`);
    if (complaintRes?.complaint) {
      return toComplaintItem(complaintRes.complaint);
    }
  } catch (error) {
    if (error?.status !== 404) {
      throw error;
    }
  }

  const serviceRequestRes = await apiRequest(`/service-requests/${id}`);
  if (!serviceRequestRes?.serviceRequest) {
    throw new Error("Submission not found.");
  }

  return toServiceRequestItem(serviceRequestRes.serviceRequest);
}
