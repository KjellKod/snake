import { playHoverSound, playClickSound } from "../audio/uiSounds";

const DOWNLOAD_BASE_URL = "https://kjellkod.github.io/snake/";

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
      <div className="download-panel" aria-label="Download and install">
        <div className="download-actions">
          <a
            className="download-link"
            href={`${DOWNLOAD_BASE_URL}standalone.html`}
            download="snake.html"
            onMouseEnter={playHoverSound}
          >
            Single HTML
          </a>
          <a
            className="download-link plugin"
            href={`${DOWNLOAD_BASE_URL}snake.zip`}
            download="snake.zip"
            onMouseEnter={playHoverSound}
          >
            Claude Plugin ZIP
          </a>
        </div>
        <ol className="install-steps">
          <li>
            Claude Plugins directory -&gt; Personal -&gt; Local uploads -&gt; +
            -&gt; Upload local plugin.
          </li>
          <li>Pick snake.zip, then type /play:snake or say "play snake".</li>
        </ol>
      </div>
    </div>
  );
}
