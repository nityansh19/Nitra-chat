"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, ChevronRight, Copy, MessageCircle, Search, Sparkles, UserPlus, Users, Wifi, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { findOrCreateDirectConversation, mapFirestoreError, searchUsers, type UserProfile } from "@/lib/firebase-chat";

function Avatar({ initials, online = false, large = false }: { initials: string; online?: boolean; large?: boolean }) {
  return <div className={`relative flex shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-400/30 via-indigo-500/15 to-cyan-300/10 font-semibold text-white shadow-[0_10px_35px_rgba(0,0,0,.22)] ${large ? "h-20 w-20 rounded-[24px] text-xl" : "h-12 w-12 text-xs"}`}>
    {initials}<span className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/[.07]" />
    {online && <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-[#08090d] bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.65)]" />}
  </div>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-white/[.08] bg-white/[.035] px-2.5 py-1 text-[9px] uppercase tracking-[.18em] text-white/35">{children}</span>;
}

export default function ConnectionsPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [creating, setCreating] = useState(false);
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nitra-demo-user");
      if (!saved) return;
      const user = JSON.parse(saved);
      if (user.uid) setCurrentUser({ uid: user.uid, name: user.name, email: user.email, phone: user.phone || "", nitraId: user.id || user.nitraId || "@nitra_user", initials: user.initials || "NU", bio: user.bio || "", status: user.status || "Available" });
    } catch { setCurrentUser(null); }
  }, []);

  useEffect(() => {
    if (query.trim().length < 2 || !currentUser?.uid) { setUsers([]); setError(""); return; }
    const timer = window.setTimeout(async () => {
      setLoading(true); setError("");
      try { setUsers(await searchUsers(query, currentUser.uid)); }
      catch (err) { setUsers([]); setError(mapFirestoreError(err)); }
      finally { setLoading(false); }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, currentUser?.uid]);

  const headline = useMemo(() => query.trim() ? `Results for “${query.trim()}”` : "People you can talk to.", [query]);

  async function addPerson(person: UserProfile) {
    if (!currentUser?.uid) return setError("Sign in again before adding someone.");
    setCreating(true); setError("");
    try {
      await findOrCreateDirectConversation(currentUser.uid, person.uid);
      setAdded((prev) => ({ ...prev, [person.uid]: true }));
      setSelected(person);
    } catch (err) { setError(mapFirestoreError(err)); }
    finally { setCreating(false); }
  }

  async function copyId() {
    if (!currentUser?.nitraId) return;
    await navigator.clipboard?.writeText(currentUser.nitraId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return <main className="relative min-h-screen overflow-hidden bg-[#07080c] text-white noise">
    <div className="pointer-events-none absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-violet-600/[.09] blur-[130px]" />
    <div className="pointer-events-none absolute right-[-100px] top-[35%] h-[360px] w-[360px] rounded-full bg-cyan-400/[.07] blur-[120px]" />
    <div className="relative mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-7 lg:px-10">
      <header className="flex items-center justify-between border-b border-white/[.06] pb-5">
        <div className="flex items-center gap-3"><Link href="/" className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/[.08] bg-white/[.025] text-white/45 transition-all duration-300 hover:-translate-x-0.5 hover:border-white/[.16] hover:bg-white/[.06] hover:text-white"><ArrowLeft size={17} /></Link><div><p className="text-[9px] uppercase tracking-[.28em] text-cyan-300/45">Nitra / Social layer</p><h1 className="mt-1 text-lg font-semibold tracking-tight">People</h1></div></div>
        <div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[.055] px-3 py-1.5 text-[10px] text-emerald-300/75 sm:flex"><Wifi size={12} /> Live</div>
      </header>

      <div className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 rounded-[28px] border border-white/[.07] bg-white/[.025] p-5 shadow-[0_25px_90px_rgba(0,0,0,.22)] backdrop-blur-xl sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><Pill><Users size={10} className="mr-1 inline" /> Discover</Pill><h2 className="mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">{headline}</h2><p className="mt-2 text-sm text-white/30">Search by Nitra ID, name, email or phone. Your Nitra ID is the easiest way to find you.</p></div><div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/10 bg-violet-400/[.06] text-violet-200/70 sm:flex"><Sparkles size={18} /></div></div>
          <div className="group relative mt-7"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 transition group-focus-within:text-cyan-300/65" size={18} /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search @nitra_id or name…" className="h-14 w-full rounded-2xl border border-white/[.08] bg-black/20 pl-12 pr-12 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-cyan-300/25 focus:bg-white/[.045] focus:shadow-[0_0_0_5px_rgba(34,211,238,.045),0_15px_50px_rgba(0,0,0,.18)]" />{query && <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/25 transition hover:bg-white/[.07] hover:text-white"><X size={15} /></button>}{!query && <kbd className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-lg border border-white/[.07] px-2 py-1 text-[9px] text-white/20 sm:block">TYPE TO SEARCH</kbd>}</div>
          <div className="mt-5 min-h-[390px]">
            <AnimatePresence mode="popLayout">{users.map((person, index) => <motion.button key={person.uid} layout initial={{ opacity: 0, y: 16, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: index * .035, type: "spring", stiffness: 380, damping: 28 } }} exit={{ opacity: 0, y: -10, scale: .98 }} whileHover={{ y: -2 }} whileTap={{ scale: .985 }} onClick={() => setSelected(person)} className="group mb-2 flex w-full items-center gap-4 rounded-2xl border border-white/[.06] bg-white/[.018] p-4 text-left transition-colors hover:border-white/[.12] hover:bg-white/[.045]"><Avatar initials={person.initials} online /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{person.name}</p><p className="mt-1 truncate text-xs text-cyan-300/55">{person.nitraId}</p><p className="mt-1 truncate text-[11px] text-white/22">{person.bio || person.status || "Available"}</p></div><div className="flex items-center gap-2 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-white/70"><span className="hidden text-[10px] sm:block">View</span><ChevronRight size={16} /></div></motion.button>)}</AnimatePresence>
            {loading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 rounded-2xl border border-white/[.06] bg-white/[.02] p-5 text-sm text-white/35"><span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" /> Searching Nitra…</motion.div>}
            {!loading && error && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-red-400/10 bg-red-400/[.04] p-5 text-sm text-red-200/70">{error}</motion.div>}
            {!loading && !error && query.length >= 2 && users.length === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[.08] text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[.07] bg-white/[.025] text-white/25"><Search size={20} /></div><p className="mt-4 text-sm font-medium text-white/45">No one found</p><p className="mt-1 max-w-xs text-xs leading-5 text-white/20">Try their exact Nitra ID, display name or another search.</p></motion.div>}
            {query.length < 2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[.07] bg-gradient-to-b from-white/[.015] to-transparent text-center"><div className="relative flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/[.08] bg-white/[.025]"><Users size={23} className="text-white/25" /><span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-cyan-300/40" /></div><p className="mt-5 text-sm font-medium text-white/45">Find your people</p><p className="mt-1 max-w-sm text-xs leading-5 text-white/20">Type at least two characters to discover Nitra users and start a conversation.</p></motion.div>}
          </div>
        </section>

        <aside className="space-y-4">{currentUser && <motion.div layout className="relative overflow-hidden rounded-[28px] border border-white/[.08] bg-gradient-to-br from-white/[.055] via-white/[.025] to-cyan-400/[.025] p-6 shadow-[0_25px_80px_rgba(0,0,0,.22)]"><div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/[.08] blur-3xl" /><p className="relative text-[9px] uppercase tracking-[.24em] text-white/25">Your identity</p><div className="relative mt-5 flex items-center gap-4"><Avatar initials={currentUser.initials} large /><div className="min-w-0"><p className="truncate font-semibold">{currentUser.name}</p><p className="mt-1 truncate text-xs text-cyan-300/55">{currentUser.nitraId}</p><p className="mt-1 text-[10px] text-emerald-300/55">● Available</p></div></div><button onClick={copyId} className="relative mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[.08] bg-white/[.025] text-xs text-white/50 transition-all hover:border-white/[.15] hover:bg-white/[.055] hover:text-white">{copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}{copied ? "Nitra ID copied" : "Copy my Nitra ID"}</button><Link href="/profile" className="relative mt-2 flex h-10 items-center justify-center rounded-xl text-[11px] text-white/25 transition hover:text-white/65">Edit profile</Link></motion.div>}
          <div className="rounded-[28px] border border-white/[.07] bg-white/[.02] p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/[.06] text-cyan-200/60"><UserPlus size={17} /></div><div><p className="text-sm font-medium">How to connect</p><p className="text-[10px] text-white/20">Three seconds. One ID.</p></div></div><div className="mt-6 space-y-4">{[["01","Search their @Nitra ID"],["02","Open their profile"],["03","Add + start chatting"]].map(([n,t]) => <div key={n} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[.07] text-[9px] text-white/25">{n}</span><span className="text-xs text-white/35">{t}</span></div>)}</div></div>
        </aside>
      </div>
    </div>

    <AnimatePresence>{selected && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-4 backdrop-blur-md sm:items-center" onClick={() => setSelected(null)}><motion.div initial={{ opacity: 0, y: 30, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 360, damping: 28 } }} exit={{ opacity: 0, y: 20, scale: .98 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-white/[.1] bg-[#101219] p-7 shadow-[0_35px_100px_rgba(0,0,0,.6)]"><div className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-violet-500/[.09] blur-3xl" /><button onClick={() => setSelected(null)} className="absolute right-5 top-5 rounded-xl p-2 text-white/25 transition hover:bg-white/[.06] hover:text-white"><X size={17} /></button><div className="relative flex items-center gap-4"><Avatar initials={selected.initials} online large /><div className="min-w-0"><Pill>Available</Pill><h3 className="mt-2 truncate text-xl font-semibold">{selected.name}</h3><p className="mt-1 truncate text-xs text-cyan-300/55">{selected.nitraId}</p></div></div><p className="relative mt-6 rounded-2xl border border-white/[.06] bg-white/[.025] p-4 text-sm leading-6 text-white/35">{selected.bio || "Ready to connect on Nitra."}</p><button disabled={creating} onClick={() => addPerson(selected)} className="relative mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-wait disabled:opacity-60">{added[selected.uid] ? <><Check size={16} /> Added · Open chat</> : <><MessageCircle size={16} /> {creating ? "Adding…" : "Add + start conversation"}</>}</button>{added[selected.uid] && <Link href="/" className="relative mt-2 flex h-10 items-center justify-center rounded-xl border border-white/[.07] text-xs text-white/40 transition hover:bg-white/[.04] hover:text-white">Go to conversations <ChevronRight size={13} /></Link>}</motion.div></motion.div>}</AnimatePresence>
  </main>;
}
