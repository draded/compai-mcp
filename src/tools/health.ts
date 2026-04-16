import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "health_check",
    "Check the health status of the Comp AI API",
    {},
    async () => {
      try {
        return ok(await request("/v1/health"));
      } catch (e) {
        return err(e);
      }
    }
  );
};
