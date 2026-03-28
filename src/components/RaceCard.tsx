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
    <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-stone-400 font-semibold">
            Target Race
          </p>
          <h2 className="text-base font-bold mt-0.5">{race.race_name}</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {formatRaceDistance(Number(race.race_distance_miles))} · {formatDate(race.race_date)}
            {race.goal_time_seconds && (
              <> · Goal {formatDuration(race.goal_time_seconds)}</>
            )}
          </p>
        </div>
        <button
          onClick={() => onDelete(race.id)}
          className="text-xs text-stone-400 hover:text-red-500 transition-colors shrink-0 mt-1"
          title="Remove race"
        >
          ✕
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-stone-100">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-stone-400 font-semibold">
            {isPast ? "Days ago" : "Days to go"}
          </p>
          <p className={`text-lg font-bold font-mono tabular-nums ${
            !isPast && days <= 14 ? "text-hermes-600" : ""
          }`}>
            {Math.abs(days)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-stone-400 font-semibold">Sessions</p>
          <p className="text-lg font-bold font-mono tabular-nums">{totalSessions}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-stone-400 font-semibold">Miles</p>
          <p className="text-lg font-bold font-mono tabular-nums">{totalMiles.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}
