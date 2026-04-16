import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "list_risks",
    "List all risks for the organization with optional filtering and pagination",
    {
      title: z.string().optional().describe("Search by title (case-insensitive)"),
      status: z.enum(["open", "pending", "closed", "archived"]).optional().describe("Filter by status"),
      category: z
        .enum(["customer", "fraud", "governance", "operations", "other", "people", "regulatory", "reporting", "resilience", "technology", "vendor_management"])
        .optional()
        .describe("Filter by category"),
      department: z.enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"]).optional().describe("Filter by department"),
      assigneeId: z.string().optional().describe("Filter by assignee member ID"),
      page: z.string().optional().describe("Page number (1-indexed)"),
      perPage: z.string().optional().describe("Items per page (max 250)"),
      sort: z.enum(["createdAt", "updatedAt", "title", "status"]).optional().describe("Sort field"),
      sortDirection: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
    },
    async (params) => {
      try {
        return ok(await request("/v1/risks", { query: params as Record<string, string | undefined> }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "get_risk",
    "Get a specific risk by ID with full detail",
    { riskId: z.string().describe("Risk ID") },
    async ({ riskId }) => {
      try {
        return ok(await request(`/v1/risks/${riskId}`));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "create_risk",
    "Create a new risk entry for the organization",
    {
      title: z.string().describe("Risk title"),
      description: z.string().describe("Detailed risk description"),
      category: z
        .enum(["customer", "fraud", "governance", "operations", "other", "people", "regulatory", "reporting", "resilience", "technology", "vendor_management"])
        .describe("Risk category"),
      status: z.enum(["open", "pending", "closed", "archived"]).default("open").describe("Risk status"),
      likelihood: z.enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"]).default("very_unlikely").describe("Likelihood of occurrence"),
      impact: z.enum(["insignificant", "minor", "moderate", "major", "severe"]).default("insignificant").describe("Impact if materialized"),
      residualLikelihood: z.enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"]).default("very_unlikely").describe("Residual likelihood after treatment"),
      residualImpact: z.enum(["insignificant", "minor", "moderate", "major", "severe"]).default("insignificant").describe("Residual impact after treatment"),
      treatmentStrategy: z.enum(["accept", "avoid", "mitigate", "transfer"]).default("accept").describe("Risk treatment strategy"),
      treatmentStrategyDescription: z.string().optional().describe("Description of treatment strategy"),
      department: z.enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"]).optional().describe("Responsible department"),
      assigneeId: z.string().optional().describe("Assignee member ID"),
    },
    async (params) => {
      try {
        return ok(await request("/v1/risks", { method: "POST", body: params }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "update_risk",
    "Update risk details, scores, status, or treatment strategy",
    {
      riskId: z.string().describe("Risk ID"),
      title: z.string().optional().describe("Risk title"),
      description: z.string().optional().describe("Risk description"),
      category: z.enum(["customer", "fraud", "governance", "operations", "other", "people", "regulatory", "reporting", "resilience", "technology", "vendor_management"]).optional(),
      status: z.enum(["open", "pending", "closed", "archived"]).optional(),
      likelihood: z.enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"]).optional(),
      impact: z.enum(["insignificant", "minor", "moderate", "major", "severe"]).optional(),
      residualLikelihood: z.enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"]).optional(),
      residualImpact: z.enum(["insignificant", "minor", "moderate", "major", "severe"]).optional(),
      treatmentStrategy: z.enum(["accept", "avoid", "mitigate", "transfer"]).optional(),
      treatmentStrategyDescription: z.string().optional(),
      department: z.enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"]).optional(),
      assigneeId: z.string().nullable().optional(),
    },
    async ({ riskId, ...body }) => {
      try {
        return ok(await request(`/v1/risks/${riskId}`, { method: "PATCH", body }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "delete_risk",
    "Permanently delete a risk",
    { riskId: z.string().describe("Risk ID to delete") },
    async ({ riskId }) => {
      try {
        return ok(await request(`/v1/risks/${riskId}`, { method: "DELETE" }));
      } catch (e) {
        return err(e);
      }
    }
  );
};
