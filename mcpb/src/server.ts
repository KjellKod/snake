import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { RESOURCE_REGISTRATIONS, TOOL_REGISTRATIONS } from "./registration.js";
import { loadWidgetHtml } from "./widget-loader.js";

export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: "snake",
      version: "0.1.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    },
  );

  const resource = RESOURCE_REGISTRATIONS[0];
  registerAppResource(
    server,
    resource.name,
    resource.uri,
    {
      description: resource.description,
      _meta: {
        ui: resource._meta.ui,
      },
    },
    async () => ({
      contents: [
        {
          uri: resource.uri,
          mimeType: RESOURCE_MIME_TYPE,
          text: loadWidgetHtml(),
          _meta: {
            ui: resource._meta.ui,
          },
        },
      ],
    }),
  );

  const tool = TOOL_REGISTRATIONS[0];
  registerAppTool(
    server,
    tool.name,
    {
      description: tool.description,
      _meta: {
        ui: {
          resourceUri: tool._meta.ui.resourceUri,
        },
      },
    },
    async () => ({
      content: [
        {
          type: "text",
          text: "Launching snake.",
        },
      ],
    }),
  );

  return server;
}

function isMainModule(): boolean {
  if (!process.argv[1]) {
    return false;
  }

  try {
    return realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

export async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (isMainModule()) {
  void main().catch((error) => {
    console.error("snake mcp server failed", error);
    process.exit(1);
  });
}
