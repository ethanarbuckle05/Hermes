"use client";

import { RaceFormData, RACE_PRESETS } from "@/lib/types";
import { useState } from "react";

interface Props {
  onSubmit: (data: RaceFormData) => Promise<void>;
  onCancel?: () => void;
}

export default function RaceForm({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<RaceFormData>({
    race_name: "",
    race_date: "",
    race_distance_miles: 0,
    goal_time_hours: 0,
    goal_time_minutes: 0,
    goal_time_seconds: 0,
  });
  const [customDistance, setCustomDistance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof RaceFormData>(key: K, value: RaceFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectPreset(miles: number, label: string) {
    setForm((prev) => ({
      ...prev,
      race_distance_miles: miles,
      race_name: prev.race_name || label,
    }));
    setCustomDistance(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.race_name.trim()) { setError("Race name is required"); return; }
    if (!form.race_date) { setError("Race date is required"); return; }
    if (form.race_distance_miles <= 0) { setError("Distance must be greater than 0"); return; }
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
    "w-full px-3 py-2 border border-earth-border rounded text-sm bg-earth-input " +
    "focus:outline-none focus:border-earth-text text-earth-text";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Race name */}
      <div>
        <label className="block text-xs text-earth-muted mb-1.5">Race name</label>
        <input
          type="text"
          value={form.race_name}
          onChange={(e) => set("race_name", e.target.value)}
          className={inputClass}
          placeholder="e.g. Boston Marathon 2026"
          required
        />
      </div>

      {/* Race date */}
      <div>
        <label className="block text-xs text-earth-muted mb-1.5">Race date</label>
        <input
          type="date"
          value={form.race_date}
          onChange={(e) => set("race_date", e.target.value)}
          className={inputClass}
          required
        />
      </div>

      {/* Distance presets */}
      <div>
        <label className="block text-xs text-earth-muted mb-1.5">Distance</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {RACE_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => selectPreset(p.miles, p.label)}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                !customDistance && form.race_distance_miles === p.miles
                  ? "bg-earth-sage text-white border-earth-sage"
                  : "bg-earth-card text-earth-muted border-earth-border hover:border-earth-tan"
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setCustomDistance(true); set("race_distance_miles", 0); }}
            className={`px-3 py-1.5 text-xs rounded border transition-colors ${
              customDistance
                ? "bg-earth-sage text-white border-earth-sage"
                : "bg-earth-card text-earth-muted border-earth-border hover:border-earth-tan"
            }`}
          >
            Custom
          </button>
        </div>
        {customDistance && (
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.race_distance_miles || ""}
            onChange={(e) => set("race_distance_miles", parseFloat(e.target.value) || 0)}
            className={inputClass}
            placeholder="Distance in miles"
          />
        )}
      </div>

      {/* Goal time (optional) */}
      <div>
        <label className="block text-xs text-earth-muted mb-1.5">
          Goal time <span className="text-earth-border">(optional)</span>
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="0"
            value={form.goal_time_hours || ""}
            onChange={(e) => set("goal_time_hours", parseInt(e.target.value) || 0)}
            className={inputClass + " w-20"}
            placeholder="hr"
          />
          <span className="text-earth-muted text-sm">:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={form.goal_time_minutes || ""}
            onChange={(e) => set("goal_time_minutes", parseInt(e.target.value) || 0)}
            className={inputClass + " w-20"}
            placeholder="min"
          />
          <span className="text-earth-muted text-sm">:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={form.goal_time_seconds || ""}
            onChange={(e) => set("goal_time_seconds", parseInt(e.target.value) || 0)}
            className={inputClass + " w-20"}
            placeholder="sec"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50/50 rounded px-3 py-2">{error}</p>
      )}

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm text-earth-muted border border-earth-border
                       rounded hover:bg-earth-bg transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-earth-sage text-white text-sm rounded
                     hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Saving..." : "Set race"}
        </button>
      </div>
    </form>
  );
}
