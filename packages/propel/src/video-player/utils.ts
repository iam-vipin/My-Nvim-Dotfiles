export const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
export type TPlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];
