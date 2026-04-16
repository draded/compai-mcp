import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "list_evidence_forms",
    "List all available pre-built evidence forms",
    {},
    async () => {
      try {
        return ok(await request("/v1/evidence-forms"));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "get_evidence_form",
    "Get a specific evidence form definition with submissions",
    { formId: z.string().describe("Evidence form ID") },
    async ({ formId }) => {
      try {
        return ok(await request(`/v1/evidence-forms/${formId}`));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "get_evidence_form_statuses",
    "Get submission statuses for all evidence forms",
    {},
    async () => {
      try {
        return ok(await request("/v1/evidence-forms/statuses"));
      } catch (e) {
        return err(e);
      }
    }
  );
};
