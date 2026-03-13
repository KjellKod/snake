
interface ScoreBoardProps {
  scores: [number, number];
}

export function ScoreBoard({ scores }: ScoreBoardProps) {
  return (
    <div className="hud">
      <div className="score player1">P1: {scores[0]}</div>
      <div className="score player2">P2: {scores[1]}</div>
    </div>
  );
}
