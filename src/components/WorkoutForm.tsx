"use client";

import { WorkoutFormData, WorkoutType, WORKOUT_LABELS } from "@/lib/types";
import { todayISO } from "@/lib/utils";
import { useState } from "react";

interface Props {
  initial?: Partial<WorkoutFormData>;
  onSubmit: (data: WorkoutFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

const TYPES: WorkoutType[] = ["easy", "long_run", "workout", "recovery", "race", "other"];

export default function WorkoutForm({ initial, onSubmit, onCancel, submitLabel = "Save" }: Props) {
  const [form, setForm] = useState<WorkoutFormData>({
    date: initial?.date ?? todayISO(),
    distance_miles: initial?.distance_miles ?? 0,
    duration_minutes: initial?.duration_minutes ?? 0,
    duration_seconds: initial?.duration_seconds ?? 0,
    workout_type: initial?.workout_type ?? "easy",
    notes: initial?.notes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof WorkoutFormData>(key: K, value: WorkoutFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.distance_miles <= 0) {
      setError("Distance must be greater than 0");
      return;
    }
    if (form.duration_minutes === 0 && form.duration_seconds === 0) {
      setError("Duration must be greater than 0");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
    setLoading(false);
  }

  const inputClass =
    "w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-hermes-500/40 focus:border-hermes-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
          className={inputClass}
          required
        />
      </div>

      {/* Distance */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Distance (miles)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={form.distance_miles || ""}
          onChange={(e) => set("distance_miles", parseFloat(e.target.value) || 0)}
          className={inputClass}
          placeholder="0.00"
          required
        />
      </div>

      {/* Duration */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Duration</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              min="0"
              value={form.duration_minutes || ""}
              onChange={(e) => set("duration_minutes", parseInt(e.target.value) || 0)}
              className={inputClass}
              placeholder="min"
            />
          </div>
          <span className="self-center text-stone-400 text-sm">:</span>
          <div className="flex-1">
            <input
              type="number"
              min="0"
              max="59"
              value={form.duration_seconds || ""}
              onChange={(e) => set("duration_seconds", parseInt(e.target.value) || 0)}
              className={inputClass}
              placeholder="sec"
            />
          </div>
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Type</label>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("workout_type", t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                form.workout_type === t
                  ? "bg-hermes-600 text-white border-hermes-600"
                  : "bg-white text-stone-600 border-stone-300 hover:border-stone-400"
              }`}
            >
              {WORKOUT_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          className={inputClass + " resize-none"}
          rows={2}
          placeholder="How did it feel?"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-medium text-stone-600 border border-stone-300
                       rounded-lg hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-hermes-600 text-white text-sm font-medium rounded-lg
                     hover:bg-hermes-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
