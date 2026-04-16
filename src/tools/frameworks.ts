import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "list_frameworks",
    "List compliance framework instances for the organization (SOC 2, ISO 27001, HIPAA, GDPR, etc.)",
    {
      includeControls: z.string().optional().describe("Include controls (true/false)"),
      includeScores: z.string().optional().describe("Include compliance scores (true/false)"),
    },
    async (params) => {
      try {
        return ok(await request("/v1/frameworks", { query: params as Record<string, string | undefined> }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "get_framework",
    "Get a single framework instance with full detail",
    { frameworkId: z.string().describe("Framework instance ID") },
    async ({ frameworkId }) => {
      try {
        return ok(await request(`/v1/frameworks/${frameworkId}`));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "get_compliance_scores",
    "Get overview compliance scores across all frameworks",
    {},
    async () => {
      try {
        return ok(await request("/v1/frameworks/overview"));
      } catch (e) {
        return err(e);
      }
    }
  );
};
