import { describe, expect, it } from "vitest";

declare const require: (id: string) => any;
const { readFileSync } = require("fs");

describe("play plugin contract", () => {
  it('plugin.json parses with name="play" and semver version', () => {
    const pluginJson = readFileSync(
      new URL("../../play/.claude-plugin/plugin.json", import.meta.url),
      "utf8",
    );
    const parsed = JSON.parse(pluginJson) as { name?: string; version?: string };

    expect(parsed.name).toBe("play");
    expect(parsed.version).toMatch(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
  });

  it('snake SKILL.md has frontmatter name="snake" and description mentions "play snake" and "/play:snake"', () => {
    const skillMarkdown = readFileSync(
      new URL("../../play/skills/snake/SKILL.md", import.meta.url),
      "utf8",
    );
    const frontmatterMatch = skillMarkdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    expect(frontmatterMatch).not.toBeNull();

    const frontmatter = frontmatterMatch ? frontmatterMatch[1] : "";
    const nameMatch = frontmatter.match(/^name:\s*(.+)\s*$/m);
    const descriptionMatch = frontmatter.match(/^description:\s*(.+)\s*$/m);
    const descriptionValue = descriptionMatch?.[1] ?? "";

    expect(nameMatch?.[1]?.trim()).toBe("snake");
    expect(descriptionValue.toLowerCase()).toContain("play snake");
    expect(descriptionValue).toContain("/play:snake");
  });
});
