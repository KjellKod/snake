import { playHoverSound, playClickSound } from "../audio/uiSounds";

const DOWNLOAD_BASE_URL = import.meta.env.BASE_URL;

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
      <details className="install-panel">
        <summary onClick={playClickSound} onMouseEnter={playHoverSound}>
          Install Snake
        </summary>
        <div className="download-actions">
          <a
            className="download-link"
            href={`${DOWNLOAD_BASE_URL}standalone.html`}
            download="snake.html"
            onMouseEnter={playHoverSound}
          >
            Download single HTML
          </a>
          <a
            className="download-link plugin"
            href={`${DOWNLOAD_BASE_URL}snake.zip`}
            download="snake.zip"
            onMouseEnter={playHoverSound}
          >
            Download Claude plugin ZIP
          </a>
        </div>
        <p className="download-note">
          The single HTML file opens by itself and can be dragged into Claude as
          an Artifact.
        </p>
        <ol className="install-steps">
          <li>
            Claude Plugins directory -&gt; Personal -&gt; Local uploads -&gt; +
            -&gt; Upload local plugin.
          </li>
          <li>Pick snake.zip, then type /play:snake or say "play snake".</li>
        </ol>
      </details>
    </div>
  );
}
