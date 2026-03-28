"use client";

import { createClient } from "@/lib/supabase/client";
import { Race, RaceFormData, Workout, WorkoutFormData } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import RaceCard from "@/components/RaceCard";
import RaceForm from "@/components/RaceForm";
import WorkoutForm from "@/components/WorkoutForm";
import WorkoutRow from "@/components/WorkoutRow";
import { useCallback, useEffect, useState } from "react";

type View = "idle" | "add-race" | "add-workout" | "edit-workout";

export default function HomePage() {
  const supabase = createClient();

  const [race, setRace] = useState<Race | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("idle");
  const [editing, setEditing] = useState<Workout | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  // ─── Fetch ───────────────────────────────────────────

  const fetchData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    setUserEmail(user.email ?? "");

    // Get the user's nearest upcoming race (or most recent)
    const { data: races } = await supabase
      .from("races")
      .select("*")
      .eq("user_id", user.id)
      .order("race_date", { ascending: true })
      .limit(10);

    if (races && races.length > 0) {
      // Prefer upcoming race, fall back to most recent past one
      const upcoming = races.find(
        (r: Race) => new Date(r.race_date + "T23:59:59") >= new Date()
      );
      setRace((upcoming ?? races[races.length - 1]) as Race);
    }

    // Get workouts
    const { data: w } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (w) setWorkouts(w as Workout[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Race CRUD ───────────────────────────────────────

  async function handleCreateRace(form: RaceFormData) {
    const goalSeconds =
      form.goal_time_hours * 3600 + form.goal_time_minutes * 60 + form.goal_time_seconds;

    const { error } = await supabase.from("races").insert({
      user_id: userId,
      race_name: form.race_name,
      race_date: form.race_date,
      race_distance_miles: form.race_distance_miles,
      goal_time_seconds: goalSeconds > 0 ? goalSeconds : null,
    });

    if (error) throw new Error(error.message);
    setView("idle");
    fetchData();
  }

  async function handleDeleteRace(id: string) {
    await supabase.from("races").delete().eq("id", id);
    setRace(null);
    fetchData();
  }

  // ─── Workout CRUD ────────────────────────────────────

  async function handleCreateWorkout(form: WorkoutFormData) {
    const totalSeconds = form.duration_minutes * 60 + form.duration_seconds;

    const { error } = await supabase.from("workouts").insert({
      user_id: userId,
      race_id: race?.id ?? null,
      date: form.date,
      distance_miles: form.distance_miles,
      duration_seconds: totalSeconds,
      workout_type: form.workout_type,
      notes: form.notes || null,
    });

    if (error) throw new Error(error.message);
    setView("idle");
    fetchData();
  }

  async function handleUpdateWorkout(form: WorkoutFormData) {
    if (!editing) return;
    const totalSeconds = form.duration_minutes * 60 + form.duration_seconds;

    const { error } = await supabase
      .from("workouts")
      .update({
        date: form.date,
        distance_miles: form.distance_miles,
        duration_seconds: totalSeconds,
        workout_type: form.workout_type,
        notes: form.notes || null,
      })
      .eq("id", editing.id);

    if (error) throw new Error(error.message);
    setEditing(null);
    setView("idle");
    fetchData();
  }

  async function handleDeleteWorkout(id: string) {
    await supabase.from("workouts").delete().eq("id", id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  // ─── Derived stats ───────────────────────────────────

  const now = new Date();
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

  const weekWorkouts = workouts.filter(
    (w) => new Date(w.date + "T12:00:00") >= weekAgo
  );
  const weekMiles = weekWorkouts.reduce((s, w) => s + Number(w.distance_miles), 0);
  const weekTime = weekWorkouts.reduce((s, w) => s + w.duration_seconds, 0);

  const totalMiles = workouts.reduce((s, w) => s + Number(w.distance_miles), 0);

  // ─── Render ──────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-sm text-stone-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-hermes-600">Hermes</h1>
          <p className="text-xs text-stone-400">{userEmail}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Race section */}
      {race ? (
        <RaceCard
          race={race}
          totalSessions={workouts.length}
          totalMiles={totalMiles}
          onDelete={handleDeleteRace}
        />
      ) : view === "add-race" ? (
        <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold mb-3">Set target race</h2>
          <RaceForm onSubmit={handleCreateRace} onCancel={() => setView("idle")} />
        </div>
      ) : (
        <button
          onClick={() => setView("add-race")}
          className="w-full py-3 mb-4 border-2 border-dashed border-hermes-300 rounded-xl
                     text-sm font-medium text-hermes-500 hover:border-hermes-500 hover:text-hermes-700
                     transition-colors"
        >
          + Set a target race
        </button>
      )}

      {/* Weekly stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white border border-stone-200 rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-wide text-stone-400 font-semibold">
            7-day miles
          </p>
          <p className="text-xl font-bold font-mono tabular-nums mt-0.5">
            {weekMiles.toFixed(1)}
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-wide text-stone-400 font-semibold">
            7-day time
          </p>
          <p className="text-xl font-bold font-mono tabular-nums mt-0.5">
            {formatDuration(weekTime)}
          </p>
        </div>
      </div>

      {/* Add workout / form */}
      {view === "add-workout" ? (
        <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold mb-3">Log workout</h2>
          <WorkoutForm
            onSubmit={handleCreateWorkout}
            onCancel={() => setView("idle")}
            submitLabel="Log it"
          />
        </div>
      ) : view === "edit-workout" && editing ? (
        <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold mb-3">Edit workout</h2>
          <WorkoutForm
            initial={{
              date: editing.date,
              distance_miles: Number(editing.distance_miles),
              duration_minutes: Math.floor(editing.duration_seconds / 60),
              duration_seconds: editing.duration_seconds % 60,
              workout_type: editing.workout_type,
              notes: editing.notes ?? "",
            }}
            onSubmit={handleUpdateWorkout}
            onCancel={() => { setEditing(null); setView("idle"); }}
            submitLabel="Update"
          />
        </div>
      ) : view !== "add-race" ? (
        <button
          onClick={() => setView("add-workout")}
          className="w-full py-3 mb-4 border-2 border-dashed border-stone-300 rounded-xl
                     text-sm font-medium text-stone-500 hover:border-hermes-400 hover:text-hermes-600
                     transition-colors"
        >
          + Log workout
        </button>
      ) : null}

      {/* Workout list */}
      {workouts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-400 text-sm">No workouts yet.</p>
          <p className="text-stone-400 text-xs mt-1">Log your first run to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {workouts.map((w) => (
            <WorkoutRow
              key={w.id}
              workout={w}
              onEdit={(workout) => {
                setEditing(workout);
                setView("edit-workout");
              }}
              onDelete={handleDeleteWorkout}
            />
          ))}
        </div>
      )}
    </div>
  );
}
