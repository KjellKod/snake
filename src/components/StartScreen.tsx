import { playHoverSound, playClickSound } from "../audio/uiSounds";

interface StartScreenProps {
  onStart: () => void;
  onOpenSettings: () => void;
}

export function StartScreen({ onStart, onOpenSettings }: StartScreenProps) {
  const handleClick = () => {
    playClickSound();
    onStart();
  };

  const handleSettings = () => {
    playClickSound();
    onOpenSettings();
  };

  return (
    <div className="start-screen">
      <h1>SNAKE</h1>
      <div className="controls-info">
        <div>
          <span>Player 1</span>: W A S D
        </div>
        <div>
          <span className="p2">Player 2</span>: Arrow Keys
        </div>
      </div>
      <button
        className="start-button"
        onClick={handleClick}
        onMouseEnter={playHoverSound}
      >
        Start Game
      </button>
      <button
        className="settings-button"
        onClick={handleSettings}
        onMouseEnter={playHoverSound}
      >
        Settings
      </button>
    </div>
  );
}
