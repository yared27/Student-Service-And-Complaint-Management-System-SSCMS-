import { login, registerStudent } from "./auth.service.js";

export function createAuthController({ prisma, jwtSecret }) {
  return {
    registerStudent: async (req, res) => {
      try {
        const result = await registerStudent(prisma, req.body);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Register student failed:", error);
        return res.status(500).json({ message: "Failed to register student account." });
      }
    },

    login: async (req, res) => {
      try {
        const result = await login(prisma, req.body, jwtSecret);
        return res.status(result.status).json(result.body);
      } catch (error) {
        console.error("Login failed:", error);
        return res.status(500).json({ message: "Failed to login." });
      }
    },
  };
}
