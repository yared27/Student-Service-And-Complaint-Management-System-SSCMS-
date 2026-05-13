import { createComplaintsService } from "./complaints.service.js";

export function createComplaintsController({ prisma }) {
  const service = createComplaintsService({ prisma });

  return {
    createComplaint: async (req, res) => {
      try {
        const result = await service.createComplaint({
          userId: req.user?.sub,
          role: req.user?.role,
          payload: req.body,
        });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Create complaint failed:", error);
        return res.status(500).json({ message: "Failed to create complaint." });
      }
    },

    listComplaints: async (req, res) => {
      try {
        const result = await service.listComplaints({ userId: req.user?.sub, role: req.user?.role, category: req.user?.category, query: req.query });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("List complaints failed:", error);
        return res.status(500).json({ message: "Failed to fetch complaints." });
      }
    },

    getComplaint: async (req, res) => {
      try {
        const result = await service.getComplaint({ userId: req.user?.sub, role: req.user?.role, complaintId: req.params.id });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Get complaint failed:", error);
        return res.status(500).json({ message: "Failed to fetch complaint." });
      }
    },

    assignComplaint: async (req, res) => {
      try {
        const result = await service.assignComplaint({
          userId: req.user?.sub,
          role: req.user?.role,
          complaintId: req.params.id,
          payload: req.body,
        });

        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Assign complaint failed:", error);
        return res.status(500).json({ message: "Failed to assign complaint." });
      }
    },

    updateComplaintStatus: async (req, res) => {
      try {
        const result = await service.updateComplaintStatus({
          userId: req.user?.sub,
          role: req.user?.role,
          complaintId: req.params.id,
          payload: req.body,
        });

        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Update complaint failed:", error);
        return res.status(500).json({ message: "Failed to update complaint." });
      }
    },

    updateGrievanceStatus: async (req, res) => {
      try {
        const result = await service.updateGrievanceStatus({
          userId: req.user?.sub,
          role: req.user?.role,
          complaintId: req.params.id,
          payload: req.body,
        });

        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Update grievance phase failed:", error);
        return res.status(500).json({ message: "Failed to update grievance phase." });
      }
    },

    reopenComplaint: async (req, res) => {
      try {
        const result = await service.reopenComplaint({
          userId: req.user?.sub,
          role: req.user?.role,
          complaintId: req.params.id,
          payload: req.body,
        });

        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Reopen complaint failed:", error);
        return res.status(500).json({ message: "Failed to reopen complaint." });
      }
    },
  };
}
