"use client";

import { Race } from "@/lib/types";
import { daysUntil, formatDate, formatDuration, formatRaceDistance } from "@/lib/utils";

interface Props {
  race: Race;
  totalSessions: number;
  totalMiles: number;
  onDelete: (id: string) => Promise<void>;
}

export default function RaceCard({ race, totalSessions, totalMiles, onDelete }: Props) {
  const days = daysUntil(race.race_date);
  const isPast = days < 0;

  return (
    <div className="bg-earth-card border border-earth-border rounded-lg p-5 mb-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-earth-muted">
            Target Race
          </p>
          <h2 className="text-base font-semibold mt-1">{race.race_name}</h2>
          <p className="text-xs text-earth-muted mt-1">
            {formatRaceDistance(Number(race.race_distance_miles))} · {formatDate(race.race_date)}
            {race.goal_time_seconds && (
              <> · Goal {formatDuration(race.goal_time_seconds)}</>
            )}
          </p>
        </div>
        <button
          onClick={() => onDelete(race.id)}
          className="text-xs text-earth-muted hover:text-red-700 transition-colors shrink-0 mt-1"
          title="Remove race"
        >
          ✕
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-earth-border">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-earth-muted">
            {isPast ? "Days ago" : "Days to go"}
          </p>
          <p className={`text-lg font-mono tabular-nums mt-1 ${
            !isPast && days <= 14 ? "text-earth-sage font-semibold" : ""
          }`}>
            {Math.abs(days)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-earth-muted">Sessions</p>
          <p className="text-lg font-mono tabular-nums mt-1">{totalSessions}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-earth-muted">Miles</p>
          <p className="text-lg font-mono tabular-nums mt-1">{totalMiles.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}
