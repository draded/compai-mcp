import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "get_current_user",
    "Get current user info, organizations, and pending invitations",
    {},
    async () => {
      try {
        return ok(await request("/v1/auth/me"));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "list_invitations",
    "List pending invitations for the organization",
    {},
    async () => {
      try {
        return ok(await request("/v1/auth/invitations"));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "revoke_invitation",
    "Revoke a pending invitation",
    { invitationId: z.string().describe("Invitation ID to revoke") },
    async ({ invitationId }) => {
      try {
        return ok(
          await request(`/v1/auth/invitations/${invitationId}`, {
            method: "DELETE",
          })
        );
      } catch (e) {
        return err(e);
      }
    }
  );
};
