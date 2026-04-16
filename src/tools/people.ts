import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "list_people",
    "List all members of the organization with their user info, roles, and departments",
    {
      includeDeactivated: z
        .string()
        .default("false")
        .describe("Include deactivated members (true/false)"),
    },
    async ({ includeDeactivated }) => {
      try {
        return ok(
          await request("/v1/people", { query: { includeDeactivated } })
        );
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "get_person",
    "Get a specific member by ID",
    { personId: z.string().describe("Member ID") },
    async ({ personId }) => {
      try {
        return ok(await request(`/v1/people/${personId}`));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "create_member",
    "Add a new member to the organization",
    {
      userId: z.string().describe("User ID to add as member"),
      role: z.string().optional().describe("Member role"),
      department: z
        .enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"])
        .optional()
        .describe("Department"),
    },
    async (params) => {
      try {
        return ok(
          await request("/v1/people", { method: "POST", body: params })
        );
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "update_member",
    "Update a member's role, department, or other properties",
    {
      personId: z.string().describe("Member ID"),
      role: z.string().optional().describe("New role"),
      department: z
        .enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"])
        .optional()
        .describe("New department"),
      jobTitle: z.string().optional().describe("Job title"),
    },
    async ({ personId, ...body }) => {
      try {
        return ok(
          await request(`/v1/people/${personId}`, { method: "PATCH", body })
        );
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "delete_member",
    "Remove a member from the organization permanently",
    { personId: z.string().describe("Member ID to delete") },
    async ({ personId }) => {
      try {
        return ok(
          await request(`/v1/people/${personId}`, { method: "DELETE" })
        );
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "invite_members",
    "Invite members to the organization via email",
    {
      emails: z.array(z.string()).describe("Email addresses to invite"),
      role: z.string().optional().describe("Role for invited members"),
    },
    async (params) => {
      try {
        return ok(
          await request("/v1/people/invite", { method: "POST", body: params })
        );
      } catch (e) {
        return err(e);
      }
    }
  );
};
