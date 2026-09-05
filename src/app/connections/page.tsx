"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Database, MessageCircle, Search, UserPlus, Wifi, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type FoundUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  nitraId: string;
  initials: string;
  bio?: string;
  status?: string;
};

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-cyan-400 p-px">
      <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-[#11131a] text-sm font-semibold text-white">{initials}</div>
    </div>
  );
}

export default function ConnectionsPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<FoundUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<FoundUser | null>(null);
  const [currentUser, setCurrentUser] = useState<FoundUser | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("nitra-demo-user");
    if (saved) {
      const user = JSON.parse(saved);
      setCurrentUser({
        id: user.id ?? "local",
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        nitraId: user.nitraId ?? user.id,
        initials: user.initials ?? "NC",
        bio: user.bio ?? "",
        status: user.status ?? "Available",
      });
    }
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setUsers([]);
      setError("");
      return;
    }
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Search failed");
        setUsers(data.users ?? []);
      } catch (err) {
        setUsers([]);
        setError(err instanceof Error ? err.message : "Unable to search Nitra.");
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <main className="noise min-h-screen bg-[#07080c] px-4 py-6 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-white/[.07] pb-5">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[.08] bg-white/[.03] text-white/55 transition hover:bg-white/[.07] hover:text-white" aria-label="Back to Nitra Chat">
              <ArrowLeft size={17} />
            </Link>
            <div>
              <p className="text-[10px] uppercase tracking-[.22em] text-white/25">Nitra / Phase 05</p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">Connections</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[.06] px-3 py-1.5 text-[10px] font-medium text-emerald-300 sm:flex">
            <Wifi size={12} /> Database layer active
          </div>
        </header>

        <section className="grid gap-6 py-8 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <div className="mb-6 max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[.2em] text-cyan-300/50">Find people</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">Start a new conversation.</h2>
              <p className="mt-4 text-sm leading-6 text-white/35">Search the Nitra database by Nitra ID, display name, email, or phone number. This is the first visible database-backed workflow.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={18} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search @nitra_id, name, email or phone…" className="h-14 w-full rounded-2xl border border-white/[.09] bg-white/[.035] pl-12 pr-12 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-white/20 focus:border-white/20" />
              {query && <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white" aria-label="Clear search"><X size={16} /></button>}
            </div>

            <div className="mt-4 space-y-2">
              <AnimatePresence mode="popLayout">
                {users.map((user) => (
                  <motion.button key={user.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} onClick={() => setSelected(user)} className="flex w-full items-center gap-4 rounded-2xl border border-white/[.06] bg-white/[.025] p-4 text-left transition hover:border-white/[.12] hover:bg-white/[.05]">
                    <Avatar initials={user.initials} />
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name}</p><p className="mt-1 truncate text-xs text-cyan-300/55">{user.nitraId}</p><p className="mt-1 truncate text-xs text-white/25">{user.status || "Available"}</p></div>
                    <UserPlus size={17} className="text-white/25" />
                  </motion.button>
                ))}
              </AnimatePresence>
              {loading && <div className="rounded-2xl border border-white/[.06] bg-white/[.025] p-5 text-sm text-white/35">Searching the Nitra database…</div>}
              {!loading && query.length >= 2 && users.length === 0 && !error && <div className="rounded-2xl border border-dashed border-white/[.08] p-8 text-center text-sm text-white/25">No Nitra users found for this search.</div>}
              {error && <div className="rounded-2xl border border-red-400/10 bg-red-400/[.04] p-5 text-sm text-red-200/70">{error}<p className="mt-1 text-xs text-white/20">Check your MONGODB_URI and make sure the database is reachable.</p></div>}
              {query.length < 2 && <div className="rounded-2xl border border-white/[.06] bg-white/[.02] p-8 text-center text-sm text-white/20">Type at least 2 characters to search.</div>}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/[.07] bg-white/[.035] p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><Database size={18} /></div><div><p className="text-sm font-semibold">Phase 5 live surface</p><p className="text-xs text-white/25">MongoDB → Next.js API → UI</p></div></div>
              <div className="mt-6 space-y-3 text-xs text-white/35"><div className="flex justify-between"><span>User model</span><span className="text-emerald-300/70">Ready</span></div><div className="flex justify-between"><span>Registration API</span><span className="text-emerald-300/70">Ready</span></div><div className="flex justify-between"><span>User search API</span><span className="text-emerald-300/70">Ready</span></div><div className="flex justify-between"><span>Conversation persistence</span><span className="text-white/25">Next</span></div></div>
            </div>

            {currentUser && <div className="rounded-3xl border border-white/[.07] bg-gradient-to-br from-white/[.06] to-white/[.02] p-6"><p className="text-[10px] uppercase tracking-[.2em] text-white/25">Your Nitra identity</p><div className="mt-5 flex items-center gap-3"><Avatar initials={currentUser.initials} /><div className="min-w-0"><p className="truncate font-semibold">{currentUser.name}</p><p className="truncate text-xs text-cyan-300/55">{currentUser.nitraId}</p></div></div><Link href="/profile" className="mt-5 flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[.08] bg-white/[.025] text-xs text-white/55 transition hover:bg-white/[.06] hover:text-white"><MessageCircle size={14} /> Open profile</Link></div>}
          </aside>
        </section>
      </div>

      <AnimatePresence>
        {selected && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" onClick={() => setSelected(null)}>
          <motion.div initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl border border-white/[.09] bg-[#11131a] p-6 shadow-2xl">
            <div className="flex items-start justify-between"><div className="flex items-center gap-3"><Avatar initials={selected.initials} /><div><p className="font-semibold">{selected.name}</p><p className="text-xs text-cyan-300/55">{selected.nitraId}</p></div></div><button onClick={() => setSelected(null)} className="text-white/25 hover:text-white" aria-label="Close"><X size={18} /></button></div>
            <p className="mt-6 text-sm leading-6 text-white/40">{selected.bio || selected.status || "Nitra user"}</p>
            <button onClick={() => alert("Conversation creation will connect to the conversation API in the next database step.")} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black hover:bg-white/90"><MessageCircle size={16} /> Start conversation</button>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </main>
  );
}
