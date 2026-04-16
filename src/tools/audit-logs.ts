import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "get_audit_logs",
    "Get audit logs filtered by entity type and ID",
    {
      entityType: z.string().describe("Entity type (e.g. task, policy)"),
      entityId: z.string().describe("Entity ID"),
    },
    async ({ entityType, entityId }) => {
      try {
        return ok(await request("/v1/audit-logs", { query: { entityType, entityId } }));
      } catch (e) {
        return err(e);
      }
    }
  );
};
