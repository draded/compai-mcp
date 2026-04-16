import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "list_roles",
    "List all roles for the organization (built-in and custom)",
    {},
    async () => {
      try {
        return ok(await request("/v1/roles"));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "create_role",
    "Create a custom role with specified permissions",
    {
      name: z.string().describe("Role name"),
      permissions: z
        .record(z.string(), z.boolean())
        .describe("Permission map (e.g. { 'read:tasks': true })"),
    },
    async (params) => {
      try {
        return ok(await request("/v1/roles", { method: "POST", body: params }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "update_role",
    "Update a custom role's name or permissions",
    {
      roleId: z.string().describe("Role ID"),
      name: z.string().optional().describe("Role name"),
      permissions: z.record(z.string(), z.boolean()).optional().describe("Permission map"),
    },
    async ({ roleId, ...body }) => {
      try {
        return ok(await request(`/v1/roles/${roleId}`, { method: "PATCH", body }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "delete_role",
    "Delete a custom role (fails if members are still assigned)",
    { roleId: z.string().describe("Role ID to delete") },
    async ({ roleId }) => {
      try {
        return ok(await request(`/v1/roles/${roleId}`, { method: "DELETE" }));
      } catch (e) {
        return err(e);
      }
    }
  );
};
