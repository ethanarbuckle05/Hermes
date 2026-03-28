"use client";

import { createClient } from "@/lib/supabase/client";
import { Group } from "@/lib/types";
import Nav from "@/components/Nav";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function GroupsPage() {
  const supabase = createClient();

  const [groups, setGroups] = useState<(Group & { member_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    setUserEmail(user.email ?? "");

    // Get user's group memberships
    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    if (memberships && memberships.length > 0) {
      const groupIds = memberships.map((m: { group_id: string }) => m.group_id);
      const { data: g } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds);

      if (g) {
        // Get member counts
        const withCounts = await Promise.all(
          (g as Group[]).map(async (group) => {
            const { count } = await supabase
              .from("group_members")
              .select("*", { count: "exact", head: true })
              .eq("group_id", group.id);
            return { ...group, member_count: count ?? 0 };
          })
        );
        setGroups(withCounts);
      }
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) { setError("Group name is required"); return; }
    setError("");
    setSaving(true);

    const inviteCode = generateInviteCode();

    const { data: group, error: insertErr } = await supabase
      .from("groups")
      .insert({
        name: newName.trim(),
        created_by: userId,
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (insertErr) { setError(insertErr.message); setSaving(false); return; }

    // Auto-add creator as member
    await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: userId,
    });

    setNewName("");
    setShowCreate(false);
    setSaving(false);
    fetchData();
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) { setError("Invite code is required"); return; }
    setError("");
    setSaving(true);

    const { data: group } = await supabase
      .from("groups")
      .select("id")
      .eq("invite_code", joinCode.trim().toUpperCase())
      .single();

    if (!group) { setError("Invalid invite code"); setSaving(false); return; }

    // Check if already a member
    const { data: existing } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", group.id)
      .eq("user_id", userId)
      .single();

    if (existing) { setError("You're already in this group"); setSaving(false); return; }

    const { error: joinErr } = await supabase
      .from("group_members")
      .insert({ group_id: group.id, user_id: userId });

    if (joinErr) { setError(joinErr.message); setSaving(false); return; }

    setJoinCode("");
    setShowJoin(false);
    setSaving(false);
    fetchData();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const inputClass =
    "w-full px-3 py-2 border border-earth-border rounded text-sm bg-white " +
    "focus:outline-none focus:border-earth-text";

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-sm text-earth-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24">
      <Nav userEmail={userEmail} onSignOut={handleSignOut} />

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setShowCreate(true); setShowJoin(false); setError(""); }}
          className="px-4 py-2 text-sm bg-earth-sage text-white rounded
                     hover:opacity-90 transition-opacity"
        >
          Create group
        </button>
        <button
          onClick={() => { setShowJoin(true); setShowCreate(false); setError(""); }}
          className="px-4 py-2 text-sm text-earth-muted border border-earth-border rounded
                     hover:bg-earth-bg transition-colors"
        >
          Join group
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-earth-card border border-earth-border rounded-lg p-5 mb-5">
          <h2 className="text-sm font-semibold mb-4">Create a group</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs text-earth-muted mb-1.5">Group name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={inputClass}
                placeholder="e.g. Marathon Crew"
                required
              />
            </div>
            {error && <p className="text-sm text-red-700 bg-red-50/50 rounded px-3 py-2">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowCreate(false); setError(""); }}
                className="flex-1 py-2.5 text-sm text-earth-muted border border-earth-border
                           rounded hover:bg-earth-bg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-earth-sage text-white text-sm rounded
                           hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Join form */}
      {showJoin && (
        <div className="bg-earth-card border border-earth-border rounded-lg p-5 mb-5">
          <h2 className="text-sm font-semibold mb-4">Join a group</h2>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs text-earth-muted mb-1.5">Invite code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className={inputClass + " font-mono uppercase tracking-widest"}
                placeholder="ABC123"
                maxLength={6}
                required
              />
            </div>
            {error && <p className="text-sm text-red-700 bg-red-50/50 rounded px-3 py-2">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowJoin(false); setError(""); }}
                className="flex-1 py-2.5 text-sm text-earth-muted border border-earth-border
                           rounded hover:bg-earth-bg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-earth-sage text-white text-sm rounded
                           hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Joining..." : "Join"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Group list */}
      {groups.length === 0 && !showCreate && !showJoin ? (
        <div className="text-center py-16">
          <p className="text-earth-muted text-sm">No groups yet.</p>
          <p className="text-earth-muted text-xs mt-1">Create one or join with an invite code.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="block bg-earth-card border border-earth-border rounded-lg px-4 py-3
                         hover:border-earth-tan/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{g.name}</h3>
                  <p className="text-xs text-earth-muted mt-0.5">
                    {g.member_count} {g.member_count === 1 ? "member" : "members"}
                  </p>
                </div>
                <span className="text-xs font-mono text-earth-muted tracking-widest">
                  {g.invite_code}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
