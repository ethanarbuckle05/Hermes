export type WorkoutType = "easy" | "long_run" | "workout" | "recovery" | "race" | "other";

export interface Race {
  id: string;
  user_id: string;
  race_name: string;
  race_date: string;
  race_distance_miles: number;
  goal_time_seconds: number | null;
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  race_id: string | null;
  date: string;
  distance_miles: number;
  duration_seconds: number;
  workout_type: WorkoutType;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutFormData {
  date: string;
  distance_miles: number;
  duration_minutes: number;
  duration_seconds: number;
  workout_type: WorkoutType;
  notes: string;
}

export interface RaceFormData {
  race_name: string;
  race_date: string;
  race_distance_miles: number;
  goal_time_hours: number;
  goal_time_minutes: number;
  goal_time_seconds: number;
}

export const WORKOUT_LABELS: Record<WorkoutType, string> = {
  easy: "Easy",
  long_run: "Long Run",
  workout: "Workout",
  recovery: "Recovery",
  race: "Race",
  other: "Other",
};

export const WORKOUT_COLORS: Record<WorkoutType, string> = {
  easy: "bg-emerald-100 text-emerald-800",
  long_run: "bg-blue-100 text-blue-800",
  workout: "bg-amber-100 text-amber-800",
  recovery: "bg-violet-100 text-violet-800",
  race: "bg-hermes-100 text-hermes-800",
  other: "bg-stone-100 text-stone-600",
};

/** Standard race distance presets in miles */
export const RACE_PRESETS: { label: string; miles: number }[] = [
  { label: "5K", miles: 3.11 },
  { label: "10K", miles: 6.21 },
  { label: "Half Marathon", miles: 13.11 },
  { label: "Marathon", miles: 26.22 },
];
