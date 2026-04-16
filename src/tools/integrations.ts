import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "list_integration_connections",
    "List all integration connections for the organization",
    {},
    async () => {
      try {
        return ok(await request("/v1/integrations/connections"));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "list_integration_providers",
    "List available integration providers",
    {},
    async () => {
      try {
        return ok(await request("/v1/integrations/connections/providers"));
      } catch (e) {
        return err(e);
      }
    }
  );
};
