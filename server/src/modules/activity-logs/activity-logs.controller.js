import { createActivityLogsService } from "./activity-logs.service.js";

export function createActivityLogsController({ prisma }) {
  const service = createActivityLogsService({ prisma });

  return {
    listLogs: async (req, res) => {
      try {
        const result = await service.listLogs(req.query);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("List activity logs failed:", error);
        return res.status(500).json({ message: "Failed to fetch activity logs." });
      }
    },
  };
}
