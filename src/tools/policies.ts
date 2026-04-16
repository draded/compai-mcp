import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "list_policies",
    "List all compliance policies for the organization",
    {},
    async () => {
      try {
        return ok(await request("/v1/policies"));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "get_policy",
    "Get a specific policy by ID including content, status, assignee, and review info",
    { policyId: z.string().describe("Policy ID") },
    async ({ policyId }) => {
      try {
        return ok(await request(`/v1/policies/${policyId}`));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "create_policy",
    "Create a new compliance policy",
    {
      name: z.string().describe("Policy name"),
      description: z.string().optional().describe("Policy description"),
      status: z
        .enum(["draft", "published", "needs_review"])
        .optional()
        .describe("Policy status"),
      frequency: z
        .enum(["monthly", "quarterly", "yearly"])
        .optional()
        .describe("Review frequency"),
      department: z
        .enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"])
        .optional()
        .describe("Department"),
      assigneeId: z.string().optional().describe("Assignee member ID"),
      approverId: z.string().optional().describe("Approver member ID"),
    },
    async (params) => {
      try {
        return ok(
          await request("/v1/policies", { method: "POST", body: params })
        );
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "update_policy",
    "Update a policy's name, description, status, frequency, department, assignee, or approver",
    {
      policyId: z.string().describe("Policy ID"),
      name: z.string().optional().describe("Policy name"),
      description: z.string().optional().describe("Policy description"),
      status: z
        .enum(["draft", "published", "needs_review"])
        .optional()
        .describe("Policy status"),
      frequency: z
        .enum(["monthly", "quarterly", "yearly"])
        .optional()
        .describe("Review frequency"),
      department: z
        .enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"])
        .optional()
        .describe("Department"),
      assigneeId: z.string().nullable().optional().describe("Assignee member ID"),
      approverId: z.string().nullable().optional().describe("Approver member ID"),
      isRequiredToSign: z
        .boolean()
        .optional()
        .describe("Whether policy requires signature"),
      isArchived: z.boolean().optional().describe("Whether policy is archived"),
    },
    async ({ policyId, ...body }) => {
      try {
        return ok(
          await request(`/v1/policies/${policyId}`, { method: "PATCH", body })
        );
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "delete_policy",
    "Permanently delete a policy",
    { policyId: z.string().describe("Policy ID to delete") },
    async ({ policyId }) => {
      try {
        return ok(
          await request(`/v1/policies/${policyId}`, { method: "DELETE" })
        );
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "get_policy_versions",
    "Get all versions for a policy in descending order",
    { policyId: z.string().describe("Policy ID") },
    async ({ policyId }) => {
      try {
        return ok(await request(`/v1/policies/${policyId}/versions`));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "regenerate_policy",
    "Regenerate policy content using AI",
    { policyId: z.string().describe("Policy ID") },
    async ({ policyId }) => {
      try {
        return ok(
          await request(`/v1/policies/${policyId}/regenerate`, { method: "POST" })
        );
      } catch (e) {
        return err(e);
      }
    }
  );
};
