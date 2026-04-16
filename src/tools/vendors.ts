import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "list_vendors",
    "List all vendors for the organization with risk assessment status",
    {},
    async () => {
      try {
        return ok(await request("/v1/vendors"));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "get_vendor",
    "Get a specific vendor by ID including risk scores and assessment status",
    { vendorId: z.string().describe("Vendor ID") },
    async ({ vendorId }) => {
      try {
        return ok(await request(`/v1/vendors/${vendorId}`));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "create_vendor",
    "Create a new vendor with risk assessment details",
    {
      name: z.string().describe("Vendor name"),
      description: z.string().describe("Vendor description"),
      category: z
        .enum(["cloud", "infrastructure", "software_as_a_service", "finance", "marketing", "sales", "hr", "other"])
        .default("other")
        .describe("Vendor category"),
      status: z
        .enum(["not_assessed", "in_progress", "assessed"])
        .default("not_assessed")
        .describe("Assessment status"),
      inherentProbability: z
        .enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"])
        .default("very_unlikely")
        .describe("Inherent probability of risk before controls"),
      inherentImpact: z
        .enum(["insignificant", "minor", "moderate", "major", "severe"])
        .default("insignificant")
        .describe("Inherent impact of risk before controls"),
      residualProbability: z
        .enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"])
        .default("very_unlikely")
        .describe("Residual probability after controls"),
      residualImpact: z
        .enum(["insignificant", "minor", "moderate", "major", "severe"])
        .default("insignificant")
        .describe("Residual impact after controls"),
      website: z.string().optional().describe("Vendor website URL"),
      assigneeId: z.string().optional().describe("Assignee member ID"),
    },
    async (params) => {
      try {
        return ok(await request("/v1/vendors", { method: "POST", body: params }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "update_vendor",
    "Update vendor details, risk scores, or assessment status",
    {
      vendorId: z.string().describe("Vendor ID"),
      name: z.string().optional().describe("Vendor name"),
      description: z.string().optional().describe("Vendor description"),
      category: z
        .enum(["cloud", "infrastructure", "software_as_a_service", "finance", "marketing", "sales", "hr", "other"])
        .optional()
        .describe("Vendor category"),
      status: z.enum(["not_assessed", "in_progress", "assessed"]).optional().describe("Assessment status"),
      inherentProbability: z.enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"]).optional(),
      inherentImpact: z.enum(["insignificant", "minor", "moderate", "major", "severe"]).optional(),
      residualProbability: z.enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"]).optional(),
      residualImpact: z.enum(["insignificant", "minor", "moderate", "major", "severe"]).optional(),
      website: z.string().optional().describe("Vendor website URL"),
      assigneeId: z.string().nullable().optional().describe("Assignee member ID"),
    },
    async ({ vendorId, ...body }) => {
      try {
        return ok(await request(`/v1/vendors/${vendorId}`, { method: "PATCH", body }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "delete_vendor",
    "Permanently delete a vendor",
    { vendorId: z.string().describe("Vendor ID to delete") },
    async ({ vendorId }) => {
      try {
        return ok(await request(`/v1/vendors/${vendorId}`, { method: "DELETE" }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "trigger_vendor_risk_assessment",
    "Trigger an AI-powered vendor risk assessment",
    { vendorId: z.string().describe("Vendor ID") },
    async ({ vendorId }) => {
      try {
        return ok(await request(`/v1/vendors/${vendorId}/risk-assessment`, { method: "POST" }));
      } catch (e) {
        return err(e);
      }
    }
  );
};
