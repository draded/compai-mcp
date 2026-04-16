#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = process.env.COMPAI_BASE_URL || "https://api.trycomp.ai";
const API_KEY = process.env.COMPAI_API_KEY || "";

async function request(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    query?: Record<string, string | undefined>;
  } = {}
): Promise<unknown> {
  const { method = "GET", body, query } = options;
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = {
    "X-API-Key": API_KEY,
    Accept: "application/json",
  };
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Comp AI API ${res.status}: ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function ok(data: unknown) {
  return {
    content: [
      { type: "text" as const, text: JSON.stringify(data, null, 2) },
    ],
  };
}

function err(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return { content: [{ type: "text" as const, text: msg }], isError: true };
}

const server = new McpServer({
  name: "compai",
  version: "1.0.0",
});

// ── Auth ──────────────────────────────────────────────────────────────

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

// ── Organization ──────────────────────────────────────────────────────

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

// ── API Keys ──────────────────────────────────────────────────────────

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

// ── People ────────────────────────────────────────────────────────────

server.tool(
  "list_people",
  "List all members of the organization with their user info, roles, and departments",
  {
    includeDeactivated: z
      .string()
      .default("false")
      .describe("Include deactivated members (true/false)"),
  },
  async ({ includeDeactivated }) => {
    try {
      return ok(
        await request("/v1/people", { query: { includeDeactivated } })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "get_person",
  "Get a specific member by ID",
  { personId: z.string().describe("Member ID") },
  async ({ personId }) => {
    try {
      return ok(await request(`/v1/people/${personId}`));
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "create_member",
  "Add a new member to the organization",
  {
    userId: z.string().describe("User ID to add as member"),
    role: z.string().optional().describe("Member role"),
    department: z
      .enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"])
      .optional()
      .describe("Department"),
  },
  async (params) => {
    try {
      return ok(
        await request("/v1/people", { method: "POST", body: params })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "update_member",
  "Update a member's role, department, or other properties",
  {
    personId: z.string().describe("Member ID"),
    role: z.string().optional().describe("New role"),
    department: z
      .enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"])
      .optional()
      .describe("New department"),
    jobTitle: z.string().optional().describe("Job title"),
  },
  async ({ personId, ...body }) => {
    try {
      return ok(
        await request(`/v1/people/${personId}`, { method: "PATCH", body })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "delete_member",
  "Remove a member from the organization permanently",
  { personId: z.string().describe("Member ID to delete") },
  async ({ personId }) => {
    try {
      return ok(
        await request(`/v1/people/${personId}`, { method: "DELETE" })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "invite_members",
  "Invite members to the organization via email",
  {
    emails: z.array(z.string()).describe("Email addresses to invite"),
    role: z.string().optional().describe("Role for invited members"),
  },
  async (params) => {
    try {
      return ok(
        await request("/v1/people/invite", { method: "POST", body: params })
      );
    } catch (e) {
      return err(e);
    }
  }
);

// ── Tasks ─────────────────────────────────────────────────────────────

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
      return ok(
        await request(`/v1/tasks/${taskId}`, { method: "DELETE" })
      );
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
        await request(`/v1/tasks/${taskId}/reject`, {
          method: "POST",
          body,
        })
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

// ── Policies ──────────────────────────────────────────────────────────

server.tool(
  "list_policies",
  "List all compliance policies for the organization",
  {},
  async () => {
    try {
      return ok(await request("/v1/policies"));
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "get_policy",
  "Get a specific policy by ID including content, status, assignee, and review info",
  { policyId: z.string().describe("Policy ID") },
  async ({ policyId }) => {
    try {
      return ok(await request(`/v1/policies/${policyId}`));
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "create_policy",
  "Create a new compliance policy",
  {
    name: z.string().describe("Policy name"),
    description: z.string().optional().describe("Policy description"),
    status: z
      .enum(["draft", "published", "needs_review"])
      .optional()
      .describe("Policy status"),
    frequency: z
      .enum(["monthly", "quarterly", "yearly"])
      .optional()
      .describe("Review frequency"),
    department: z
      .enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"])
      .optional()
      .describe("Department"),
    assigneeId: z.string().optional().describe("Assignee member ID"),
    approverId: z.string().optional().describe("Approver member ID"),
  },
  async (params) => {
    try {
      return ok(
        await request("/v1/policies", { method: "POST", body: params })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "update_policy",
  "Update a policy's name, description, status, frequency, department, assignee, or approver",
  {
    policyId: z.string().describe("Policy ID"),
    name: z.string().optional().describe("Policy name"),
    description: z.string().optional().describe("Policy description"),
    status: z
      .enum(["draft", "published", "needs_review"])
      .optional()
      .describe("Policy status"),
    frequency: z
      .enum(["monthly", "quarterly", "yearly"])
      .optional()
      .describe("Review frequency"),
    department: z
      .enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"])
      .optional()
      .describe("Department"),
    assigneeId: z.string().nullable().optional().describe("Assignee member ID"),
    approverId: z.string().nullable().optional().describe("Approver member ID"),
    isRequiredToSign: z
      .boolean()
      .optional()
      .describe("Whether policy requires signature"),
    isArchived: z.boolean().optional().describe("Whether policy is archived"),
  },
  async ({ policyId, ...body }) => {
    try {
      return ok(
        await request(`/v1/policies/${policyId}`, { method: "PATCH", body })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "delete_policy",
  "Permanently delete a policy",
  { policyId: z.string().describe("Policy ID to delete") },
  async ({ policyId }) => {
    try {
      return ok(
        await request(`/v1/policies/${policyId}`, { method: "DELETE" })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "get_policy_versions",
  "Get all versions for a policy in descending order",
  { policyId: z.string().describe("Policy ID") },
  async ({ policyId }) => {
    try {
      return ok(await request(`/v1/policies/${policyId}/versions`));
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "regenerate_policy",
  "Regenerate policy content using AI",
  { policyId: z.string().describe("Policy ID") },
  async ({ policyId }) => {
    try {
      return ok(
        await request(`/v1/policies/${policyId}/regenerate`, {
          method: "POST",
        })
      );
    } catch (e) {
      return err(e);
    }
  }
);

// ── Vendors ───────────────────────────────────────────────────────────

server.tool(
  "list_vendors",
  "List all vendors for the organization with risk assessment status",
  {},
  async () => {
    try {
      return ok(await request("/v1/vendors"));
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "get_vendor",
  "Get a specific vendor by ID including risk scores and assessment status",
  { vendorId: z.string().describe("Vendor ID") },
  async ({ vendorId }) => {
    try {
      return ok(await request(`/v1/vendors/${vendorId}`));
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "create_vendor",
  "Create a new vendor with risk assessment details",
  {
    name: z.string().describe("Vendor name"),
    description: z.string().describe("Vendor description"),
    category: z
      .enum([
        "cloud",
        "infrastructure",
        "software_as_a_service",
        "finance",
        "marketing",
        "sales",
        "hr",
        "other",
      ])
      .default("other")
      .describe("Vendor category"),
    status: z
      .enum(["not_assessed", "in_progress", "assessed"])
      .default("not_assessed")
      .describe("Assessment status"),
    inherentProbability: z
      .enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"])
      .default("very_unlikely")
      .describe("Inherent probability of risk before controls"),
    inherentImpact: z
      .enum(["insignificant", "minor", "moderate", "major", "severe"])
      .default("insignificant")
      .describe("Inherent impact of risk before controls"),
    residualProbability: z
      .enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"])
      .default("very_unlikely")
      .describe("Residual probability after controls"),
    residualImpact: z
      .enum(["insignificant", "minor", "moderate", "major", "severe"])
      .default("insignificant")
      .describe("Residual impact after controls"),
    website: z.string().optional().describe("Vendor website URL"),
    assigneeId: z.string().optional().describe("Assignee member ID"),
  },
  async (params) => {
    try {
      return ok(
        await request("/v1/vendors", { method: "POST", body: params })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "update_vendor",
  "Update vendor details, risk scores, or assessment status",
  {
    vendorId: z.string().describe("Vendor ID"),
    name: z.string().optional().describe("Vendor name"),
    description: z.string().optional().describe("Vendor description"),
    category: z
      .enum([
        "cloud",
        "infrastructure",
        "software_as_a_service",
        "finance",
        "marketing",
        "sales",
        "hr",
        "other",
      ])
      .optional()
      .describe("Vendor category"),
    status: z
      .enum(["not_assessed", "in_progress", "assessed"])
      .optional()
      .describe("Assessment status"),
    inherentProbability: z
      .enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"])
      .optional(),
    inherentImpact: z
      .enum(["insignificant", "minor", "moderate", "major", "severe"])
      .optional(),
    residualProbability: z
      .enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"])
      .optional(),
    residualImpact: z
      .enum(["insignificant", "minor", "moderate", "major", "severe"])
      .optional(),
    website: z.string().optional().describe("Vendor website URL"),
    assigneeId: z.string().nullable().optional().describe("Assignee member ID"),
  },
  async ({ vendorId, ...body }) => {
    try {
      return ok(
        await request(`/v1/vendors/${vendorId}`, { method: "PATCH", body })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "delete_vendor",
  "Permanently delete a vendor",
  { vendorId: z.string().describe("Vendor ID to delete") },
  async ({ vendorId }) => {
    try {
      return ok(
        await request(`/v1/vendors/${vendorId}`, { method: "DELETE" })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "trigger_vendor_risk_assessment",
  "Trigger an AI-powered vendor risk assessment",
  { vendorId: z.string().describe("Vendor ID") },
  async ({ vendorId }) => {
    try {
      return ok(
        await request(`/v1/vendors/${vendorId}/risk-assessment`, {
          method: "POST",
        })
      );
    } catch (e) {
      return err(e);
    }
  }
);

// ── Risks ─────────────────────────────────────────────────────────────

server.tool(
  "list_risks",
  "List all risks for the organization with optional filtering and pagination",
  {
    title: z.string().optional().describe("Search by title (case-insensitive)"),
    status: z
      .enum(["open", "pending", "closed", "archived"])
      .optional()
      .describe("Filter by status"),
    category: z
      .enum([
        "customer",
        "fraud",
        "governance",
        "operations",
        "other",
        "people",
        "regulatory",
        "reporting",
        "resilience",
        "technology",
        "vendor_management",
      ])
      .optional()
      .describe("Filter by category"),
    department: z
      .enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"])
      .optional()
      .describe("Filter by department"),
    assigneeId: z.string().optional().describe("Filter by assignee member ID"),
    page: z.string().optional().describe("Page number (1-indexed)"),
    perPage: z.string().optional().describe("Items per page (max 250)"),
    sort: z
      .enum(["createdAt", "updatedAt", "title", "status"])
      .optional()
      .describe("Sort field"),
    sortDirection: z
      .enum(["asc", "desc"])
      .optional()
      .describe("Sort direction"),
  },
  async (params) => {
    try {
      return ok(
        await request("/v1/risks", {
          query: params as Record<string, string | undefined>,
        })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "get_risk",
  "Get a specific risk by ID with full detail",
  { riskId: z.string().describe("Risk ID") },
  async ({ riskId }) => {
    try {
      return ok(await request(`/v1/risks/${riskId}`));
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "create_risk",
  "Create a new risk entry for the organization",
  {
    title: z.string().describe("Risk title"),
    description: z.string().describe("Detailed risk description"),
    category: z
      .enum([
        "customer",
        "fraud",
        "governance",
        "operations",
        "other",
        "people",
        "regulatory",
        "reporting",
        "resilience",
        "technology",
        "vendor_management",
      ])
      .describe("Risk category"),
    status: z
      .enum(["open", "pending", "closed", "archived"])
      .default("open")
      .describe("Risk status"),
    likelihood: z
      .enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"])
      .default("very_unlikely")
      .describe("Likelihood of occurrence"),
    impact: z
      .enum(["insignificant", "minor", "moderate", "major", "severe"])
      .default("insignificant")
      .describe("Impact if materialized"),
    residualLikelihood: z
      .enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"])
      .default("very_unlikely")
      .describe("Residual likelihood after treatment"),
    residualImpact: z
      .enum(["insignificant", "minor", "moderate", "major", "severe"])
      .default("insignificant")
      .describe("Residual impact after treatment"),
    treatmentStrategy: z
      .enum(["accept", "avoid", "mitigate", "transfer"])
      .default("accept")
      .describe("Risk treatment strategy"),
    treatmentStrategyDescription: z
      .string()
      .optional()
      .describe("Description of treatment strategy"),
    department: z
      .enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"])
      .optional()
      .describe("Responsible department"),
    assigneeId: z.string().optional().describe("Assignee member ID"),
  },
  async (params) => {
    try {
      return ok(
        await request("/v1/risks", { method: "POST", body: params })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "update_risk",
  "Update risk details, scores, status, or treatment strategy",
  {
    riskId: z.string().describe("Risk ID"),
    title: z.string().optional().describe("Risk title"),
    description: z.string().optional().describe("Risk description"),
    category: z
      .enum([
        "customer",
        "fraud",
        "governance",
        "operations",
        "other",
        "people",
        "regulatory",
        "reporting",
        "resilience",
        "technology",
        "vendor_management",
      ])
      .optional(),
    status: z.enum(["open", "pending", "closed", "archived"]).optional(),
    likelihood: z
      .enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"])
      .optional(),
    impact: z
      .enum(["insignificant", "minor", "moderate", "major", "severe"])
      .optional(),
    residualLikelihood: z
      .enum(["very_unlikely", "unlikely", "possible", "likely", "very_likely"])
      .optional(),
    residualImpact: z
      .enum(["insignificant", "minor", "moderate", "major", "severe"])
      .optional(),
    treatmentStrategy: z
      .enum(["accept", "avoid", "mitigate", "transfer"])
      .optional(),
    treatmentStrategyDescription: z.string().optional(),
    department: z
      .enum(["none", "admin", "gov", "hr", "it", "itsm", "qms"])
      .optional(),
    assigneeId: z.string().nullable().optional(),
  },
  async ({ riskId, ...body }) => {
    try {
      return ok(
        await request(`/v1/risks/${riskId}`, { method: "PATCH", body })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "delete_risk",
  "Permanently delete a risk",
  { riskId: z.string().describe("Risk ID to delete") },
  async ({ riskId }) => {
    try {
      return ok(
        await request(`/v1/risks/${riskId}`, { method: "DELETE" })
      );
    } catch (e) {
      return err(e);
    }
  }
);

// ── Frameworks ────────────────────────────────────────────────────────

server.tool(
  "list_frameworks",
  "List compliance framework instances for the organization (SOC 2, ISO 27001, HIPAA, GDPR, etc.)",
  {
    includeControls: z
      .string()
      .optional()
      .describe("Include controls (true/false)"),
    includeScores: z
      .string()
      .optional()
      .describe("Include compliance scores (true/false)"),
  },
  async (params) => {
    try {
      return ok(
        await request("/v1/frameworks", {
          query: params as Record<string, string | undefined>,
        })
      );
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

// ── Controls ──────────────────────────────────────────────────────────

server.tool(
  "list_controls",
  "List controls with relations, filterable by name with pagination",
  {
    page: z.string().optional().describe("Page number"),
    perPage: z.string().optional().describe("Items per page"),
    name: z
      .string()
      .optional()
      .describe("Filter by name (case-insensitive contains)"),
    sortBy: z.string().optional().describe("Sort field (default: name)"),
    sortDesc: z
      .string()
      .optional()
      .describe("Sort descending (true/false)"),
  },
  async (params) => {
    try {
      return ok(
        await request("/v1/controls", {
          query: params as Record<string, string | undefined>,
        })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "get_control",
  "Get a control detail with progress",
  { controlId: z.string().describe("Control ID") },
  async ({ controlId }) => {
    try {
      return ok(await request(`/v1/controls/${controlId}`));
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "create_control",
  "Create a new control",
  {
    name: z.string().describe("Control name"),
    description: z.string().optional().describe("Control description"),
  },
  async (params) => {
    try {
      return ok(
        await request("/v1/controls", { method: "POST", body: params })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "delete_control",
  "Delete a control",
  { controlId: z.string().describe("Control ID to delete") },
  async ({ controlId }) => {
    try {
      return ok(
        await request(`/v1/controls/${controlId}`, { method: "DELETE" })
      );
    } catch (e) {
      return err(e);
    }
  }
);

// ── Evidence Forms ────────────────────────────────────────────────────

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

// ── Findings ──────────────────────────────────────────────────────────

server.tool(
  "list_findings",
  "List all findings (audit observations) for the organization",
  {},
  async () => {
    try {
      return ok(await request("/v1/findings"));
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "get_finding",
  "Get a specific finding by ID",
  { findingId: z.string().describe("Finding ID") },
  async ({ findingId }) => {
    try {
      return ok(await request(`/v1/findings/${findingId}`));
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "create_finding",
  "Create a new finding for a task (Auditor or Platform Admin only)",
  {
    taskId: z.string().describe("Task ID this finding relates to"),
    title: z.string().describe("Finding title"),
    description: z.string().optional().describe("Finding description"),
    severity: z.string().optional().describe("Finding severity"),
  },
  async (params) => {
    try {
      return ok(
        await request("/v1/findings", { method: "POST", body: params })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "update_finding",
  "Update a finding. Status transition rules apply based on user role.",
  {
    findingId: z.string().describe("Finding ID"),
    title: z.string().optional().describe("Finding title"),
    description: z.string().optional().describe("Finding description"),
    status: z.string().optional().describe("Finding status"),
    severity: z.string().optional().describe("Finding severity"),
  },
  async ({ findingId, ...body }) => {
    try {
      return ok(
        await request(`/v1/findings/${findingId}`, { method: "PATCH", body })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "delete_finding",
  "Delete a finding (Auditor or Platform Admin only)",
  { findingId: z.string().describe("Finding ID to delete") },
  async ({ findingId }) => {
    try {
      return ok(
        await request(`/v1/findings/${findingId}`, { method: "DELETE" })
      );
    } catch (e) {
      return err(e);
    }
  }
);

// ── Comments ──────────────────────────────────────────────────────────

server.tool(
  "get_comments",
  "Get all comments for an entity (task, policy, vendor, etc.)",
  {
    entityType: z
      .string()
      .describe("Entity type (e.g. task, policy, vendor)"),
    entityId: z.string().describe("Entity ID"),
  },
  async ({ entityType, entityId }) => {
    try {
      return ok(
        await request("/v1/comments", {
          query: { entityType, entityId },
        })
      );
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
      return ok(
        await request("/v1/comments", { method: "POST", body: params })
      );
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
      return ok(
        await request(`/v1/comments/${commentId}`, { method: "PATCH", body })
      );
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
      return ok(
        await request(`/v1/comments/${commentId}`, { method: "DELETE" })
      );
    } catch (e) {
      return err(e);
    }
  }
);

// ── Context ───────────────────────────────────────────────────────────

server.tool(
  "list_context_entries",
  "Get all context entries for the organization (organizational context for compliance)",
  {},
  async () => {
    try {
      return ok(await request("/v1/context"));
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "get_context_entry",
  "Get a specific context entry by ID",
  { contextId: z.string().describe("Context entry ID") },
  async ({ contextId }) => {
    try {
      return ok(await request(`/v1/context/${contextId}`));
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "create_context_entry",
  "Create a new organizational context entry",
  {
    key: z.string().describe("Context entry key"),
    value: z.string().describe("Context entry value"),
  },
  async (params) => {
    try {
      return ok(
        await request("/v1/context", { method: "POST", body: params })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "update_context_entry",
  "Update a context entry",
  {
    contextId: z.string().describe("Context entry ID"),
    key: z.string().optional().describe("Context entry key"),
    value: z.string().optional().describe("Context entry value"),
  },
  async ({ contextId, ...body }) => {
    try {
      return ok(
        await request(`/v1/context/${contextId}`, { method: "PATCH", body })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "delete_context_entry",
  "Permanently delete a context entry",
  { contextId: z.string().describe("Context entry ID to delete") },
  async ({ contextId }) => {
    try {
      return ok(
        await request(`/v1/context/${contextId}`, { method: "DELETE" })
      );
    } catch (e) {
      return err(e);
    }
  }
);

// ── Roles ─────────────────────────────────────────────────────────────

server.tool(
  "list_roles",
  "List all roles for the organization (built-in and custom)",
  {},
  async () => {
    try {
      return ok(await request("/v1/roles"));
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "create_role",
  "Create a custom role with specified permissions",
  {
    name: z.string().describe("Role name"),
    permissions: z
      .record(z.string(), z.boolean())
      .describe("Permission map (e.g. { 'read:tasks': true })"),
  },
  async (params) => {
    try {
      return ok(
        await request("/v1/roles", { method: "POST", body: params })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "update_role",
  "Update a custom role's name or permissions",
  {
    roleId: z.string().describe("Role ID"),
    name: z.string().optional().describe("Role name"),
    permissions: z
      .record(z.string(), z.boolean())
      .optional()
      .describe("Permission map"),
  },
  async ({ roleId, ...body }) => {
    try {
      return ok(
        await request(`/v1/roles/${roleId}`, { method: "PATCH", body })
      );
    } catch (e) {
      return err(e);
    }
  }
);

server.tool(
  "delete_role",
  "Delete a custom role (fails if members are still assigned)",
  { roleId: z.string().describe("Role ID to delete") },
  async ({ roleId }) => {
    try {
      return ok(
        await request(`/v1/roles/${roleId}`, { method: "DELETE" })
      );
    } catch (e) {
      return err(e);
    }
  }
);

// ── Audit Logs ────────────────────────────────────────────────────────

server.tool(
  "get_audit_logs",
  "Get audit logs filtered by entity type and ID",
  {
    entityType: z.string().describe("Entity type (e.g. task, policy)"),
    entityId: z.string().describe("Entity ID"),
  },
  async ({ entityType, entityId }) => {
    try {
      return ok(
        await request("/v1/audit-logs", {
          query: { entityType, entityId },
        })
      );
    } catch (e) {
      return err(e);
    }
  }
);

// ── Integrations ──────────────────────────────────────────────────────

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

// ── Knowledge Base ────────────────────────────────────────────────────

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
        await request("/v1/knowledge-base/manual-answers", {
          method: "POST",
          body: params,
        })
      );
    } catch (e) {
      return err(e);
    }
  }
);

// ── Health ─────────────────────────────────────────────────────────────

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

// ── Start Server ──────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
