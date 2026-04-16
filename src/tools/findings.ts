import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "list_findings",
    "List all findings (audit observations) for the organization",
    {},
    async () => {
      try {
        return ok(await request("/v1/findings"));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "get_finding",
    "Get a specific finding by ID",
    { findingId: z.string().describe("Finding ID") },
    async ({ findingId }) => {
      try {
        return ok(await request(`/v1/findings/${findingId}`));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "create_finding",
    "Create a new finding for a task (Auditor or Platform Admin only)",
    {
      taskId: z.string().describe("Task ID this finding relates to"),
      title: z.string().describe("Finding title"),
      description: z.string().optional().describe("Finding description"),
      severity: z.string().optional().describe("Finding severity"),
    },
    async (params) => {
      try {
        return ok(await request("/v1/findings", { method: "POST", body: params }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "update_finding",
    "Update a finding. Status transition rules apply based on user role.",
    {
      findingId: z.string().describe("Finding ID"),
      title: z.string().optional().describe("Finding title"),
      description: z.string().optional().describe("Finding description"),
      status: z.string().optional().describe("Finding status"),
      severity: z.string().optional().describe("Finding severity"),
    },
    async ({ findingId, ...body }) => {
      try {
        return ok(await request(`/v1/findings/${findingId}`, { method: "PATCH", body }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "delete_finding",
    "Delete a finding (Auditor or Platform Admin only)",
    { findingId: z.string().describe("Finding ID to delete") },
    async ({ findingId }) => {
      try {
        return ok(await request(`/v1/findings/${findingId}`, { method: "DELETE" }));
      } catch (e) {
        return err(e);
      }
    }
  );
};
