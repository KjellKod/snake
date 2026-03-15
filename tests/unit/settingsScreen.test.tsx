import { describe, expect, it, vi } from "vitest";
import { isValidElement, ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StartScreen } from "../../src/components/StartScreen";
import { SettingsScreen } from "../../src/components/SettingsScreen";
import { createDefaultSettings, GameSettings } from "../../src/engine/types";

vi.mock("../../src/audio/uiSounds", () => ({
  playHoverSound: vi.fn(),
  playClickSound: vi.fn(),
}));

function collectElements(node: ReactNode): ReactElement[] {
  if (!isValidElement(node)) {
    return [];
  }

  const children = node.props.children;
  return [node, ...collectChildren(children)];
}

function collectChildren(children: ReactNode): ReactElement[] {
  if (Array.isArray(children)) {
    return children.flatMap((child) => collectElements(child));
  }

  return collectElements(children);
}

function findElementByType(
  tree: ReactElement,
  type: string,
  index = 0,
): ReactElement {
  const matches = collectElements(tree).filter(
    (element) => element.type === type,
  );
  const match = matches[index];

  if (!match) {
    throw new Error(`Expected to find <${type}> at index ${index}`);
  }

  return match;
}

describe("StartScreen", () => {
  it("shows a settings entry point before the match starts", () => {
    const onStart = vi.fn();
    const onOpenSettings = vi.fn();
    const tree = StartScreen({ onStart, onOpenSettings });
    const markup = renderToStaticMarkup(tree);
    const settingsButton = findElementByType(tree, "button", 1);

    expect(markup).toContain("Start Game");
    expect(markup).toContain("Settings");

    settingsButton.props.onClick();

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();
  });
});

describe("SettingsScreen", () => {
  it("renders the settings copy and emits updated settings values", () => {
    const initialSettings = createDefaultSettings();
    const onChange = vi.fn();
    const onBack = vi.fn();
    const onStart = vi.fn();
    const tree = SettingsScreen({
      settings: initialSettings,
      onChange,
      onBack,
      onStart,
    });
    const markup = renderToStaticMarkup(tree);
    const musicSelect = findElementByType(tree, "select", 0);
    const sfxSelect = findElementByType(tree, "select", 1);
    const wallsToggle = findElementByType(tree, "input", 0);
    const otherSnakeToggle = findElementByType(tree, "input", 1);
    const powerUpsToggle = findElementByType(tree, "input", 2);
    const monoSpeedToggle = findElementByType(tree, "input", 3);
    const backButton = findElementByType(tree, "button", 0);
    const startButton = findElementByType(tree, "button", 1);

    expect(markup).toContain(
      "Tune the match before you start. Defaults preserve the current game.",
    );
    expect(markup).toContain("Pick the background track or turn music off.");
    expect(markup).toContain("Adjust effect volume without changing gameplay.");
    expect(markup).toContain("Turn this off to wrap across the arena edges.");
    expect(markup).toContain(
      "Turn this off to use the slowdown penalty instead of instant death.",
    );
    expect(markup).toContain(
      "Every 10th snack grants a 15-second invincibility refresh.",
    );
    expect(markup).toContain(
      "Keep the match at one steady speed instead of speeding up.",
    );

    musicSelect.props.onChange({ target: { value: "off" } });
    sfxSelect.props.onChange({ target: { value: "high" } });
    wallsToggle.props.onChange({ target: { checked: false } });
    otherSnakeToggle.props.onChange({ target: { checked: false } });
    powerUpsToggle.props.onChange({ target: { checked: true } });
    monoSpeedToggle.props.onChange({ target: { checked: true } });
    backButton.props.onClick();
    startButton.props.onClick();

    expect(onChange).toHaveBeenNthCalledWith(1, {
      ...initialSettings,
      musicMode: "off",
    } satisfies GameSettings);
    expect(onChange).toHaveBeenNthCalledWith(2, {
      ...initialSettings,
      sfxLevel: "high",
    } satisfies GameSettings);
    expect(onChange).toHaveBeenNthCalledWith(3, {
      ...initialSettings,
      wallsLethal: false,
    } satisfies GameSettings);
    expect(onChange).toHaveBeenNthCalledWith(4, {
      ...initialSettings,
      otherSnakeLethal: false,
    } satisfies GameSettings);
    expect(onChange).toHaveBeenNthCalledWith(5, {
      ...initialSettings,
      powerUpsEnabled: true,
    } satisfies GameSettings);
    expect(onChange).toHaveBeenNthCalledWith(6, {
      ...initialSettings,
      monoSpeed: true,
    } satisfies GameSettings);
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
