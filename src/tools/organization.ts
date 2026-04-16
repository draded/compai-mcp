import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "get_organization",
    "Get organization information including name, slug, logo, website, access status, and primary color",
    {
      includeOwnership: z
        .string()
        .optional()
        .describe("Include ownership data for transfer UI"),
    },
    async ({ includeOwnership }) => {
      try {
        return ok(
          await request("/v1/organization", { query: { includeOwnership } })
        );
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "update_organization",
    "Update organization details (name, website, primaryColor, etc.)",
    {
      name: z.string().optional().describe("Organization name"),
      website: z.string().optional().describe("Organization website URL"),
      primaryColor: z
        .string()
        .optional()
        .describe("Primary color in hex format"),
    },
    async (params) => {
      try {
        return ok(
          await request("/v1/organization", { method: "PATCH", body: params })
        );
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "delete_organization",
    "Permanently delete the organization. This cannot be undone.",
    {},
    async () => {
      try {
        return ok(await request("/v1/organization", { method: "DELETE" }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "list_api_keys",
    "List active API keys for the organization",
    {},
    async () => {
      try {
        return ok(await request("/v1/organization/api-keys"));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "create_api_key",
    "Create a new API key for the organization",
    {
      name: z.string().describe("Name for the API key"),
      scopes: z
        .array(z.string())
        .optional()
        .describe("Array of permission scopes"),
    },
    async (params) => {
      try {
        return ok(
          await request("/v1/organization/api-keys", {
            method: "POST",
            body: params,
          })
        );
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "revoke_api_key",
    "Revoke an API key",
    { apiKeyId: z.string().describe("API key ID to revoke") },
    async ({ apiKeyId }) => {
      try {
        return ok(
          await request(`/v1/organization/api-keys/${apiKeyId}`, {
            method: "DELETE",
          })
        );
      } catch (e) {
        return err(e);
      }
    }
  );
};
