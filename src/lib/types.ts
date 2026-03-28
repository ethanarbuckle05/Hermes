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
  group_id: string | null;
  date: string;
  distance_miles: number;
  duration_seconds: number;
  workout_type: WorkoutType;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  created_by: string;
  invite_code: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface WorkoutFormData {
  date: string;
  distance_miles: number;
  duration_minutes: number;
  duration_seconds: number;
  workout_type: WorkoutType;
  notes: string;
  group_id: string;
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
  easy: "badge-easy",
  long_run: "badge-long-run",
  workout: "badge-workout",
  recovery: "badge-recovery",
  race: "badge-race",
  other: "badge-other",
};

/** Standard race distance presets in miles */
export const RACE_PRESETS: { label: string; miles: number }[] = [
  { label: "5K", miles: 3.11 },
  { label: "10K", miles: 6.21 },
  { label: "Half Marathon", miles: 13.11 },
  { label: "Marathon", miles: 26.22 },
];
