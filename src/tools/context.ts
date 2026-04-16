import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "list_context_entries",
    "Get all context entries for the organization (organizational context for compliance)",
    {},
    async () => {
      try {
        return ok(await request("/v1/context"));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "get_context_entry",
    "Get a specific context entry by ID",
    { contextId: z.string().describe("Context entry ID") },
    async ({ contextId }) => {
      try {
        return ok(await request(`/v1/context/${contextId}`));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "create_context_entry",
    "Create a new organizational context entry",
    {
      key: z.string().describe("Context entry key"),
      value: z.string().describe("Context entry value"),
    },
    async (params) => {
      try {
        return ok(await request("/v1/context", { method: "POST", body: params }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "update_context_entry",
    "Update a context entry",
    {
      contextId: z.string().describe("Context entry ID"),
      key: z.string().optional().describe("Context entry key"),
      value: z.string().optional().describe("Context entry value"),
    },
    async ({ contextId, ...body }) => {
      try {
        return ok(await request(`/v1/context/${contextId}`, { method: "PATCH", body }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "delete_context_entry",
    "Permanently delete a context entry",
    { contextId: z.string().describe("Context entry ID to delete") },
    async ({ contextId }) => {
      try {
        return ok(await request(`/v1/context/${contextId}`, { method: "DELETE" }));
      } catch (e) {
        return err(e);
      }
    }
  );
};
