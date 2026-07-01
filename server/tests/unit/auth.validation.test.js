import { describe, expect, it } from "vitest";
import { normalizeUpper, resolveLoginQuery } from "../../src/modules/auth/auth.validation.js";

describe("auth.validation", () => {
  it("normalizes text to uppercase", () => {
    expect(normalizeUpper("  nSr/123/23  ")).toBe("NSR/123/23");
  });

  it("rejects invalid student ids", () => {
    expect(resolveLoginQuery("student", "bad-id")).toEqual({
      error: "Invalid student ID format.",
    });
  });

  it("maps staff email logins to email lookups", () => {
    expect(resolveLoginQuery("staff", "staff@amu.edu.et")).toEqual({
      where: {
        email: "staff@amu.edu.et",
      },
    });
  });
});