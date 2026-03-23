import { ChangeEvent } from "react";
import { playHoverSound, playClickSound } from "../audio/uiSounds";
import { GameSettings, MusicMode, SfxLevel } from "../engine/types";

interface SettingsScreenProps {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onBack: () => void;
  onStart: () => void;
}

const MUSIC_OPTIONS: { value: MusicMode; label: string }[] = [
  { value: "neon-arcade", label: "Neon Arcade" },
  { value: "space-inspired", label: "Space Inspired" },
  { value: "8-bit", label: "8-Bit" },
  { value: "techno-trance", label: "Techno Trance" },
  { value: "drums-only", label: "Drums Only" },
  { value: "sfx-only", label: "SFX Only" },
  { value: "off", label: "Off" },
];

const SFX_OPTIONS: { value: SfxLevel; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "default", label: "Default" },
  { value: "high", label: "High" },
];

export function SettingsScreen({
  settings,
  onChange,
  onBack,
  onStart,
}: SettingsScreenProps) {
  const handleMusicChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...settings, musicMode: event.target.value as MusicMode });
  };

  const handleSfxChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...settings, sfxLevel: event.target.value as SfxLevel });
  };

  const handleToggle =
    <
      K extends keyof Pick<
        GameSettings,
        "wallsLethal" | "otherSnakeLethal" | "powerUpsEnabled" | "monoSpeed"
      >,
    >(
      key: K,
    ) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange({ ...settings, [key]: event.target.checked });
    };

  return (
    <div className="settings-screen">
      <h1>Settings</h1>
      <p className="settings-intro">
        Tune the match before you start. Defaults preserve the current game.
      </p>

      <div className="settings-grid">
        <label className="settings-field">
          <span>Music</span>
          <small>Pick a background track, drums only, or turn sound off.</small>
          <select value={settings.musicMode} onChange={handleMusicChange}>
            {MUSIC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="settings-field">
          <span>Sound Effects</span>
          <small>Adjust effect volume without changing gameplay.</small>
          <select value={settings.sfxLevel} onChange={handleSfxChange}>
            {SFX_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="settings-toggle">
          <div>
            <span>Wall Collisions Are Lethal</span>
            <small>Turn this off to wrap across the arena edges.</small>
          </div>
          <input
            type="checkbox"
            checked={settings.wallsLethal}
            onChange={handleToggle("wallsLethal")}
          />
        </label>

        <label className="settings-toggle">
          <div>
            <span>Other-Snake Collisions Are Lethal</span>
            <small>
              Turn this off to use the slowdown penalty instead of instant
              death.
            </small>
          </div>
          <input
            type="checkbox"
            checked={settings.otherSnakeLethal}
            onChange={handleToggle("otherSnakeLethal")}
          />
        </label>

        <label className="settings-toggle">
          <div>
            <span>Enable Power-Ups</span>
            <small>
              Every 10th snack grants a 15-second invincibility refresh.
            </small>
          </div>
          <input
            type="checkbox"
            checked={settings.powerUpsEnabled}
            onChange={handleToggle("powerUpsEnabled")}
          />
        </label>

        <label className="settings-toggle">
          <div>
            <span>Mono Speed</span>
            <small>
              Keep the match at one steady speed instead of speeding up.
            </small>
          </div>
          <input
            type="checkbox"
            checked={settings.monoSpeed}
            onChange={handleToggle("monoSpeed")}
          />
        </label>
      </div>

      <div className="settings-actions">
        <button
          className="settings-button secondary"
          onClick={() => {
            playClickSound();
            onBack();
          }}
          onMouseEnter={playHoverSound}
        >
          Back
        </button>
        <button
          className="settings-button primary"
          onClick={() => {
            playClickSound();
            onStart();
          }}
          onMouseEnter={playHoverSound}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
