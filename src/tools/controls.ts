import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "list_controls",
    "List controls with relations, filterable by name with pagination",
    {
      page: z.string().optional().describe("Page number"),
      perPage: z.string().optional().describe("Items per page"),
      name: z.string().optional().describe("Filter by name (case-insensitive contains)"),
      sortBy: z.string().optional().describe("Sort field (default: name)"),
      sortDesc: z.string().optional().describe("Sort descending (true/false)"),
    },
    async (params) => {
      try {
        return ok(await request("/v1/controls", { query: params as Record<string, string | undefined> }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "get_control",
    "Get a control detail with progress",
    { controlId: z.string().describe("Control ID") },
    async ({ controlId }) => {
      try {
        return ok(await request(`/v1/controls/${controlId}`));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "create_control",
    "Create a new control",
    {
      name: z.string().describe("Control name"),
      description: z.string().optional().describe("Control description"),
    },
    async (params) => {
      try {
        return ok(await request("/v1/controls", { method: "POST", body: params }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "delete_control",
    "Delete a control",
    { controlId: z.string().describe("Control ID to delete") },
    async ({ controlId }) => {
      try {
        return ok(await request(`/v1/controls/${controlId}`, { method: "DELETE" }));
      } catch (e) {
        return err(e);
      }
    }
  );
};
