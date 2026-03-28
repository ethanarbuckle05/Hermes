"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  userEmail: string;
  onSignOut: () => void;
}

export default function Nav({ userEmail, onSignOut }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl tracking-tight">Hermes</h1>
        <p className="text-xs text-earth-muted mt-0.5">{userEmail}</p>
      </div>
      <div className="flex items-center gap-4">
        <nav className="flex gap-1 text-sm">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded transition-colors ${
              pathname === "/"
                ? "bg-earth-card border border-earth-border text-earth-text"
                : "text-earth-muted hover:text-earth-text"
            }`}
          >
            My Log
          </Link>
          <Link
            href="/groups"
            className={`px-3 py-1.5 rounded transition-colors ${
              pathname.startsWith("/groups")
                ? "bg-earth-card border border-earth-border text-earth-text"
                : "text-earth-muted hover:text-earth-text"
            }`}
          >
            Groups
          </Link>
        </nav>
        <button
          onClick={onSignOut}
          className="text-xs text-earth-muted hover:text-earth-text transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
