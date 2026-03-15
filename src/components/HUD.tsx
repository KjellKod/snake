import { GameState, isPlayerInvincible, isPlayerSlowed } from "../engine/types";

interface HUDProps {
  gameState: GameState;
  announcement?: Announcement | null;
}

export interface Announcement {
  text: string;
  tone: "hit" | "power-up";
  expiresAt: number;
}

export function formatSeconds(remainingMs: number): string {
  return `${Math.ceil(remainingMs / 1000)}s`;
}

export function getStatusText(
  gameState: GameState,
  playerIndex: number,
): string {
  const player = gameState.players[playerIndex];
  const statuses: string[] = [];

  if (isPlayerInvincible(player, gameState.elapsedMs)) {
    statuses.push(
      `Invincible ${formatSeconds(player.effects.invincibleUntilMs - gameState.elapsedMs)}`,
    );
  }

  if (isPlayerSlowed(player, gameState.elapsedMs)) {
    statuses.push(
      `Slowed ${formatSeconds(player.effects.slowUntilMs - gameState.elapsedMs)}`,
    );
  }

  return statuses.length > 0 ? statuses.join(" | ") : "Normal";
}

export function HUD({ gameState, announcement }: HUDProps) {
  const announcementRemaining = announcement
    ? announcement.expiresAt - gameState.elapsedMs
    : 0;
  const activeAnnouncement =
    announcement && announcementRemaining > 0 ? announcement : null;
  const announcementClassName = activeAnnouncement
    ? `announcement-banner ${activeAnnouncement.tone}${announcementRemaining <= 1800 ? " is-fading" : ""}`
    : "";

  return (
    <div className="hud-shell">
      {activeAnnouncement && (
        <div className={announcementClassName}>{activeAnnouncement.text}</div>
      )}
      <div className="hud">
        <div className="score player1">P1: {gameState.players[0].score}</div>
        <div className="score player2">P2: {gameState.players[1].score}</div>
      </div>
      <div className="status-bar">
        <div className="status player1">{getStatusText(gameState, 0)}</div>
        <div className="status player2">{getStatusText(gameState, 1)}</div>
      </div>
    </div>
  );
}
