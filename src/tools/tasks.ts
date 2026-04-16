import { z } from "zod";
import { request, ok, err, type RegisterTools } from "../client.js";

export const register: RegisterTools = (server) => {
  server.tool(
    "list_tasks",
    "List all compliance tasks for the organization. Employees/contractors see only assigned tasks.",
    {
      includeRelations: z
        .string()
        .optional()
        .describe("Include controls and automations with runs"),
    },
    async ({ includeRelations }) => {
      try {
        return ok(
          await request("/v1/tasks", { query: { includeRelations } })
        );
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "get_task",
    "Get a specific task by ID with full detail",
    { taskId: z.string().describe("Task ID") },
    async ({ taskId }) => {
      try {
        return ok(await request(`/v1/tasks/${taskId}`));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "create_task",
    "Create a new compliance task",
    {
      title: z.string().describe("Task title"),
      description: z.string().describe("Task description"),
      assigneeId: z.string().optional().describe("Assignee member ID"),
      frequency: z
        .enum(["daily", "weekly", "monthly", "quarterly", "yearly"])
        .optional()
        .describe("Review frequency"),
      department: z
        .enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"])
        .optional()
        .describe("Department"),
      controlIds: z
        .array(z.string())
        .optional()
        .describe("Control IDs to link"),
      vendorId: z
        .string()
        .optional()
        .describe("Vendor ID to connect this task to"),
    },
    async (params) => {
      try {
        return ok(
          await request("/v1/tasks", { method: "POST", body: params })
        );
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "update_task",
    "Update a task's title, description, status, assignee, approver, frequency, department, or review date",
    {
      taskId: z.string().describe("Task ID"),
      title: z.string().optional().describe("Task title"),
      description: z.string().optional().describe("Task description"),
      status: z
        .enum(["todo", "in_progress", "in_review", "done", "not_relevant", "failed"])
        .optional()
        .describe("Task status"),
      assigneeId: z
        .string()
        .nullable()
        .optional()
        .describe("Assignee member ID"),
      approverId: z
        .string()
        .nullable()
        .optional()
        .describe("Approver member ID"),
      frequency: z
        .enum(["daily", "weekly", "monthly", "quarterly", "yearly"])
        .optional()
        .describe("Review frequency"),
      department: z
        .enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"])
        .optional()
        .describe("Department"),
      reviewDate: z.string().optional().describe("Review date (ISO 8601)"),
    },
    async ({ taskId, ...body }) => {
      try {
        return ok(
          await request(`/v1/tasks/${taskId}`, { method: "PATCH", body })
        );
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "delete_task",
    "Delete a task by ID",
    { taskId: z.string().describe("Task ID to delete") },
    async ({ taskId }) => {
      try {
        return ok(await request(`/v1/tasks/${taskId}`, { method: "DELETE" }));
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "approve_task",
    "Approve a task that is in review",
    { taskId: z.string().describe("Task ID to approve") },
    async ({ taskId }) => {
      try {
        return ok(
          await request(`/v1/tasks/${taskId}/approve`, { method: "POST" })
        );
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "reject_task",
    "Reject a task that is in review",
    {
      taskId: z.string().describe("Task ID to reject"),
      reason: z.string().optional().describe("Rejection reason"),
    },
    async ({ taskId, ...body }) => {
      try {
        return ok(
          await request(`/v1/tasks/${taskId}/reject`, { method: "POST", body })
        );
      } catch (e) {
        return err(e);
      }
    }
  );

  server.tool(
    "get_task_activity",
    "Get audit log activity for a task",
    { taskId: z.string().describe("Task ID") },
    async ({ taskId }) => {
      try {
        return ok(await request(`/v1/tasks/${taskId}/activity`));
      } catch (e) {
        return err(e);
      }
    }
  );
};
