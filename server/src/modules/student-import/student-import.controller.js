import { createStudentImportService } from "./student-import.service.js";

export function createStudentImportController({ prisma }) {
  const service = createStudentImportService({ prisma });

  return {
    uploadStudents: async (req, res) => {
      try {
        const result = await service.importStudents(req.user?.sub, req.file, req.body);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Import students failed:", error);
        return res.status(500).json({ message: "Failed to import students." });
      }
    },

    listImportHistory: async (req, res) => {
      try {
        const result = await service.listImportHistory(req.query);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Fetch import history failed:", error);
        return res.status(500).json({ message: "Failed to fetch import history." });
      }
    },

    getImportBatch: async (req, res) => {
      try {
        const result = await service.getImportBatch(req.params.id);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Fetch import batch failed:", error);
        return res.status(500).json({ message: "Failed to fetch import batch." });
      }
    },
  };
}
