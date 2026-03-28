"use client";

import { createClient } from "@/lib/supabase/client";
import { Group, Workout, WORKOUT_COLORS, WORKOUT_LABELS } from "@/lib/types";
import { formatDate, formatDuration, formatPace } from "@/lib/utils";
import Nav from "@/components/Nav";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface MemberStats {
  user_id: string;
  email: string;
  week_miles: number;
  week_sessions: number;
}

interface GroupWorkout extends Workout {
  user_email: string;
}

export default function GroupDetailPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<MemberStats[]>([]);
  const [workouts, setWorkouts] = useState<GroupWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserEmail(user.email ?? "");
    setUserId(user.id);

    const { data: g } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (!g) { setLoading(false); return; }
    setGroup(g as Group);
    setNameValue(g.name);

    const { data: memberRows } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);

    if (!memberRows) { setLoading(false); return; }

    const memberIds = memberRows.map((m: { user_id: string }) => m.user_id);

    const { data: groupWorkouts } = await supabase
      .from("workouts")
      .select("*")
      .eq("group_id", groupId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    const { data: allMemberWorkouts } = await supabase
      .from("workouts")
      .select("user_id, distance_miles, date")
      .in("user_id", memberIds);

    const emailMap: Record<string, string> = {};

    for (const mid of memberIds) {
      if (mid === user.id) {
        emailMap[mid] = user.email ?? mid.slice(0, 8);
      } else {
        emailMap[mid] = mid.slice(0, 8) + "...";
      }
    }

    const { data: memberProfiles } = await supabase
      .from("group_members")
      .select("user_id, profiles:user_id(email)")
      .eq("group_id", groupId);

    if (memberProfiles) {
      for (const mp of memberProfiles) {
        const profile = mp.profiles as any;
        if (profile?.email) {
          emailMap[mp.user_id] = profile.email;
        }
      }
    }

    const now = new Date();
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    const memberStats: MemberStats[] = memberIds.map((uid: string) => {
      const userWorkouts = (allMemberWorkouts ?? []).filter(
        (w: any) => w.user_id === uid && new Date(w.date + "T12:00:00") >= weekAgo
      );
      return {
        user_id: uid,
        email: emailMap[uid] ?? uid.slice(0, 8),
        week_miles: userWorkouts.reduce((s: number, w: any) => s + Number(w.distance_miles), 0),
        week_sessions: userWorkouts.length,
      };
    });

    memberStats.sort((a, b) => b.week_miles - a.week_miles);
    setMembers(memberStats);

    const mappedWorkouts: GroupWorkout[] = ((groupWorkouts ?? []) as Workout[]).map((w) => ({
      ...w,
      user_email: emailMap[w.user_id] ?? w.user_id.slice(0, 8),
    }));
    setWorkouts(mappedWorkouts);

    setLoading(false);
  }, [supabase, groupId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function copyInviteCode() {
    if (!group) return;
    navigator.clipboard.writeText(group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDeleteGroup() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    await supabase.from("groups").delete().eq("id", groupId);
    router.push("/groups");
  }

  async function handleLeaveGroup() {
    if (!confirmingLeave) {
      setConfirmingLeave(true);
      return;
    }
    await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);
    router.push("/groups");
  }

  function startEditingName() {
    if (!group || group.created_by !== userId) return;
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }

  async function saveName() {
    setEditingName(false);
    if (!group || !nameValue.trim() || nameValue.trim() === group.name) {
      setNameValue(group?.name ?? "");
      return;
    }
    await supabase
      .from("groups")
      .update({ name: nameValue.trim() })
      .eq("id", groupId);
    setGroup({ ...group, name: nameValue.trim() });
  }

  const isCreator = group?.created_by === userId;

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-sm text-earth-muted">
        Loading...
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-sm text-earth-muted">
        Group not found.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24">
      <Nav userEmail={userEmail} onSignOut={handleSignOut} />

      {/* Group header */}
      <div className="bg-earth-card border border-earth-border rounded-lg p-5 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-earth-muted">Group</p>
            {editingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") { setEditingName(false); setNameValue(group.name); } }}
                className="text-lg font-semibold mt-1 bg-transparent border-b border-earth-border
                           focus:outline-none focus:border-earth-sage w-full text-earth-text"
              />
            ) : (
              <h2
                className={`text-lg font-semibold mt-1 ${isCreator ? "cursor-pointer hover:text-earth-sage transition-colors" : ""}`}
                onClick={startEditingName}
                title={isCreator ? "Click to rename" : undefined}
              >
                {group.name}
              </h2>
            )}
          </div>
          <button
            onClick={copyInviteCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tracking-widest
                       border border-earth-border rounded hover:bg-earth-bg transition-colors shrink-0"
            title="Copy invite code"
          >
            {group.invite_code}
            <span className="text-earth-muted">{copied ? "✓" : "⎘"}</span>
          </button>
        </div>
        <p className="text-xs text-earth-muted mt-2">
          {members.length} {members.length === 1 ? "member" : "members"}
        </p>

        {/* Delete / Leave */}
        <div className="mt-3 pt-3 border-t border-earth-border">
          {isCreator ? (
            <button
              onClick={handleDeleteGroup}
              onBlur={() => setConfirmingDelete(false)}
              className={`text-xs transition-colors ${
                confirmingDelete
                  ? "text-red-700"
                  : "text-earth-muted hover:text-red-700"
              }`}
            >
              {confirmingDelete ? "Click again to delete" : "Delete group"}
            </button>
          ) : (
            <button
              onClick={handleLeaveGroup}
              onBlur={() => setConfirmingLeave(false)}
              className={`text-xs transition-colors ${
                confirmingLeave
                  ? "text-red-700"
                  : "text-earth-muted hover:text-red-700"
              }`}
            >
              {confirmingLeave ? "Click again to leave" : "Leave group"}
            </button>
          )}
        </div>
      </div>

      {/* Weekly leaderboard */}
      <div className="mb-5">
        <h3 className="text-[10px] uppercase tracking-widest text-earth-muted mb-3">
          Weekly leaderboard
        </h3>
        <div className="bg-earth-card border border-earth-border rounded-lg divide-y divide-earth-border">
          {members.map((m, i) => (
            <div key={m.user_id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-sm font-mono text-earth-muted w-5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{m.email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-mono tabular-nums">{m.week_miles.toFixed(1)} mi</p>
                <p className="text-[10px] text-earth-muted">{m.week_sessions} sessions</p>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-earth-muted">
              No members yet.
            </div>
          )}
        </div>
      </div>

      {/* Group workout feed */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest text-earth-muted mb-3">
          Group feed
        </h3>
        {workouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-earth-muted text-sm">No group workouts yet.</p>
            <p className="text-earth-muted text-xs mt-1">
              Members can tag workouts with this group when logging.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {workouts.map((w) => (
              <div
                key={w.id}
                className="bg-earth-card border border-earth-border rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-earth-muted">{formatDate(w.date)}</span>
                  <span className="text-xs text-earth-tan">{w.user_email}</span>
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded uppercase tracking-wide ${
                      WORKOUT_COLORS[w.workout_type]
                    }`}
                  >
                    {WORKOUT_LABELS[w.workout_type]}
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="text-lg tabular-nums font-mono">
                    {w.distance_miles} <span className="text-xs font-sans text-earth-muted">mi</span>
                  </span>
                  <span className="text-sm text-earth-muted tabular-nums font-mono">
                    {formatDuration(w.duration_seconds)}
                  </span>
                  <span className="text-sm text-earth-muted tabular-nums font-mono">
                    {formatPace(w.distance_miles, w.duration_seconds)}
                  </span>
                </div>
                {w.notes && (
                  <p className="text-xs text-earth-muted mt-1.5 line-clamp-2">{w.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
