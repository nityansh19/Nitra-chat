"use client";

import { AnimatePresence, motion } from "motion/react";
import { Archive, ArrowLeft, Bell, Bookmark, CheckCheck, ChevronRight, Copy, Info, Menu, MessageCircle, MoreHorizontal, Paperclip, Phone, Plus, Search, Send, Settings, Shield, Smile, Sparkles, Star, UserPlus, Users, Video, X } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type User = { name: string; email: string; phone: string; id: string; initials: string; bio?: string; status?: string };
type Contact = { id: string; name: string; initials: string; email: string; nitraId: string; bio?: string; status?: string; online?: boolean };
type Message = { id: number; from: "me" | "them"; text: string; time: string; reactions?: string[] };
type Chat = { id: string; contact: Contact; messages: Message[]; pinned?: boolean; muted?: boolean; archived?: boolean; unread: number; lastTime: string };
type Tab = "inbox" | "starred" | "saved" | "archive";

function Avatar({ initials, online = false, size = "md" }: { initials: string; online?: boolean; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-9 w-9 text-[10px]", md: "h-11 w-11 text-xs", lg: "h-20 w-20 text-xl" };
  return <div className={`relative flex shrink-0 items-center justify-center rounded-2xl border border-violet-300/35 bg-gradient-to-br from-violet-500/20 to-cyan-400/10 font-semibold text-white ${sizes[size]}`}>{initials}<span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[.06]" />{online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#090b10] bg-emerald-400" />}</div>;
}

