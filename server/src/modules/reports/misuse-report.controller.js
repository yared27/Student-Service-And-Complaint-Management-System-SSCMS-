import { createMisuseReportService } from "./misuse-report.service.js";

export function createMisuseReportController({ prisma }) {
  const service = createMisuseReportService({ prisma });

  return {
    createReport: async (req, res) => {
      try {
        const result = await service.createReport({
          reporterId: req.user?.sub,
          reporterUsername: req.user?.username,
          reporterRole: req.user?.role,
          payload: req.body,
        });

        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Create misuse report failed:", error);
        return res.status(500).json({ message: "Failed to create report." });
      }
    },

    listReports: async (req, res) => {
      try {
        const result = await service.listReports({ query: req.query, user: req.user });
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("List misuse reports failed:", error);
        return res.status(500).json({ message: "Failed to fetch reports." });
      }
    },

    reviewReport: async (req, res) => {
      try {
        const result = await service.reviewReport({
          reviewerId: req.user?.sub,
          reviewerRole: req.user?.role,
          reportId: req.params.id,
          payload: req.body,
        });

        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Review misuse report failed:", error);
        return res.status(500).json({ message: "Failed to review report." });
      }
    },
  };
}
