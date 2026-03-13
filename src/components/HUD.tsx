import { ScoreBoard } from './ScoreBoard';

interface HUDProps {
  scores: [number, number];
}

export function HUD({ scores }: HUDProps) {
  return <ScoreBoard scores={scores} />;
}
