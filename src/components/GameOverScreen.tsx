import { playHoverSound, playClickSound } from '../audio/uiSounds';

interface GameOverScreenProps {
  scores: [number, number];
  onRestart: () => void;
}

export function GameOverScreen({ scores, onRestart }: GameOverScreenProps) {
  const handleClick = () => {
    playClickSound();
    onRestart();
  };

  return (
    <div className="game-over-screen">
      <h1>GAME OVER</h1>
      <div className="scores">
        <div className="final-score player1">
          P1: {scores[0]}
        </div>
        <div className="final-score player2">
          P2: {scores[1]}
        </div>
      </div>
      <button
        className="restart-button"
        onClick={handleClick}
        onMouseEnter={playHoverSound}
      >
        Play Again
      </button>
    </div>
  );
}
