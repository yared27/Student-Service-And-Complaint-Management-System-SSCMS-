export const currentUser = {
  name: "Ana Mohammed", // Updated to your name
  id: "2024-88392",
  email: "ana.mohammed@amu.edu.et",
  avatar: null,
  role: "Student",
  department: "Software Engineering", // Matches Profile.jsx
  faculty: "Technology",
};

export const recentRequests = [
  {
    id: "1",
    title: "Dormitory WiFi Down",
    type: "Service Request", // Matches Archive filter logic
    description: "Request for technical assistance in Block 42.",
    status: "Pending",
    date: "Oct 12, 2025", // Matches Archive display logic
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Grade Appeal: Math 201",
    type: "Complaint",
    description: "Formal grievance regarding the recent mid-term assessment.",
    status: "In Progress",
    date: "Oct 10, 2025",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    title: "ID Card Replacement",
    type: "Service Request",
    description: "Lost card during field trip; requesting a new issuance.",
    status: "Resolved",
    date: "Oct 08, 2025",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-600 border-amber-100",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-50 text-blue-600 border-blue-100",
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-50 text-green-600 border-green-100",
  },
};
