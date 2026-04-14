import { createServiceRequestsService } from "./service-requests.service.js";

export function createServiceRequestsController({ prisma }) {
  const service = createServiceRequestsService({ prisma });

  return {
    createRequest: async (req, res) => {
      try {
        const result = await service.createRequest({ userId: req.user?.sub, payload: req.body });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Create service request failed:", error);
        return res.status(500).json({ message: "Failed to create service request." });
      }
    },

    listRequests: async (req, res) => {
      try {
        const result = await service.listRequests({ userId: req.user?.sub, role: req.user?.role, query: req.query });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("List service requests failed:", error);
        return res.status(500).json({ message: "Failed to fetch service requests." });
      }
    },

    getRequest: async (req, res) => {
      try {
        const result = await service.getRequest({ userId: req.user?.sub, role: req.user?.role, requestId: req.params.id });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Get service request failed:", error);
        return res.status(500).json({ message: "Failed to fetch service request." });
      }
    },

    assignRequest: async (req, res) => {
      try {
        const result = await service.assignRequest({
          userId: req.user?.sub,
          role: req.user?.role,
          requestId: req.params.id,
          payload: req.body,
        });

        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Assign service request failed:", error);
        return res.status(500).json({ message: "Failed to assign service request." });
      }
    },

    updateRequestStatus: async (req, res) => {
      try {
        const result = await service.updateRequestStatus({
          userId: req.user?.sub,
          role: req.user?.role,
          requestId: req.params.id,
          payload: req.body,
        });

        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Update service request failed:", error);
        return res.status(500).json({ message: "Failed to update service request." });
      }
    },
  };
}
