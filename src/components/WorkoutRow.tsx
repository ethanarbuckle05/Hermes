"use client";

import { Workout, WORKOUT_LABELS, WORKOUT_COLORS } from "@/lib/types";
import { formatDate, formatDuration, formatPace } from "@/lib/utils";
import { useState } from "react";

interface Props {
  workout: Workout;
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function WorkoutRow({ workout, onEdit, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    await onDelete(workout.id);
  }

  return (
    <div className="group bg-white border border-stone-200 rounded-xl px-4 py-3 hover:border-stone-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        {/* Left: main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-stone-500 font-medium">
              {formatDate(workout.date)}
            </span>
            <span
              className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wide ${
                WORKOUT_COLORS[workout.workout_type]
              }`}
            >
              {WORKOUT_LABELS[workout.workout_type]}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-baseline gap-4">
            <span className="text-lg font-semibold tabular-nums font-mono">
              {workout.distance_miles} <span className="text-xs font-sans text-stone-400">mi</span>
            </span>
            <span className="text-sm text-stone-600 tabular-nums font-mono">
              {formatDuration(workout.duration_seconds)}
            </span>
            <span className="text-sm text-stone-500 tabular-nums font-mono">
              {formatPace(workout.distance_miles, workout.duration_seconds)}
            </span>
          </div>

          {workout.notes && (
            <p className="text-xs text-stone-500 mt-1.5 line-clamp-2">{workout.notes}</p>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-1">
          <button
            onClick={() => onEdit(workout)}
            className="p-1.5 text-stone-400 hover:text-hermes-600 hover:bg-hermes-50 rounded-md transition-colors"
            title="Edit"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            onBlur={() => { setConfirming(false); }}
            disabled={deleting}
            className={`p-1.5 rounded-md transition-colors ${
              confirming
                ? "text-red-600 bg-red-50 hover:bg-red-100"
                : "text-stone-400 hover:text-red-600 hover:bg-red-50"
            }`}
            title={confirming ? "Click again to confirm" : "Delete"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
