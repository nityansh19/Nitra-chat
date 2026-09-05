"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, CheckCircle2, ChevronRight, Copy, MessageCircle, Search, Send, Sparkles, UserPlus, Users, Wifi, X, UserRound, Clock3 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  findOrCreateDirectConversation,
  getUserProfile,
  mapFirestoreError,
  searchUsers,
  sendFriendRequest,
  subscribeToFriendRequests,
  subscribeToFriends,
  updateFriendRequest,
  type FriendRequest,
  type UserProfile,
} from "@/lib/firebase-chat";

type Tab = "discover" | "requests" | "friends";

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
  const [tab, setTab] = useState<Tab>("discover");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nitra-demo-user");
      if (!saved) return;
      const user = JSON.parse(saved);
      if (user.uid) setCurrentUser({ uid: user.uid, name: user.name, email: user.email, phone: user.phone || "", nitraId: user.id || user.nitraId || "@nitra_user", initials: user.initials || "NU", bio: user.bio || "", status: user.status || "Available" });
    } catch { setCurrentUser(null); }
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribeRequests = subscribeToFriendRequests(currentUser.uid, setRequests);
    const unsubscribeFriends = subscribeToFriends(currentUser.uid, setFriendIds);
    return () => { unsubscribeRequests(); unsubscribeFriends(); };
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid || query.trim().length < 2 || tab !== "discover") { setUsers([]); setLoading(false); return; }
    const timer = window.setTimeout(async () => {
      setLoading(true); setError("");
      try { setUsers(await searchUsers(query, currentUser.uid)); }
      catch (err) { setUsers([]); setError(mapFirestoreError(err)); }
      finally { setLoading(false); }
    }, 280);
    return () => window.clearTimeout(timer);
  }, [query, currentUser?.uid, tab]);

  useEffect(() => {
    const ids = [...new Set([...friendIds, ...requests.map((r) => r.senderId), ...requests.map((r) => r.receiverId)])];
    if (!ids.length) return;
    let alive = true;
    Promise.all(ids.map(async (id) => [id, await getUserProfile(id)] as const)).then((entries) => {
      if (!alive) return;
      setProfiles((prev) => ({ ...prev, ...Object.fromEntries(entries.filter(([, profile]): profile is UserProfile => profile !== null)) }));
    }).catch(() => undefined);
    return () => { alive = false; };
  }, [friendIds, requests]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const incoming = useMemo(() => requests.filter((r) => r.receiverId === currentUser?.uid), [requests, currentUser?.uid]);
  const outgoing = useMemo(() => requests.filter((r) => r.senderId === currentUser?.uid), [requests, currentUser?.uid]);
  const friends = useMemo(() => friendIds.map((id) => profiles[id]).filter(Boolean) as UserProfile[], [friendIds, profiles]);
  const pendingFor = (uid: string) => requests.some((r) => (r.senderId === uid && r.receiverId === currentUser?.uid) || (r.senderId === currentUser?.uid && r.receiverId === uid));

  async function requestFriend(person: UserProfile) {
    if (!currentUser?.uid) return setError("Sign in again before adding people.");
    setActionId(person.uid); setError("");
    try {
      await sendFriendRequest(currentUser.uid, person.uid);
      setSent((prev) => ({ ...prev, [person.uid]: true }));
      setToast(`Request sent to ${person.name}`);
    } catch (err) { setError(mapFirestoreError(err)); }
    finally { setActionId(""); }
  }

  async function respond(request: FriendRequest, status: "accepted" | "declined" | "cancelled") {
    setActionId(request.id); setError("");
    try {
      await updateFriendRequest(request.id, status);
      if (status === "accepted" && currentUser?.uid) {
        await findOrCreateDirectConversation(currentUser.uid, request.senderId);
        setToast("You're connected. Your conversation is ready.");
      } else setToast(status === "declined" ? "Request declined" : "Request cancelled");
    } catch (err) { setError(mapFirestoreError(err)); }
    finally { setActionId(""); }
  }

  async function messageFriend(person: UserProfile) {
    if (!currentUser?.uid) return;
    setActionId(person.uid);
    try {
      await findOrCreateDirectConversation(currentUser.uid, person.uid);
      window.location.href = "/";
    } catch (err) { setError(mapFirestoreError(err)); }
    finally { setActionId(""); }
  }

  async function copyId() {
    if (!currentUser?.nitraId) return;
    await navigator.clipboard?.writeText(currentUser.nitraId);
    setCopied(true);
    setToast("Your Nitra ID is copied");
    window.setTimeout(() => setCopied(false), 1500);
  }

  return <main className="relative min-h-screen overflow-hidden bg-[#07080c] text-white noise">
    <div className="pointer-events-none absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-violet-600/[.09] blur-[130px]" />
    <div className="pointer-events-none absolute right-[-100px] top-[35%] h-[360px] w-[360px] rounded-full bg-cyan-400/[.07] blur-[120px]" />
    <div className="relative mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-7 lg:px-10">
      <header className="flex items-center justify-between border-b border-white/[.06] pb-5">
        <div className="flex items-center gap-3"><Link href="/" className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/[.08] bg-white/[.025] text-white/45 transition-all duration-300 hover:-translate-x-0.5 hover:border-white/[.16] hover:bg-white/[.06] hover:text-white"><ArrowLeft size={17} /></Link><div><p className="text-[9px] uppercase tracking-[.28em] text-cyan-300/45">Nitra / Social layer</p><h1 className="mt-1 text-lg font-semibold tracking-tight">People</h1></div></div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[.055] px-3 py-1.5 text-[10px] text-emerald-300/75"><Wifi size={12} /> Live</div>
      </header>

      <div className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 rounded-[28px] border border-white/[.07] bg-white/[.025] p-5 shadow-[0_25px_90px_rgba(0,0,0,.22)] backdrop-blur-xl sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><Pill><Users size={10} className="mr-1 inline" /> Social</Pill><h2 className="mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">{tab === "discover" ? "Find your people." : tab === "requests" ? "Your requests." : "Your people."}</h2><p className="mt-2 max-w-2xl text-sm text-white/30">{tab === "discover" ? "Find someone by their Nitra ID, then send a request before starting a private conversation." : tab === "requests" ? "Accept people you know, decline requests you don't, or cancel requests you've sent." : "Everyone you've connected with on Nitra, in one place."}</p></div><div className="flex rounded-2xl border border-white/[.07] bg-black/20 p-1"><TabButton active={tab === "discover"} onClick={() => setTab("discover")} icon={<Search size={13} />}>Discover</TabButton><TabButton active={tab === "requests"} onClick={() => setTab("requests")} icon={<Clock3 size={13} />} badge={incoming.length}>Requests</TabButton><TabButton active={tab === "friends"} onClick={() => setTab("friends")} icon={<Users size={13} />} badge={friends.length}>Friends</TabButton></div></div>

          {tab === "discover" && <>
            <div className="group relative mt-7"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 transition group-focus-within:text-cyan-300/65" size={18} /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search @nitra_id or name…" className="h-14 w-full rounded-2xl border border-white/[.08] bg-black/20 pl-12 pr-12 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-cyan-300/25 focus:bg-white/[.045] focus:shadow-[0_0_0_5px_rgba(34,211,238,.045),0_15px_50px_rgba(0,0,0,.18)]" />{query && <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/25 transition hover:bg-white/[.07] hover:text-white"><X size={15} /></button>}</div>
            <div className="mt-5 min-h-[380px]">{loading && <LoadingState text="Searching Nitra…" />}{!loading && error && <ErrorState text={error} />}{!loading && !error && query.trim().length >= 2 && users.length === 0 && <EmptyState icon={<Search size={20} />} title="No one found" text="Try their exact Nitra ID or a different part of their name." />}{!loading && !error && query.trim().length < 2 && <EmptyState icon={<UserPlus size={21} />} title="Start with a Nitra ID" text="Type at least two characters. Nitra IDs are the fastest way to find a friend." />}
              <AnimatePresence mode="popLayout">{users.map((person, index) => <PersonRow key={person.uid} person={person} index={index} status={friendIds.includes(person.uid) ? "friend" : pendingFor(person.uid) || sent[person.uid] ? "pending" : "add"} busy={actionId === person.uid} onOpen={() => setSelected(person)} onAdd={() => requestFriend(person)} onMessage={() => messageFriend(person)} />)}</AnimatePresence>
            </div>
          </>}

          {tab === "requests" && <div className="mt-7 min-h-[380px] space-y-7">
            <RequestGroup title="Incoming" icon={<UserPlus size={14} />} items={incoming} profiles={profiles} actionId={actionId} onAction={respond} />
            <RequestGroup title="Sent" icon={<Send size={14} />} items={outgoing} profiles={profiles} actionId={actionId} onAction={respond} sent />
            {!incoming.length && !outgoing.length && <EmptyState icon={<CheckCircle2 size={21} />} title="You're all caught up" text="New friend requests will appear here in real time." />}
          </div>}

          {tab === "friends" && <div className="mt-7 min-h-[380px]">{!friends.length ? <EmptyState icon={<Users size={21} />} title="No connections yet" text="Discover someone, send a request, and they'll appear here after accepting." /> : <div className="grid gap-2 sm:grid-cols-2">{friends.map((person, index) => <motion.div key={person.uid} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: index * .04 } }} whileHover={{ y: -2 }} className="group rounded-2xl border border-white/[.06] bg-white/[.018] p-4 transition hover:border-white/[.12] hover:bg-white/[.04]"><div className="flex items-center gap-3"><Avatar initials={person.initials} online /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{person.name}</p><p className="mt-1 truncate text-xs text-cyan-300/55">{person.nitraId}</p></div></div><div className="mt-4 flex gap-2"><button onClick={() => messageFriend(person)} className="flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-white text-[11px] font-semibold text-black transition hover:scale-[1.01]"><MessageCircle size={13} /> Message</button><button onClick={() => setSelected(person)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[.08] text-white/40 transition hover:bg-white/[.06] hover:text-white" title="View profile"><UserRound size={14} /></button></div></motion.div>)}</div>}</div>}
        </section>

        <aside className="space-y-4">
          {currentUser && <motion.div layout className="relative overflow-hidden rounded-[28px] border border-white/[.08] bg-gradient-to-br from-white/[.055] via-white/[.025] to-cyan-400/[.025] p-6 shadow-[0_25px_80px_rgba(0,0,0,.22)]"><div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/[.08] blur-3xl" /><p className="relative text-[9px] uppercase tracking-[.24em] text-white/25">Your identity</p><div className="relative mt-5 flex items-center gap-4"><Avatar initials={currentUser.initials} large /><div className="min-w-0"><p className="truncate font-semibold">{currentUser.name}</p><p className="mt-1 truncate text-xs text-cyan-300/55">{currentUser.nitraId}</p><p className="mt-1 text-[10px] text-emerald-300/55">● {currentUser.status || "Available"}</p></div></div><button onClick={copyId} className="relative mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[.08] bg-white/[.025] text-xs text-white/50 transition-all hover:border-white/[.15] hover:bg-white/[.055] hover:text-white">{copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}{copied ? "Nitra ID copied" : "Copy my Nitra ID"}</button><Link href="/profile" className="relative mt-2 flex h-10 items-center justify-center rounded-xl text-[11px] text-white/25 transition hover:text-white/65">Edit profile</Link></motion.div>}
          <div className="rounded-[28px] border border-white/[.07] bg-white/[.02] p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/[.06] text-cyan-200/60"><Sparkles size={17} /></div><div><p className="text-sm font-medium">The Nitra flow</p><p className="text-[10px] text-white/20">Simple by design.</p></div></div><div className="mt-6 space-y-4">{[["01","Share your @Nitra ID"],["02","Send a friend request"],["03","Accept and start chatting"]].map(([n,t]) => <div key={n} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[.07] text-[9px] text-white/25">{n}</span><span className="text-xs text-white/35">{t}</span></div>)}</div></div>
          <div className="rounded-[28px] border border-white/[.07] bg-white/[.02] p-6"><p className="text-[9px] uppercase tracking-[.22em] text-white/20">Privacy</p><p className="mt-3 text-xs leading-5 text-white/30">Your Nitra ID is designed for discovery. Keep personal contact details private and only share them when you choose.</p></div>
        </aside>
      </div>
    </div>

    <AnimatePresence>{selected && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-4 backdrop-blur-md sm:items-center" onClick={() => setSelected(null)}><motion.div initial={{ opacity: 0, y: 30, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 360, damping: 28 } }} exit={{ opacity: 0, y: 20, scale: .98 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-white/[.1] bg-[#101219] p-7 shadow-[0_35px_100px_rgba(0,0,0,.6)]"><div className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-violet-500/[.09] blur-3xl" /><button onClick={() => setSelected(null)} className="absolute right-5 top-5 rounded-xl p-2 text-white/25 transition hover:bg-white/[.06] hover:text-white"><X size={17} /></button><div className="relative flex items-center gap-4"><Avatar initials={selected.initials} online large /><div className="min-w-0"><Pill>Available</Pill><h3 className="mt-2 truncate text-xl font-semibold">{selected.name}</h3><p className="mt-1 truncate text-xs text-cyan-300/55">{selected.nitraId}</p></div></div><p className="relative mt-6 rounded-2xl border border-white/[.06] bg-white/[.025] p-4 text-sm leading-6 text-white/35">{selected.bio || "Ready to connect on Nitra."}</p><div className="relative mt-5 flex gap-2"><button disabled={actionId === selected.uid || friendIds.includes(selected.uid)} onClick={() => requestFriend(selected)} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white text-xs font-semibold text-black disabled:opacity-50">{friendIds.includes(selected.uid) ? <><Check size={14} /> Friends</> : pendingFor(selected.uid) || sent[selected.uid] ? <><Clock3 size={14} /> Request pending</> : <><UserPlus size={14} /> Add friend</>}</button>{friendIds.includes(selected.uid) && <button onClick={() => messageFriend(selected)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[.08] text-white/50 hover:bg-white/[.06] hover:text-white"><MessageCircle size={15} /></button>}</div></motion.div></motion.div>}</AnimatePresence>
    <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 15, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#14161d]/95 px-4 py-3 text-xs text-white/75 shadow-2xl backdrop-blur-xl">{toast}</motion.div>}</AnimatePresence>
  </main>;
}

function TabButton({ active, onClick, icon, badge, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; badge?: number; children: React.ReactNode }) {
  return <button onClick={onClick} className={`relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] transition ${active ? "bg-white/[.08] text-white" : "text-white/30 hover:text-white/65"}`}>{icon}{children}{badge ? <span className="rounded-full bg-cyan-300/15 px-1.5 text-[8px] text-cyan-200">{badge}</span> : null}</button>;
}

function PersonRow({ person, index, status, busy, onOpen, onAdd, onMessage }: { person: UserProfile; index: number; status: "friend" | "pending" | "add"; busy: boolean; onOpen: () => void; onAdd: () => void; onMessage: () => void }) {
  return <motion.div layout initial={{ opacity: 0, y: 14, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: index * .035, type: "spring", stiffness: 380, damping: 28 } }} exit={{ opacity: 0, y: -8 }} whileHover={{ y: -2 }} className="group mb-2 flex items-center gap-4 rounded-2xl border border-white/[.06] bg-white/[.018] p-4 transition-colors hover:border-white/[.12] hover:bg-white/[.045]"><button onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-4 text-left"><Avatar initials={person.initials} online /><div className="min-w-0"><p className="truncate text-sm font-semibold">{person.name}</p><p className="mt-1 truncate text-xs text-cyan-300/55">{person.nitraId}</p><p className="mt-1 truncate text-[11px] text-white/22">{person.bio || person.status || "Available"}</p></div></button><div className="flex shrink-0 items-center gap-2">{status === "add" && <button disabled={busy} onClick={onAdd} className="flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-[10px] font-semibold text-black transition hover:scale-[1.02] disabled:opacity-50">{busy ? "Sending…" : <><UserPlus size={13} /> Add</>}</button>}{status === "pending" && <span className="flex h-9 items-center gap-1.5 rounded-xl border border-cyan-300/10 bg-cyan-300/[.04] px-3 text-[10px] text-cyan-200/60"><Clock3 size={13} /> Pending</span>}{status === "friend" && <button onClick={onMessage} className="flex h-9 items-center gap-1.5 rounded-xl border border-white/[.08] px-3 text-[10px] text-white/50 transition hover:bg-white/[.06] hover:text-white"><MessageCircle size={13} /> Message</button>}<button onClick={onOpen} className="flex h-9 w-9 items-center justify-center rounded-xl text-white/20 transition hover:bg-white/[.06] hover:text-white"><ChevronRight size={15} /></button></div></motion.div>;
}

function RequestGroup({ title, icon, items, profiles, actionId, onAction, sent = false }: { title: string; icon: React.ReactNode; items: FriendRequest[]; profiles: Record<string, UserProfile>; actionId: string; onAction: (request: FriendRequest, status: "accepted" | "declined" | "cancelled") => void; sent?: boolean }) {
  if (!items.length) return null;
  return <section><div className="mb-3 flex items-center gap-2 text-xs font-medium text-white/50">{icon}{title}<span className="text-[9px] text-white/20">{items.length}</span></div><div className="space-y-2">{items.map((request, index) => { const person = profiles[sent ? request.receiverId : request.senderId]; if (!person) return <div key={request.id} className="h-20 animate-pulse rounded-2xl border border-white/[.05] bg-white/[.02]" />; return <motion.div key={request.id} initial={{ opacity: 0, x: sent ? 10 : -10 }} animate={{ opacity: 1, x: 0, transition: { delay: index * .04 } }} className="flex items-center gap-3 rounded-2xl border border-white/[.06] bg-white/[.018] p-4"><Avatar initials={person.initials} online /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{person.name}</p><p className="mt-1 truncate text-xs text-cyan-300/55">{person.nitraId}</p></div>{sent ? <button disabled={actionId === request.id} onClick={() => onAction(request, "cancelled")} className="rounded-xl border border-white/[.08] px-3 py-2 text-[10px] text-white/35 hover:bg-white/[.05] hover:text-white">{actionId === request.id ? "…" : "Cancel"}</button> : <div className="flex gap-2"><button disabled={actionId === request.id} onClick={() => onAction(request, "declined")} className="rounded-xl border border-white/[.08] px-3 py-2 text-[10px] text-white/35 hover:bg-white/[.05] hover:text-white">Decline</button><button disabled={actionId === request.id} onClick={() => onAction(request, "accepted")} className="rounded-xl bg-white px-3 py-2 text-[10px] font-semibold text-black hover:scale-[1.02]">{actionId === request.id ? "…" : "Accept"}</button></div>}</motion.div>; })}</div></section>;
}

function LoadingState({ text }: { text: string }) { return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 rounded-2xl border border-white/[.06] bg-white/[.02] p-5 text-sm text-white/35"><span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />{text}</motion.div>; }
function ErrorState({ text }: { text: string }) { return <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-red-400/10 bg-red-400/[.04] p-5 text-sm text-red-200/70">{text}</motion.div>; }
function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[.08] bg-gradient-to-b from-white/[.015] to-transparent px-6 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[.07] bg-white/[.025] text-white/25">{icon}</div><p className="mt-4 text-sm font-medium text-white/45">{title}</p><p className="mt-1 max-w-sm text-xs leading-5 text-white/20">{text}</p></motion.div>; }
