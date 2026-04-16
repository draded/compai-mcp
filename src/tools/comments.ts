import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "get_comments",
    "Get all comments for an entity (task, policy, vendor, etc.)",
    {
      entityType: z.string().describe("Entity type (e.g. task, policy, vendor)"),
      entityId: z.string().describe("Entity ID"),
    },
    async ({ entityType, entityId }) => {
      try {
        return ok(await request("/v1/comments", { query: { entityType, entityId } }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "create_comment",
    "Create a comment on an entity (task, policy, vendor, etc.)",
    {
      entityType: z.string().describe("Entity type"),
      entityId: z.string().describe("Entity ID"),
      content: z.string().describe("Comment content"),
    },
    async (params) => {
      try {
        return ok(await request("/v1/comments", { method: "POST", body: params }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "update_comment",
    "Update a comment's content (author only)",
    {
      commentId: z.string().describe("Comment ID"),
      content: z.string().describe("Updated comment content"),
    },
    async ({ commentId, ...body }) => {
      try {
        return ok(await request(`/v1/comments/${commentId}`, { method: "PATCH", body }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "delete_comment",
    "Delete a comment and all its attachments (author only)",
    { commentId: z.string().describe("Comment ID to delete") },
    async ({ commentId }) => {
      try {
        return ok(await request(`/v1/comments/${commentId}`, { method: "DELETE" }));
      } catch (e) {
        return err(e);
      }
    }
  );
};