function IconButton({ children, label, onClick, active = false }: { children: ReactNode; label: string; onClick?: () => void; active?: boolean }) {
  return <button type="button" onClick={onClick} aria-label={label} title={label} className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${active ? "bg-white/[.09] text-white" : "text-white/40 hover:bg-white/[.06] hover:text-white"}`}>{children}</button>;
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return <div><label className="mb-2 block text-xs font-medium text-white/55">{label}</label><input required value={value} onChange={e => onChange(e.target.value)} type={type} placeholder={placeholder} className="h-12 w-full rounded-xl border border-white/[.08] bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/15 focus:border-violet-300/35" /></div>;
}

function AuthScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (key: keyof typeof form, value: string) => { setForm(p => ({ ...p, [key]: value })); setError(""); };
  async function submit(e: FormEvent) {
    e.preventDefault(); setError("");
    if (mode === "register") {
      if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password) return setError("Fill in all required fields.");
      if (form.password.length < 8) return setError("Password must contain at least 8 characters.");
      if (form.password !== form.confirm) return setError("Passwords do not match.");
      setBusy(true);
      try {
        const response = await fetch("/api/users/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Registration failed.");
        const user: User = { name: data.user.name, email: data.user.email, phone: data.user.phone, id: data.user.nitraId, initials: data.user.initials, bio: data.user.bio, status: data.user.status };
        localStorage.setItem("nitra-demo-user", JSON.stringify(user)); onLogin(user);
      } catch (err) { setError(err instanceof Error ? err.message : "Could not reach the database. Check MongoDB configuration."); }
      finally { setBusy(false); }
      return;
    }
    if (!form.email.trim() || !form.password) return setError("Enter your email/phone and password.");
    const saved = localStorage.getItem("nitra-demo-user");
    onLogin(saved ? JSON.parse(saved) : { name: "Nitra User", email: form.email.trim(), phone: "", id: "@nitra_user", initials: "NU", status: "Available" });
  }
  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07080c] px-4 py-8 text-white"><div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-[100px]" /><div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" /><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/[.08] bg-white/[.035] shadow-2xl backdrop-blur-2xl lg:grid-cols-[.95fr_1.05fr]"><section className="hidden flex-col justify-between border-r border-white/[.07] bg-gradient-to-br from-white/[.07] to-transparent p-10 lg:flex"><div><div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black"><MessageCircle size={23} /></div><p className="text-xs font-semibold uppercase tracking-[.28em] text-white/30">Nitra Chat / Phase 05</p><h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-.05em]">A better place<br /><span className="text-white/40">to talk.</span></h1><p className="mt-6 max-w-md text-sm leading-6 text-white/40">Private conversations, real identity, thoughtful tools — now backed by a real database foundation.</p></div><div className="flex items-center gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/[.035] p-4"><div className="h-2 w-2 rounded-full bg-emerald-400" /><div><p className="text-sm font-medium">Database layer ready</p><p className="text-xs text-white/30">MongoDB · users · conversations · messages</p></div></div></section><section className="p-6 sm:p-10"><div className="mb-8 flex justify-end"><span className="rounded-full border border-white/[.08] bg-white/[.035] px-3 py-1.5 text-[10px] uppercase tracking-[.18em] text-white/35">{mode === "register" ? "Database signup" : "Demo session"}</span></div><p className="text-xs uppercase tracking-[.2em] text-white/30">{mode === "login" ? "Welcome back" : "Create your identity"}</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">{mode === "login" ? "Sign in to Nitra." : "Join the conversation."}</h2><p className="mt-2 text-sm text-white/35">{mode === "login" ? "Continue to your communication workspace." : "Your registration writes to the Phase 5 database."}</p><form onSubmit={submit} className="mt-7 space-y-4">{mode === "register" && <Field label="Display name" value={form.name} onChange={v => update("name", v)} placeholder="Your name" />}<Field label={mode === "login" ? "Email or phone" : "Email address"} value={form.email} onChange={v => update("email", v)} placeholder="you@example.com" type={mode === "login" ? "text" : "email"} />{mode === "register" && <Field label="Phone number" value={form.phone} onChange={v => update("phone", v)} placeholder="+91 98765 43210" type="tel" />}<Field label="Password" value={form.password} onChange={v => update("password", v)} placeholder="••••••••" type="password" />{mode === "register" && <Field label="Confirm password" value={form.confirm} onChange={v => update("confirm", v)} placeholder="Repeat password" type="password" />}<AnimatePresence>{error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-400/15 bg-red-400/5 px-3 py-2 text-xs text-red-200/80">{error}</motion.p>}</AnimatePresence><button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-semibold text-black transition hover:bg-white/90 disabled:opacity-60">{busy ? "Creating account…" : mode === "login" ? "Enter Nitra" : "Create Nitra ID"}<ArrowLeft size={16} className="rotate-180" /></button></form><button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="mt-5 h-11 w-full rounded-xl border border-white/[.08] bg-white/[.025] text-sm text-white/60 hover:bg-white/[.06]">{mode === "login" ? "Create a new Nitra ID" : "I already have an account"}</button><p className="mt-5 text-center text-[10px] leading-4 text-white/20">Phase 5 registration uses the database API. Production sessions and login verification come later.</p></section></motion.div></main>;
}

function NewConversationModal({ onClose, onStart }: { onClose: () => void; onStart: (contact: Contact) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); setError(""); return; }
    const timer = window.setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setResults((data.users || []).map((u: Contact) => ({ ...u, id: u.id || u.nitraId })));
      } catch { setResults([]); setError("Database search is unavailable. Check MongoDB and try again."); }
      finally { setLoading(false); }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" onMouseDown={onClose}><motion.div initial={{ opacity: 0, scale: .97, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} onMouseDown={e => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/[.09] bg-[#101219] shadow-2xl"><div className="flex items-center justify-between border-b border-white/[.07] p-5"><div><p className="text-lg font-semibold">New conversation</p><p className="mt-1 text-xs text-white/35">Search real Nitra users by name, email, phone, or Nitra ID.</p></div><IconButton label="Close" onClick={onClose}><X size={18} /></IconButton></div><div className="p-5"><div className="flex h-12 items-center gap-3 rounded-xl border border-white/[.08] bg-black/20 px-4"><Search size={17} className="text-white/30" /><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search @nitra_id…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/20" /><kbd className="hidden rounded-md border border-white/[.08] px-1.5 py-1 text-[9px] text-white/25) sm:block">ESC</kbd></div>{error && <p className="mt-3 text-[11px] text-amber-200/60">{error}</p>}<div className="mt-4 max-h-72 space-y-2 overflow-auto">{loading ? <div className="rounded-xl border border-white/[.06] p-5 text-center text-sm text-white/30">Searching Nitra…</div> : results.length ? results.map(contact => <button key={contact.id} type="button" onClick={() => onStart(contact)} className="flex w-full items-center gap-3 rounded-2xl border border-transparent p-3 text-left transition hover:border-white/[.08] hover:bg-white/[.04]"><Avatar initials={contact.initials} online={contact.online} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{contact.name}</p><p className="truncate text-xs text-white/30">{contact.nitraId} · {contact.status || "Available"}</p></div><ChevronRight size={16} className="text-white/20" /></button>) : <div className="rounded-xl border border-dashed border-white/[.08] p-6 text-center"><UserPlus className="mx-auto text-white/20" size={22} /><p className="mt-3 text-sm text-white/45">{query ? "No Nitra users found" : "Search for someone on Nitra"}</p><p className="mt-1 text-xs text-white/20">Use their name, email, phone, or Nitra ID.</p></div>}</div></div></motion.div></div>;
}

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("inbox");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [newChat, setNewChat] = useState(false);
  const [details, setDetails] = useState(true);
  const [mobileList, setMobileList] = useState(false);
  const [toast, setToast] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("nitra-demo-user");
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedChats = localStorage.getItem("nitra-chats-v2");
    if (savedChats) setChats(JSON.parse(savedChats));
    const savedItems = localStorage.getItem("nitra-saved-v2");
    if (savedItems) setSaved(JSON.parse(savedItems));
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("nitra-chats-v2", JSON.stringify(chats)); }, [chats, ready]);
  useEffect(() => { if (ready) localStorage.setItem("nitra-saved-v2", JSON.stringify(saved)); }, [saved, ready]);
  useEffect(() => { if (activeId) requestAnimationFrame(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" })); }, [activeId, chats]);

  const active = chats.find(c => c.id === activeId) || null;
  const visibleChats = useMemo(() => chats.filter(c => {
    const match = `${c.contact.name} ${c.contact.nitraId} ${c.contact.email}`.toLowerCase().includes(query.toLowerCase());
    if (tab === "starred") return match && c.pinned;
    if (tab === "archive") return match && c.archived;
    if (tab === "saved") return match && c.messages.some(m => saved.includes(`${c.id}:${m.id}`));
    return match && !c.archived;
  }), [chats, query, tab, saved]);

  function notify(text: string) { setToast(text); window.setTimeout(() => setToast(""), 1800); }
  function startChat(contact: Contact) {
    setChats(prev => {
      const existing = prev.find(c => c.contact.id === contact.id);
      if (existing) { setActiveId(existing.id); return prev; }
      const id = `chat-${contact.id}`;
      setActiveId(id);
      return [...prev, { id, contact, messages: [], unread: 0, lastTime: "Now" }];
    });
    setNewChat(false); setMobileList(false); notify(`Conversation with ${contact.name} created`);
  }
  function sendMessage(e?: FormEvent) {
    e?.preventDefault();
    if (!active || !message.trim()) return;
    const text = message.trim();
    const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setChats(prev => prev.map(c => c.id === active.id ? { ...c, messages: [...c.messages, { id: Date.now(), from: "me", text, time: now }], lastTime: "Now" } : c));
    setMessage(""); inputRef.current?.focus();
  }
  function togglePinned(id: string) { setChats(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c)); setMenu(null); notify("Conversation updated"); }
  function toggleMuted(id: string) { setChats(prev => prev.map(c => c.id === id ? { ...c, muted: !c.muted } : c)); setMenu(null); notify("Notification preference updated"); }
  function archive(id: string) { setChats(prev => prev.map(c => c.id === id ? { ...c, archived: !c.archived } : c)); setMenu(null); notify("Archive state updated"); }
  function deleteConversation(id: string) { setChats(prev => prev.filter(c => c.id !== id)); setActiveId(v => v === id ? null : v); setMenu(null); notify("Conversation deleted"); }
  function clearAllChats() { setChats([]); setActiveId(null); setTab("inbox"); notify("All local conversations cleared"); }
  function signOut() { localStorage.removeItem("nitra-demo-user"); setUser(null); }

  if (!ready) return <div className="min-h-screen bg-[#07080c]" />;
  if (!user) return <AuthScreen onLogin={setUser} />;

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [{ id: "inbox", label: "Inbox", icon: <MessageCircle size={15} /> }, { id: "starred", label: "Starred", icon: <Star size={15} /> }, { id: "saved", label: "Saved", icon: <Bookmark size={15} /> }, { id: "archive", label: "Archive", icon: <Archive size={15} /> }];
  return <main className="flex h-screen overflow-hidden bg-[#080a0f] text-white">
    <aside className="hidden w-[72px] shrink-0 flex-col items-center border-r border-white/[.06] py-4 md:flex"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black"><MessageCircle size={21} /></div><div className="mt-8 space-y-2"><IconButton label="Messages" active><MessageCircle size={19} /></IconButton><IconButton label="People" onClick={() => setNewChat(true)}><Users size={19} /></IconButton><IconButton label="Notifications" onClick={() => notify("You're all caught up")}><Bell size={19} /></IconButton></div><div className="mt-auto space-y-2"><Link href="/profile"><IconButton label="Profile"><Settings size={18} /></IconButton></Link><button onClick={signOut} title="Sign out" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/30 bg-white/[.025] text-xs font-semibold text-white/80">{user.initials}</button></div></aside>

    <section className={`${mobileList ? "flex" : "hidden md:flex"} w-full shrink-0 flex-col border-r border-white/[.06] bg-[#0c0e13] md:w-[380px]`}><header className="border-b border-white/[.06] p-5"><div className="flex items-start justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.25em] text-violet-300/45">Workspace</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Messages</h1></div><div className="flex gap-1"><IconButton label="New conversation" onClick={() => setNewChat(true)}><Plus size={19} /></IconButton><IconButton label="Close mobile list" onClick={() => setMobileList(false)}><X size={19} /></IconButton></div></div><div className="mt-5 flex h-11 items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.025] px-3"><Search size={16} className="text-white/30" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search conversations" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/20" /><kbd className="rounded-md border border-white/[.07] px-1.5 py-1 text-[9px] text-white/20">⌘ K</kbd></div><div className="mt-4 grid grid-cols-4 gap-1 rounded-xl bg-white/[.025] p-1">{tabs.map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-medium transition ${tab === item.id ? "bg-white/[.09] text-white" : "text-white/30 hover:text-white/60"}`}>{item.icon}<span className="hidden xl:inline">{item.label}</span></button>)}</div></header><div className="flex-1 overflow-y-auto p-3">{visibleChats.length ? visibleChats.map(chat => <div key={chat.id} className="group relative mb-1"><button onClick={() => { setActiveId(chat.id); setMobileList(false); }} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${activeId === chat.id ? "bg-white/[.08]" : "hover:bg-white/[.035]"}`}><Avatar initials={chat.contact.initials} online={chat.contact.online} /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-semibold">{chat.contact.name}</p>{chat.pinned && <Star size={11} className="fill-current text-violet-300" />}</div><p className="truncate text-xs text-white/30">{chat.messages.at(-1)?.text || "Start a new conversation"}</p></div><div className="text-right"><p className="text-[10px] text-white/20">{chat.lastTime}</p>{chat.unread > 0 && <span className="mt-1 inline-flex min-w-5 justify-center rounded-full bg-violet-400/20 px-1.5 py-0.5 text-[9px] text-violet-200">{chat.unread}</span>}</div></button><button onClick={() => setMenu(menu === chat.id ? null : chat.id)} className="absolute right-2 top-2 hidden h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-white/35 group-hover:flex"><MoreHorizontal size={15} /></button>{menu === chat.id && <div className="absolute right-2 top-10 z-30 w-44 overflow-hidden rounded-xl border border-white/[.08] bg-[#171923] p-1 shadow-2xl"><button onClick={() => togglePinned(chat.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/60 hover:bg-white/[.06]"><Star size={13} /> {chat.pinned ? "Unstar" : "Star"}</button><button onClick={() => toggleMuted(chat.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/60 hover:bg-white/[.06]"><Bell size={13} /> {chat.muted ? "Unmute" : "Mute"}</button><button onClick={() => archive(chat.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/60 hover:bg-white/[.06]"><Archive size={13} /> {chat.archived ? "Unarchive" : "Archive"}</button><button onClick={() => deleteConversation(chat.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-200/60 hover:bg-red-400/10">Delete conversation</button></div>}</div>) : <div className="flex h-full min-h-72 flex-col items-center justify-center px-8 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[.08] bg-white/[.025]"><MessageCircle size={23} className="text-white/25" /></div><h2 className="mt-5 text-sm font-semibold">{tab === "inbox" ? "Your inbox is clean." : `No ${tab} conversations.`}</h2><p className="mt-2 max-w-xs text-xs leading-5 text-white/25">Find someone on Nitra and start a new conversation.</p><button onClick={() => setNewChat(true)} className="mt-5 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-white/90"><Plus size={14} /> New conversation</button></div>}</div><footer className="border-t border-white/[.06] p-3"><div className="flex items-center gap-3 rounded-2xl bg-white/[.035] p-3"><Avatar initials={user.initials} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-white/25">{user.id}</p></div><Link href="/profile" className="text-white/25 hover:text-white"><Settings size={16} /></Link></div></footer></section>

    <section className="flex min-w-0 min-h-0 flex-1 flex-col"><header className="flex h-[61px] shrink-0 items-center justify-between border-b border-white/[.06] px-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><IconButton label="Open conversations" onClick={() => setMobileList(true)}><Menu size={20} /></IconButton>{active ? <><Avatar initials={active.contact.initials} online={active.contact.online} /><div className="min-w-0"><p className="truncate text-sm font-semibold">{active.contact.name}</p><p className="text-[11px] text-white/25">{active.contact.online ? "Active now" : active.contact.status || "Available"}</p></div></> : <div><p className="text-sm font-semibold">Nitra Chat</p><p className="text-[11px] text-white/25">Your communication workspace</p></div>}</div><div className="flex items-center gap-1"><IconButton label="Search" onClick={() => notify("Search conversations from the left panel")}><Search size={18} /></IconButton><IconButton label="Start call" onClick={() => notify("Calls arrive with real-time infrastructure")}><Phone size={17} /></IconButton><IconButton label="Start video" onClick={() => notify("Video arrives with real-time infrastructure")}><Video size={18} /></IconButton><IconButton label="Conversation details" active={details} onClick={() => setDetails(v => !v)}><Info size={18} /></IconButton></div></header>

      {active ? <div className="flex min-h-0 flex-1 flex-row"><div className="flex min-w-0 flex-1 flex-col"><div ref={chatRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-10"><div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end space-y-3">{active.messages.length ? active.messages.map(msg => <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-4 py-3 ${msg.from === "me" ? "bg-white text-black" : "border border-white/[.07] bg-white/[.035] text-white"}`}><p className="text-sm leading-6">{msg.text}</p><div className={`mt-2 flex items-center gap-2 text-[10px] ${msg.from === "me" ? "text-black/35" : "text-white/25"}`}><span>{msg.time}</span>{msg.from === "me" && <CheckCheck size={12} />}{msg.reactions?.map(r => <span key={r} className="rounded-full bg-black/10 px-2 py-0.5">{r}</span>)}<button onClick={() => { const key = `${active.id}:${msg.id}`; setSaved(s => s.includes(key) ? s.filter(x => x !== key) : [...s, key]); notify(saved.includes(key) ? "Removed from saved" : "Message saved"); }} className="ml-auto opacity-60 hover:opacity-100"><Bookmark size={12} className={saved.includes(`${active.id}:${msg.id}`) ? "fill-current" : ""} /></button></div></div></motion.div>) : <div className="m-auto flex w-full flex-col items-center justify-center text-center"><Avatar initials={active.contact.initials} online={active.contact.online} size="lg" /><h2 className="mt-5 text-xl font-semibold">Say hello to {active.contact.name}</h2><p className="mt-2 max-w-md text-sm leading-6 text-white/30">This conversation is new. Send the first message and build the thread from here.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={() => setMessage("Hey! Great to connect on Nitra.")} className="rounded-xl border border-white/[.08] bg-white/[.025] px-3 py-2 text-xs text-white/50 hover:bg-white/[.06]">Hey! Great to connect 👋</button><button onClick={() => setMessage("Want to catch up sometime?")} className="rounded-xl border border-white/[.08] bg-white/[.025] px-3 py-2 text-xs text-white/50 hover:bg-white/[.06]">Catch up sometime?</button></div></div>}</div></div><form onSubmit={sendMessage} className="shrink-0 border-t border-white/[.06] p-4 sm:p-5"><div className="mx-auto max-w-3xl rounded-2xl border border-white/[.08] bg-white/[.025] p-2"><div className="flex items-end gap-2"><IconButton label="Attach file" onClick={() => notify("Attachments arrive in the media phase")}><Paperclip size={18} /></IconButton><textarea ref={inputRef} value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} rows={1} placeholder="Write a message…" className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-white/20" /><IconButton label="Emoji" onClick={() => setMessage(m => m + " ✨")}><Smile size={18} /></IconButton><button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black transition hover:scale-[1.03] disabled:opacity-30" disabled={!message.trim()} aria-label="Send"><Send size={17} /></button></div><p className="px-12 pb-1 pt-1 text-[9px] text-white/15">Enter to send · Shift + Enter for a new line</p></div></form></div>{details && <aside className="hidden w-[290px] shrink-0 overflow-y-auto border-l border-white/[.06] bg-[#0b0d12] p-5 xl:block"><div className="text-center"><Avatar initials={active.contact.initials} online={active.contact.online} size="lg" /><h3 className="mt-4 font-semibold">{active.contact.name}</h3><p className="mt-1 text-xs text-white/25">{active.contact.nitraId}</p><button onClick={() => { navigator.clipboard?.writeText(active.contact.nitraId); notify("Nitra ID copied"); }} className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/70"><Copy size={12} /> Copy ID</button></div><div className="mt-8 space-y-2"><div className="rounded-2xl border border-white/[.06] bg-white/[.025] p-4"><p className="text-[9px] uppercase tracking-[.2em] text-white/20">About</p><p className="mt-2 text-xs leading-5 text-white/45">{active.contact.bio || "No bio yet."}</p></div><div className="rounded-2xl border border-white/[.06] bg-white/[.025] p-4"><p className="text-[9px] uppercase tracking-[.2em] text-white/20">Conversation</p><div className="mt-3 flex items-center justify-between text-xs"><span className="text-white/30">Messages</span><span>{active.messages.length}</span></div><div className="mt-2 flex items-center justify-between text-xs"><span className="text-white/30">Notifications</span><span>{active.muted ? "Muted" : "On"}</span></div></div><Link href="/profile" className="flex items-center justify-between rounded-2xl border border-white/[.06] bg-white/[.025] p-4 text-xs text-white/45 hover:bg-white/[.05]">Open your profile <ChevronRight size={15} /></Link></div></aside>}</div> : <div className="flex flex-1 items-center justify-center p-6"><div className="max-w-xl text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-violet-300/20 bg-violet-400/[.05] shadow-[0_0_80px_rgba(139,92,246,.08)]"><Sparkles size={28} className="text-violet-200/60" /></div><p className="mt-7 text-[10px] font-semibold uppercase tracking-[.3em] text-violet-200/30">Nitra / Your space</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.03em] sm:text-4xl">Nothing in your inbox.<br /><span className="text-white/30">Keep it that way, or start something.</span></h2><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/25">Find a person, open a thread, and make Nitra yours.</p><button onClick={() => setNewChat(true)} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"><UserPlus size={17} /> Start a conversation</button><div className="mt-10 grid grid-cols-3 gap-2 text-left"><div className="rounded-2xl border border-white/[.06] bg-white/[.025] p-3"><Shield size={15} className="text-emerald-300/70" /><p className="mt-3 text-xs font-medium">Identity</p><p className="mt-1 text-[10px] leading-4 text-white/20">Unique Nitra IDs</p></div><div className="rounded-2xl border border-white/[.06] bg-white/[.025] p-3"><Sparkles size={15} className="text-violet-300/70" /><p className="mt-3 text-xs font-medium">Focus</p><p className="mt-1 text-[10px] leading-4 text-white/20">Clean conversations</p></div><div className="rounded-2xl border border-white/[.06] bg-white/[.025] p-3"><Users size={15} className="text-cyan-300/70" /><p className="mt-3 text-xs font-medium">People</p><p className="mt-1 text-[10px] leading-4 text-white/20">Find your network</p></div></div><button onClick={clearAllChats} className="mt-7 text-[10px] text-white/15 underline-offset-4 hover:text-white/35 hover:underline">Clear local conversations</button></div></div>}
    </section>
    {toast && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-white/[.09] bg-[#171923] px-4 py-2.5 text-xs text-white/70 shadow-2xl">{toast}</motion.div>}
    {newChat && <NewConversationModal onClose={() => setNewChat(false)} onStart={startChat} />}
  </main>;
}

export default Home;
