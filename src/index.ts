#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { register as auth } from "./tools/auth.js";
import { register as organization } from "./tools/organization.js";
import { register as people } from "./tools/people.js";
import { register as tasks } from "./tools/tasks.js";
import { register as policies } from "./tools/policies.js";
import { register as vendors } from "./tools/vendors.js";
import { register as risks } from "./tools/risks.js";
import { register as frameworks } from "./tools/frameworks.js";
import { register as controls } from "./tools/controls.js";
import { register as evidence } from "./tools/evidence.js";
import { register as findings } from "./tools/findings.js";
import { register as comments } from "./tools/comments.js";
import { register as context } from "./tools/context.js";
import { register as roles } from "./tools/roles.js";
import { register as auditLogs } from "./tools/audit-logs.js";
import { register as integrations } from "./tools/integrations.js";
import { register as knowledgeBase } from "./tools/knowledge-base.js";
import { register as health } from "./tools/health.js";

const server = new McpServer({
  name: "compai",
  version: "1.0.0",
});

auth(server);
organization(server);
people(server);
tasks(server);
policies(server);
vendors(server);
risks(server);
frameworks(server);
controls(server);
evidence(server);
findings(server);
comments(server);
context(server);
roles(server);
auditLogs(server);
integrations(server);
knowledgeBase(server);
health(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
