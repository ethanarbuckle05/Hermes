/** Format seconds into M:SS or H:MM:SS */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Calculate pace in seconds per mile */
export function calcPaceSeconds(distanceMiles: number, durationSeconds: number): number {
  if (distanceMiles <= 0) return 0;
  return Math.round(durationSeconds / distanceMiles);
}

/** Format pace as M:SS /mi */
export function formatPace(distanceMiles: number, durationSeconds: number): string {
  const paceSeconds = calcPaceSeconds(distanceMiles, durationSeconds);
  const m = Math.floor(paceSeconds / 60);
  const s = paceSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")} /mi`;
}

/** Today's date as YYYY-MM-DD */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** Format date for display */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00"); // avoid timezone shift
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Days from today until a target date. Negative = past. */
export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T12:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Format a race distance for display (show preset label if close) */
export function formatRaceDistance(miles: number): string {
  const presets: [string, number][] = [
    ["5K", 3.11],
    ["10K", 6.21],
    ["Half Marathon", 13.11],
    ["Marathon", 26.22],
  ];
  for (const [label, d] of presets) {
    if (Math.abs(miles - d) < 0.05) return label;
  }
  return `${miles} mi`;
}
