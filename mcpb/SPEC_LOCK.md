# SPEC LOCK

Date: 2026-04-18  
Purpose: Freeze the concrete MCP package surface and UI metadata field names used by this bundle.

## Package Resolution

- `@modelcontextprotocol/sdk` pinned to `1.27.1`.
  - Citation: `/Users/kjell/.npm/_npx/5a9d879542beca3a/node_modules/@modelcontextprotocol/sdk/package.json` line 3.
- `@modelcontextprotocol/ext-apps` pinned to `1.1.2`.
  - Citation: `/Users/kjell/.npm/_npx/5a9d879542beca3a/node_modules/@modelcontextprotocol/ext-apps/package.json` line 8.

## UI Metadata Field Names (Authoritative)

- Resource metadata path: `_meta.ui`.
  - Citation: `/Users/kjell/.npm/_npx/5a9d879542beca3a/node_modules/@modelcontextprotocol/ext-apps/dist/src/server/index.d.ts` lines 98-103.
- Tool-to-resource linkage: `_meta.ui.resourceUri` (preferred).
  - Citation: `/Users/kjell/.npm/_npx/5a9d879542beca3a/node_modules/@modelcontextprotocol/ext-apps/dist/src/server/index.d.ts` lines 55-57 and 110-111.
  - Type field citation: `/Users/kjell/.npm/_npx/5a9d879542beca3a/node_modules/@modelcontextprotocol/ext-apps/dist/src/spec.types.d.ts` line 615.
- Resource CSP object fields: `connectDomains`, `resourceDomains`, `frameDomains`, `baseUriDomains`.
  - Citation: `/Users/kjell/.npm/_npx/5a9d879542beca3a/node_modules/@modelcontextprotocol/ext-apps/dist/src/spec.types.d.ts` lines 447-497.
- Resource permissions object path and fields: `_meta.ui.permissions` with object keys `camera`, `microphone`, `geolocation`, `clipboardWrite`.
  - Citation: `/Users/kjell/.npm/_npx/5a9d879542beca3a/node_modules/@modelcontextprotocol/ext-apps/dist/src/spec.types.d.ts` lines 505-530 and 534-538.

## Manifest Shape Lock

- `manifest_version` locked to `"0.3"`.
- `server.mcp_config.command` and `server.mcp_config.args` are required nested fields under `server`.
  - Citation (approved plan source of truth): `.quest/snake-mcpb-bundle_2026-04-18__2201/phase_01_plan/plan.md` lines 106-124.

## Intent Mapping Notes

- Addendum intent for data URI media support maps to `csp.resourceDomains` and is implemented as `["'self'", "data:"]`.
- The requested `"autoplay"` permission is not present in `McpUiResourcePermissions` for `@modelcontextprotocol/ext-apps@1.1.2`; supported fields are camera/microphone/geolocation/clipboardWrite only.
  - Citation: `/Users/kjell/.npm/_npx/5a9d879542beca3a/node_modules/@modelcontextprotocol/ext-apps/dist/src/spec.types.d.ts` lines 505-530.
