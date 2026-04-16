import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "list_knowledge_base_documents",
    "List all knowledge base documents for the organization",
    {},
    async () => {
      try {
        return ok(await request("/v1/knowledge-base/documents"));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "list_manual_answers",
    "List all manual answers in the knowledge base",
    {},
    async () => {
      try {
        return ok(await request("/v1/knowledge-base/manual-answers"));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "save_manual_answer",
    "Save or update a manual answer in the knowledge base",
    {
      question: z.string().describe("The question"),
      answer: z.string().describe("The answer"),
    },
    async (params) => {
      try {
        return ok(
          await request("/v1/knowledge-base/manual-answers", { method: "POST", body: params })
        );
      } catch (e) {
        return err(e);
      }
    }
  );
};
