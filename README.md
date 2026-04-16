# Comp AI MCP Server

An MCP (Model Context Protocol) server for the [Comp AI](https://trycomp.ai) compliance platform. Gives AI assistants like Claude, Cursor, and others direct access to your compliance data — tasks, policies, risks, vendors, frameworks, controls, and more.

## What is Comp AI?

[Comp AI](https://trycomp.ai) is an open-source compliance platform that automates SOC 2, ISO 27001, HIPAA, and GDPR compliance. This MCP server wraps their REST API so your AI tools can read and manage your compliance posture directly.

## Tools (76)

| Category | Tools | Description |
|---|---|---|
| **Auth** | `get_current_user`, `list_invitations`, `revoke_invitation` | Current user info, org invitations |
| **Organization** | `get_organization`, `update_organization`, `delete_organization` | Org details, settings, branding |
| **API Keys** | `list_api_keys`, `create_api_key`, `revoke_api_key` | Manage API keys |
| **People** | `list_people`, `get_person`, `create_member`, `update_member`, `delete_member`, `invite_members` | Team members, roles, invites |
| **Tasks** | `list_tasks`, `get_task`, `create_task`, `update_task`, `delete_task`, `approve_task`, `reject_task`, `get_task_activity` | Compliance tasks and approvals |
| **Policies** | `list_policies`, `get_policy`, `create_policy`, `update_policy`, `delete_policy`, `get_policy_versions`, `regenerate_policy` | Policy management and AI regeneration |
| **Vendors** | `list_vendors`, `get_vendor`, `create_vendor`, `update_vendor`, `delete_vendor`, `trigger_vendor_risk_assessment` | Vendor management and risk assessment |
| **Risks** | `list_risks`, `get_risk`, `create_risk`, `update_risk`, `delete_risk` | Risk register with filtering and pagination |
| **Frameworks** | `list_frameworks`, `get_framework`, `get_compliance_scores` | SOC 2, ISO 27001, HIPAA, GDPR frameworks |
| **Controls** | `list_controls`, `get_control`, `create_control`, `delete_control` | Compliance controls |
| **Evidence** | `list_evidence_forms`, `get_evidence_form`, `get_evidence_form_statuses` | Evidence collection forms |
| **Findings** | `list_findings`, `get_finding`, `create_finding`, `update_finding`, `delete_finding` | Audit findings |
| **Comments** | `get_comments`, `create_comment`, `update_comment`, `delete_comment` | Comments on any entity |
| **Context** | `list_context_entries`, `get_context_entry`, `create_context_entry`, `update_context_entry`, `delete_context_entry` | Organizational context for compliance |
| **Roles** | `list_roles`, `create_role`, `update_role`, `delete_role` | Custom roles and permissions |
| **Audit Logs** | `get_audit_logs` | Activity audit trail |
| **Integrations** | `list_integration_connections`, `list_integration_providers` | Connected integrations |
| **Knowledge Base** | `list_knowledge_base_documents`, `list_manual_answers`, `save_manual_answer` | Compliance knowledge base |
| **Health** | `health_check` | API health status |

## Setup

### Prerequisites

- Node.js >= 18
- A [Comp AI](https://trycomp.ai) account with an API key

### Get your API key

1. Log in to [Comp AI](https://trycomp.ai)
2. Go to **Settings** > **API Keys**
3. Create a new API key

### Install

```bash
git clone https://github.com/yourusername/compai-mcp.git
cd compai-mcp
npm install
npm run build
```

## Configuration

### Cursor

Add to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "compai": {
      "command": "node",
      "args": ["/path/to/compai-mcp/dist/index.js"],
      "env": {
        "COMPAI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "compai": {
      "command": "node",
      "args": ["/path/to/compai-mcp/dist/index.js"],
      "env": {
        "COMPAI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `COMPAI_API_KEY` | Yes | — | Your Comp AI API key |
| `COMPAI_BASE_URL` | No | `https://api.trycomp.ai` | API base URL (for self-hosted instances) |

## Usage Examples

Once connected, you can ask your AI assistant things like:

- "List all my compliance tasks that are in progress"
- "Show me our vendor risk assessments"
- "Create a new risk for our authentication system"
- "What's our overall compliance score?"
- "List all policies that need review"
- "Who are the members of our organization?"
- "Show me the audit log for this task"
- "Regenerate the data privacy policy using AI"

## Development

```bash
npm install
npm run build    # Compile TypeScript
npm run dev      # Build and run
```

## API Reference

This MCP server wraps the [Comp AI API](https://trycomp.ai/docs/api-reference/auth/get-current-user-info-organizations-and-pending-invitations). All authentication is handled via the `X-API-Key` header.

## License

MIT
