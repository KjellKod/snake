import { describe, expect, it } from "vitest";
import { RESOURCE_REGISTRATIONS, RESOURCE_URI, TOOL_REGISTRATIONS } from "../../mcpb/src/registration";

describe("mcpb registration", () => {
  it("registers exactly one tool named play_snake", () => {
    expect(TOOL_REGISTRATIONS).toHaveLength(1);
    expect(TOOL_REGISTRATIONS[0].name).toBe("play_snake");
  });

  it("registers exactly one resource at ui://snake/game.html", () => {
    expect(RESOURCE_REGISTRATIONS).toHaveLength(1);
    expect(RESOURCE_REGISTRATIONS[0].uri).toBe(RESOURCE_URI);
  });

  it("resource registration contains expected ui metadata shape", () => {
    expect(RESOURCE_REGISTRATIONS[0]._meta.ui.csp.resourceDomains).toContain("data:");
    expect(RESOURCE_REGISTRATIONS[0]._meta.ui.permissions).toBeTypeOf("object");
  });

  it("tool registration references the ui resource uri", () => {
    expect(TOOL_REGISTRATIONS[0]._meta.ui.resourceUri).toBe(RESOURCE_URI);
  });
});
