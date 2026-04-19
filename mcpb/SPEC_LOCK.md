# SPEC LOCK

Date: 2026-04-18
Purpose: Freeze the concrete MCP package surface and UI metadata field names used by this bundle.

Citations below use repo-relative paths that resolve after `cd mcpb && npm ci`. Line numbers reflect `@modelcontextprotocol/ext-apps@1.1.2` and `@modelcontextprotocol/sdk@1.27.1` as published on npm — if you bump either version, re-verify against the refreshed `mcpb/node_modules/` tree.

## Package Resolution

- `@modelcontextprotocol/sdk` pinned to `1.27.1`.
  - Citation: `mcpb/node_modules/@modelcontextprotocol/sdk/package.json` (`version` field).
- `@modelcontextprotocol/ext-apps` pinned to `1.1.2`.
  - Citation: `mcpb/node_modules/@modelcontextprotocol/ext-apps/package.json` (`version` field).

## UI Metadata Field Names (Authoritative)

- Resource metadata path: `_meta.ui`.
  - Citation: `mcpb/node_modules/@modelcontextprotocol/ext-apps/dist/src/server/index.d.ts` lines 98-103.
- Tool-to-resource linkage: `_meta.ui.resourceUri` (preferred).
  - Citation: `mcpb/node_modules/@modelcontextprotocol/ext-apps/dist/src/server/index.d.ts` lines 55-57 and 110-111.
  - Type field citation: `mcpb/node_modules/@modelcontextprotocol/ext-apps/dist/src/spec.types.d.ts` line 615.
- Resource CSP object fields: `connectDomains`, `resourceDomains`, `frameDomains`, `baseUriDomains`.
  - Citation: `mcpb/node_modules/@modelcontextprotocol/ext-apps/dist/src/spec.types.d.ts` lines 447-497.
- Resource permissions object path and fields: `_meta.ui.permissions` with object keys `camera`, `microphone`, `geolocation`, `clipboardWrite`.
  - Citation: `mcpb/node_modules/@modelcontextprotocol/ext-apps/dist/src/spec.types.d.ts` lines 505-530 and 534-538.

## Manifest Shape Lock

- `manifest_version` locked to `"0.3"`.
- `server.mcp_config.command` and `server.mcp_config.args` are required nested fields under `server`.
  - Verification: the authoritative manifest we ship is `mcpb/manifest.json`. Claude Desktop validates this schema at install time — if either field is missing or the `manifest_version` drifts, the install dialog rejects the bundle.

## Intent Mapping Notes

- Addendum intent for data URI media support maps to `csp.resourceDomains` and is implemented as `["'self'", "data:"]`.
- The requested `"autoplay"` permission is not present in `McpUiResourcePermissions` for `@modelcontextprotocol/ext-apps@1.1.2`; supported fields are camera/microphone/geolocation/clipboardWrite only.
  - Citation: `mcpb/node_modules/@modelcontextprotocol/ext-apps/dist/src/spec.types.d.ts` lines 505-530.
