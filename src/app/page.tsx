"use client";

import { AnimatePresence, motion } from "motion/react";
import { Archive, BellOff, Bookmark, CheckCheck, ChevronRight, Info, LogOut, Menu, MessageCircle, Paperclip, Phone, Pin, Search, Send, Settings, Shield, Smile, Sparkles, Star, Trash2, UserPlus, Video, X, Zap } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { loginWithFirebase, logoutFromFirebase, registerWithFirebase } from "@/lib/firebase-auth";
import { mapFirestoreError } from "@/lib/firebase-chat";

type User = { uid?: string; name: string; email: string; phone: string; id: string; initials: string; bio?: string; status?: string };
type Contact = { id: string; name: string; initials: string; email: string; nitraId: string; bio?: string; status?: string; online?: boolean };
type Message = { id: number; from: "me" | "them"; text: string; time: string; reactions?: string[] };
type Chat = { id: string; contact: Contact; messages: Message[]; pinned?: boolean; muted?: boolean; archived?: boolean; unread: number; lastTime: string };
type Tab = "inbox" | "starred" | "saved" | "archive";

const emojis = ["😀","😂","😍","🥹","😎","🔥","✨","❤️","🙌","👀","💀","🚀","🤝","💯","😭","😮","👍","🎉","🫡","🧠","☕","💻","⚡","🌙"];
const gifs = ["😂 LOL","🔥 NICE","🤯 WOW","🥹 LOVE","👏 CLAP","💀 BRUH","🚀 SHIP IT","☕ COFFEE"];
const CHAT_STORAGE_KEY = "nitra-ui-chats-v5";

function Avatar({ initials, online = false, size = "md" }: { initials: string; online?: boolean; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-9 w-9 rounded-xl text-[10px]", md: "h-11 w-11 rounded-2xl text-xs", lg: "h-20 w-20 rounded-[22px] text-xl" };
  return <div className={`relative flex shrink-0 items-center justify-center border border-white/10 bg-gradient-to-br from-violet-500/25 via-indigo-500/15 to-cyan-400/10 font-semibold text-white ${sizes[size]}`}>
    {initials}<span className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/[.07]" />
    {online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#090a0f] bg-emerald-400" />}
  </div>;
}

function IconButton({ children, label, onClick, active = false }: { children: ReactNode; label: string; onClick?: () => void; active?: boolean }) {
  return <button type="button" onClick={onClick} aria-label={label} title={label} className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${active ? "bg-white/10 text-white" : "text-white/35 hover:bg-white/[.07] hover:text-white"}`}>{children}</button>;
}

function Field({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return <input required value={value} onChange={e => onChange(e.target.value)} type={type} placeholder={placeholder} className="field" />;
}

function AuthScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (key: keyof typeof form, value: string) => { setForm(p => ({ ...p, [key]: value })); setError(""); };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.email.trim() || !form.password) return setError("Enter your email and password.");
    if (mode === "register") {
      if (!form.name.trim() || !form.phone.trim()) return setError("Fill in all required fields.");
      if (form.password.length < 8) return setError("Password must contain at least 8 characters.");
      if (form.password !== form.confirm) return setError("Passwords do not match.");
      setBusy(true);
      try {
        const profile = await registerWithFirebase({ name: form.name, email: form.email, phone: form.phone, password: form.password });
        const user: User = { uid: profile.uid, name: profile.name, email: profile.email, phone: profile.phone || "", id: profile.nitraId, initials: profile.initials, bio: profile.bio, status: profile.status };
        localStorage.setItem("nitra-demo-user", JSON.stringify(user));
        onLogin(user);
      } catch (err) {
        setError(mapFirestoreError(err));
      } finally {
        setBusy(false);
      }
      return;
    }
    setBusy(true);
    try {
      const profile = await loginWithFirebase(form.email, form.password);
      const user: User = { uid: profile.uid, name: profile.name, email: profile.email, phone: profile.phone || "", id: profile.nitraId, initials: profile.initials, bio: profile.bio, status: profile.status };
      localStorage.setItem("nitra-demo-user", JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError(mapFirestoreError(err));
    } finally {
      setBusy(false);
    }
  }

  return <main className="relative flex min-h-screen items-center justify-center overflow-auto bg-[#06070a] p-4 text-white noise-bg">
    <div className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
    <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[30px] border border-white/[.09] bg-white/[.035] shadow-2xl backdrop-blur-2xl lg:grid-cols-2">
      <section className="hidden min-h-[650px] flex-col justify-between p-10 lg:flex"><div><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black"><MessageCircle size={22} /></div><b>Nitra Chat</b></div><p className="mt-16 text-[10px] uppercase tracking-[.3em] text-white/25">A communication workspace</p><h1 className="mt-5 text-6xl font-semibold leading-none tracking-[-.06em]">Talk less.<br /><span className="text-gradient">Connect better.</span></h1><p className="mt-7 max-w-md text-sm leading-7 text-white/40">A calmer place for conversations, ideas and the people you actually want to hear from.</p></div><div className="space-y-3">{[[Shield,"Private by design"],[Zap,"Fast, expressive conversations"],[Sparkles,"Built for people"]].map(([I,t]) => <div key={t as string} className="flex items-center gap-3 text-xs text-white/35"><span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[.07]"><I size={13} /></span>{t as string}</div>)}</div></section>
      <section className="p-6 sm:p-10 lg:p-12"><div className="flex justify-between"><span className="rounded-full border border-white/[.08] px-3 py-1.5 text-[9px] uppercase tracking-[.2em] text-white/30">{mode === "register" ? "Create identity" : "Welcome back"}</span><span className="text-[10px] text-white/20">NITRA / 01</span></div><h2 className="mt-10 text-3xl font-semibold">{mode === "login" ? "Sign in to Nitra." : "Make your Nitra ID."}</h2><p className="mt-2 text-sm text-white/35">{mode === "login" ? "Pick up where you left off." : "One identity for every conversation."}</p><form onSubmit={submit} className="mt-8 space-y-4">{mode === "register" && <Field value={form.name} onChange={v => update("name", v)} placeholder="Display name" />}<Field value={form.email} onChange={v => update("email", v)} placeholder="Email address" type="email" />{mode === "register" && <Field value={form.phone} onChange={v => update("phone", v)} placeholder="Phone number" type="tel" />}<Field value={form.password} onChange={v => update("password", v)} placeholder="Password" type="password" />{mode === "register" && <Field value={form.confirm} onChange={v => update("confirm", v)} placeholder="Confirm password" type="password" />}{error && <p className="rounded-xl border border-red-400/15 bg-red-400/5 p-3 text-xs text-red-200/80">{error}</p>}<button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-semibold text-black disabled:opacity-60">{busy ? (mode === "register" ? "Creating account…" : "Signing in…") : mode === "login" ? "Enter Nitra" : "Create Nitra ID"}<ChevronRight size={16} /></button></form><button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="mt-4 h-11 w-full rounded-xl border border-white/[.08] text-sm text-white/50">{mode === "login" ? "Create a new Nitra ID" : "I already have an account"}</button></section>
    </motion.div>
  </main>;
}

function EmojiPicker({ onSelect, onClose }: { onSelect: (value: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"emoji" | "gif">("emoji");
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-14 left-0 z-40 w-[min(360px,calc(100vw-24px))] rounded-2xl border border-white/10 bg-[#11131a]/95 p-2 shadow-2xl backdrop-blur-xl">
    <div className="flex gap-1"><button onClick={() => setTab("emoji")} className={`flex-1 rounded-lg px-3 py-2 text-xs ${tab === "emoji" ? "bg-white/10" : "text-white/35"}`}>😊 Emoji</button><button onClick={() => setTab("gif")} className={`flex-1 rounded-lg px-3 py-2 text-xs ${tab === "gif" ? "bg-white/10" : "text-white/35"}`}>GIFs</button><IconButton label="Close" onClick={onClose}><X size={14} /></IconButton></div>
    {tab === "emoji" ? <div className="grid grid-cols-8 gap-1 p-2">{emojis.map(emoji => <button key={emoji} onClick={() => onSelect(emoji)} className="h-9 rounded-lg text-xl hover:bg-white/[.06]">{emoji}</button>)}</div> : <div className="grid grid-cols-2 gap-2 p-2">{gifs.map(gif => <button key={gif} onClick={() => onSelect(`[GIF] ${gif}`)} className="h-16 rounded-xl border border-white/[.07] bg-white/[.03] text-sm hover:bg-white/[.07]">{gif}</button>)}</div>}
  </motion.div>;
}

function MessageBubble({ message, onReact, onSave, onDelete }: { message: Message; onReact: (emoji: string) => void; onSave: () => void; onDelete: () => void }) {
  const mine = message.from === "me";
  return <motion.div initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} className={`group flex ${mine ? "justify-end" : "justify-start"}`}><div className="relative max-w-[86%] sm:max-w-[72%]"><div className={`rounded-[20px] px-4 py-3 text-sm leading-6 ${mine ? "rounded-br-md bg-white text-black" : "rounded-bl-md border border-white/[.07] bg-white/[.045] text-white/80"}`}><p>{message.text}</p></div><div className={`mt-1 flex items-center gap-2 px-1 text-[9px] text-white/20 ${mine ? "justify-end" : "justify-start"}`}><span>{message.time}</span>{mine && <CheckCheck size={11} />}</div>{message.reactions?.length ? <div className={`absolute -bottom-3 ${mine ? "right-2" : "left-2"} rounded-full border border-white/10 bg-[#161820] px-2 py-0.5 text-xs`}>{message.reactions.join(" ")}</div> : null}<div className={`absolute top-1/2 hidden -translate-y-1/2 gap-1 rounded-xl border border-white/10 bg-[#12141a] p-1 shadow-xl group-hover:flex ${mine ? "right-[calc(100%+8px)]" : "left-[calc(100%+8px)]"}`}><button onClick={() => onReact("❤️")} className="h-7 w-7">❤️</button><button onClick={() => onReact("🔥")} className="h-7 w-7">🔥</button><button onClick={onSave} className="h-7 w-7"><Bookmark size={14} /></button>{mine && <button onClick={onDelete} className="h-7 w-7 text-red-300"><Trash2 size={14} /></button>}</div></div></motion.div>;
}

function Home() {
  async function handleLogout() {
    try {
      await logoutFromFirebase();
    } catch {
      // Local session is still cleared if Firebase is temporarily unreachable.
    }
    localStorage.removeItem("nitra-demo-user");
    setUser(null);
  }

  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("inbox");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [picker, setPicker] = useState(false);
  const [details, setDetails] = useState(false);
  const [mobileList, setMobileList] = useState(false);
  const [toast, setToast] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("nitra-demo-user");
      if (u) setUser(JSON.parse(u));
      localStorage.removeItem("nitra-ui-chats-v4");
      const c = localStorage.getItem(CHAT_STORAGE_KEY);
      setChats(c ? JSON.parse(c) : []);
      const s = localStorage.getItem("nitra-ui-saved-v4");
      if (s) setSaved(JSON.parse(s));
    } catch {
      setChats([]);
    }
    setReady(true);
  }, []);

  useEffect(() => { if (ready) localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats)); }, [chats, ready]);
  useEffect(() => { if (ready) localStorage.setItem("nitra-ui-saved-v4", JSON.stringify(saved)); }, [saved, ready]);
  useEffect(() => { if (activeId) requestAnimationFrame(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" })); }, [activeId, chats]);
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(""), 2400); return () => window.clearTimeout(t); }, [toast]);

  const active = chats.find(c => c.id === activeId) || null;
  const visible = useMemo(() => chats.filter(c => {
    const match = `${c.contact.name} ${c.contact.nitraId} ${c.messages.map(m => m.text).join(" ")}`.toLowerCase().includes(query.toLowerCase());
    if (tab === "starred") return match && c.pinned;
    if (tab === "archive") return match && c.archived;
    if (tab === "saved") return match && c.messages.some(m => saved.includes(m.id));
    return match && !c.archived;
  }), [chats, query, tab, saved]);

  const notify = (text: string) => setToast(text);
  const openChat = (id: string) => { setActiveId(id); setMobileList(false); setChats(p => p.map(c => c.id === id ? { ...c, unread: 0 } : c)); };
  const updateChat = (patch: Partial<Chat>) => { if (active) setChats(p => p.map(c => c.id === active.id ? { ...c, ...patch } : c)); };
  const send = (override?: string) => {
    const text = (override ?? message).trim();
    if (!text || !active) return;
    const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setChats(p => p.map(c => c.id === active.id ? { ...c, lastTime: now, messages: [...c.messages, { id: Date.now(), from: "me", text, time: now }] } : c));
    setMessage("");
    setPicker(false);
    inputRef.current?.focus();
  };
  const createChat = (contact: Contact) => {
    const id = `chat-${contact.id}`;
    setChats(p => p.some(c => c.id === id) ? p : [...p, { id, contact, messages: [], unread: 0, lastTime: "New" }]);
    setActiveId(id);
    setTab("inbox");
    notify(`Conversation with ${contact.name} created`);
  };

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-[#07080c] text-white/30">Loading Nitra…</div>;
  if (!user) return <AuthScreen onLogin={setUser} />;

  return <main className="h-[100dvh] overflow-hidden bg-[#07080c] text-white noise-bg">
    <div className="pointer-events-none fixed left-1/3 top-[-180px] h-[420px] w-[420px] rounded-full bg-cyan-500/[.035] blur-[120px]" />
    <div className="pointer-events-none fixed bottom-[-220px] right-[-100px] h-[480px] w-[480px] rounded-full bg-violet-600/[.035] blur-[140px]" />

    <div className="relative flex h-full min-h-0 gap-3 p-2 sm:p-3 lg:p-4">
      <aside className="desktop-rail glass hidden w-[72px] shrink-0 flex-col items-center justify-between rounded-[24px] py-3 md:flex">
        <div className="flex flex-col items-center gap-2">
          <button onClick={() => { setTab("inbox"); setActiveId(null); }} aria-label="Nitra home" title="Nitra home" className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black shadow-lg shadow-white/5"><MessageCircle size={21} /></button>
          <IconButton label="Inbox" active={tab === "inbox"} onClick={() => setTab("inbox")}><MessageCircle size={18} /></IconButton>
          <IconButton label="Starred" active={tab === "starred"} onClick={() => setTab("starred")}><Star size={18} /></IconButton>
          <IconButton label="Saved" active={tab === "saved"} onClick={() => setTab("saved")}><Bookmark size={18} /></IconButton>
          <IconButton label="Archive" active={tab === "archive"} onClick={() => setTab("archive")}><Archive size={18} /></IconButton>
        </div>
        <Link href="/profile" aria-label="Open profile" title="Profile"><Avatar initials={user.initials || "NU"} size="sm" online /></Link>
      </aside>

      <section className={`${mobileList ? "fixed inset-2 z-50" : "hidden md:flex"} glass w-full max-w-[350px] shrink-0 flex-col overflow-hidden rounded-[24px]`}>
        <div className="border-b border-white/[.06] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.55)]" />
                <p className="text-[10px] font-medium uppercase tracking-[.22em] text-white/30">Nitra</p>
              </div>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">Messages</h1>
              <p className="mt-1 text-[10px] text-white/20">Your conversations, in one place.</p>
            </div>
            <div className="flex items-center gap-1">
              <Link href="/connections" aria-label="Add friends" title="Add friends" className="flex h-9 w-9 items-center justify-center rounded-xl text-white/35 transition hover:bg-white/[.07] hover:text-white"><UserPlus size={17} /></Link>
              <button type="button" onClick={() => setMobileList(false)} aria-label="Close conversation list" className="flex h-9 w-9 items-center justify-center rounded-xl text-white/35 transition hover:bg-white/[.07] hover:text-white md:hidden"><X size={17} /></button>
            </div>
          </div>

          <Link href="/connections" className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl bg-white text-xs font-semibold text-black transition hover:bg-white/90">
            <MessageCircle size={14} />
            New conversation
          </Link>

          <div className="mt-3 flex h-10 items-center gap-2 rounded-xl border border-white/[.07] bg-black/20 px-3 transition focus-within:border-white/[.14] focus-within:bg-white/[.025]">
            <Search size={14} className="shrink-0 text-white/20" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search conversations" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-white/20" />
            <span className="hidden rounded-md border border-white/[.07] px-1.5 py-0.5 text-[8px] text-white/15 sm:block">⌘ K</span>
          </div>

          <div className="mt-3 flex gap-1 overflow-auto rounded-xl bg-black/10 p-1">
            {(["inbox","starred","saved","archive"] as Tab[]).map(t => <button key={t} onClick={() => setTab(t)} className={`shrink-0 flex-1 rounded-lg px-2 py-1.5 text-[9px] font-medium transition ${tab === t ? "bg-white/[.09] text-white" : "text-white/25 hover:text-white/50"}`}>{t[0].toUpperCase()+t.slice(1)}</button>)}
          </div>
        </div>

        <Link href="/connections" className="mx-3 mt-3 flex items-center gap-3 rounded-2xl border border-cyan-300/10 bg-cyan-300/[.035] p-3 transition hover:border-cyan-300/20 hover:bg-cyan-300/[.06]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-300/[.08] text-cyan-200/75"><UserPlus size={15} /></span>
          <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-white/75">Add friends</span><span className="mt-0.5 block truncate text-[10px] text-white/25">Find people and manage requests.</span></span>
          <ChevronRight size={14} className="text-white/20" />
        </Link>

        <div className="flex items-center justify-between px-4 pb-1 pt-4">
          <span className="text-[9px] font-medium uppercase tracking-[.18em] text-white/20">{tab === "inbox" ? "Recent chats" : tab}</span>
          <span className="text-[9px] text-white/15">{visible.length}</span>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-2">
          {visible.map(c => <button key={c.id} onClick={() => openChat(c.id)} className={`group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${activeId === c.id ? "bg-white/[.075] ring-1 ring-inset ring-white/[.04]" : "hover:bg-white/[.04]"}`}>
            <Avatar initials={c.contact.initials} online={c.contact.online} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><p className="truncate text-sm font-medium text-white/85">{c.contact.name}</p>{c.pinned && <Pin size={10} className="shrink-0 text-white/25" />}{c.muted && <BellOff size={10} className="shrink-0 text-white/25" />}</div>
              <p className="mt-0.5 truncate text-[11px] text-white/30">{c.messages.at(-1)?.text || "Start a conversation"}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5"><span className="text-[9px] text-white/15">{c.lastTime}</span>{c.unread > 0 && <span className="min-w-5 rounded-full bg-white px-1.5 py-1 text-center text-[9px] font-bold text-black">{c.unread}</span>}</div>
          </button>)}
          {!visible.length && <div className="p-8 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[.06] bg-white/[.025]"><MessageCircle size={17} className="text-white/20" /></div><p className="mt-3 text-xs text-white/30">No conversations here.</p><p className="mt-1 text-[10px] text-white/15">Find someone new to start chatting.</p></div>}
        </div>

        <div className="border-t border-white/[.06] p-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[.05] bg-white/[.02] p-2.5">
            <Link href="/profile"><Avatar initials={user.initials || "NU"} size="sm" online /></Link>
            <Link href="/profile" className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-white/75">{user.name}</p><p className="truncate text-[10px] text-emerald-300/55">{user.status || "Available"}</p></Link>
            <Link href="/profile" aria-label="Settings" title="Profile & settings" className="flex h-8 w-8 items-center justify-center rounded-lg text-white/25 transition hover:bg-white/[.06] hover:text-white"><Settings size={15} /></Link>
            <button type="button" onClick={handleLogout} aria-label="Log out" title="Log out" className="flex h-8 w-8 items-center justify-center rounded-lg text-red-200/45 transition hover:bg-red-400/[.08] hover:text-red-100"><LogOut size={15} /></button>
          </div>
        </div>
      </section>

      <section className="glass relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[24px]">
        <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-white/[.06] px-3 sm:px-5">
          <button onClick={() => setMobileList(true)} aria-label="Open conversations" title="Conversations" className="flex h-9 w-9 items-center justify-center rounded-xl text-white/35 transition hover:bg-white/[.07] hover:text-white md:hidden"><Menu size={19} /></button>
          {active ? <>
            <Avatar initials={active.contact.initials} online={active.contact.online} />
            <button onClick={() => setDetails(v => !v)} className="min-w-0 flex-1 text-left"><p className="truncate text-sm font-semibold">{active.contact.name}</p><p className="mt-0.5 truncate text-[10px] text-emerald-300/60">{active.contact.online ? "Online now" : active.contact.status || "Available"}</p></button>
            <div className="hidden items-center gap-1 sm:flex"><IconButton label="Voice call" onClick={() => notify("Voice calls are coming with realtime.")}><Phone size={17} /></IconButton><IconButton label="Video call" onClick={() => notify("Video calls are coming with realtime.")}><Video size={17} /></IconButton></div>
            <IconButton label="Conversation details" active={details} onClick={() => setDetails(v => !v)}><Info size={17} /></IconButton>
          </> : <div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[.07] bg-white/[.025]"><MessageCircle size={17} className="text-white/35" /></div><div><p className="text-sm font-semibold">Nitra Chat</p><p className="text-[10px] text-white/25">Select a conversation to begin</p></div></div>}
        </header>

        {active ? <>
          <div ref={chatRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="mb-8 flex items-center gap-3"><span className="h-px flex-1 bg-white/[.05]" /><span className="text-[9px] uppercase tracking-[.2em] text-white/20">Today</span><span className="h-px flex-1 bg-white/[.05]" /></div>
              <div className="mb-8 rounded-3xl border border-white/[.06] bg-white/[.018] p-5 text-center"><Avatar initials={active.contact.initials} size="lg" online={active.contact.online} /><h2 className="mt-4 text-lg font-semibold">{active.contact.name}</h2><p className="mt-1 text-xs text-white/25">{active.contact.nitraId}</p><p className="mx-auto mt-3 max-w-md text-[11px] leading-5 text-white/20">{active.contact.bio || "A Nitra connection. Good conversations start here."}</p></div>
              <div className="space-y-3">{active.messages.length ? active.messages.map(m => <MessageBubble key={m.id} message={m} onReact={emoji => setChats(p => p.map(c => c.id === active.id ? { ...c, messages: c.messages.map(x => x.id === m.id ? { ...x, reactions: x.reactions?.includes(emoji) ? x.reactions.filter(r => r !== emoji) : [...(x.reactions || []), emoji] } : x) } : c))} onSave={() => { setSaved(p => p.includes(m.id) ? p.filter(id => id !== m.id) : [...p, m.id]); notify(saved.includes(m.id) ? "Removed from saved" : "Saved message"); }} onDelete={() => setChats(p => p.map(c => c.id === active.id ? { ...c, messages: c.messages.filter(x => x.id !== m.id) } : c))} />) : <div className="rounded-2xl border border-dashed border-white/[.07] p-8 text-center"><p className="text-xs text-white/30">No messages yet.</p><p className="mt-1 text-[10px] text-white/15">Send the first message below.</p></div>}</div>
            </div>
          </div>

          <div className="shrink-0 px-3 pb-3 sm:px-5 sm:pb-5"><div className="mx-auto max-w-3xl"><AnimatePresence>{picker && <EmojiPicker onSelect={value => { if (value.startsWith("[GIF]")) send(value); else setMessage(current => `${current}${current ? " " : ""}${value}`); }} onClose={() => setPicker(false)} />}</AnimatePresence><div className="relative rounded-2xl border border-white/[.08] bg-white/[.035] shadow-lg shadow-black/10"><div className="flex items-end gap-1 p-2"><IconButton label="Attach" onClick={() => notify("Attachments will be connected without paid Storage.")}><Paperclip size={17} /></IconButton><IconButton label="Emoji and GIFs" active={picker} onClick={() => setPicker(v => !v)}><Smile size={18} /></IconButton><textarea ref={inputRef} value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder={`Message ${active.contact.name.split(" ")[0]}…`} className="min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-white/20" /><button onClick={() => send()} disabled={!message.trim()} aria-label="Send message" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black transition hover:bg-white/90 disabled:bg-white/[.07] disabled:text-white/20"><Send size={16} /></button></div></div><p className="mt-2 text-center text-[9px] text-white/15">Enter to send · Shift + Enter for a new line</p></div></div>
        </> : <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-center"><div className="max-w-md"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/[.07] bg-white/[.025] shadow-2xl"><Sparkles size={25} className="text-cyan-200/60" /></div><p className="mt-6 text-[10px] font-medium uppercase tracking-[.25em] text-white/20">Your workspace</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Your conversations start here.</h2><p className="mt-3 text-sm leading-6 text-white/25">Pick a conversation from the sidebar, or find someone new and start talking.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><Link href="/connections" className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90"><UserPlus size={14} /> Find people</Link><Link href="/profile" className="flex items-center gap-2 rounded-xl border border-white/[.08] px-4 py-2.5 text-xs font-medium text-white/55 transition hover:bg-white/[.05] hover:text-white"><Settings size={14} /> Profile</Link></div></div></div>}
      </section>

      {details && active && <aside className="hidden w-[270px] shrink-0 flex-col overflow-auto rounded-[24px] border border-white/[.06] bg-white/[.025] p-5 xl:flex"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[.18em] text-white/25">Conversation</p><IconButton label="Close details" onClick={() => setDetails(false)}><X size={15} /></IconButton></div><div className="mt-8 text-center"><Avatar initials={active.contact.initials} size="lg" online={active.contact.online} /><p className="mt-4 text-sm font-semibold">{active.contact.name}</p><p className="mt-1 text-[10px] text-white/25">{active.contact.nitraId}</p><p className="mt-4 text-xs leading-5 text-white/30">{active.contact.bio || "A Nitra connection. Good conversations start here."}</p></div><div className="mt-7 space-y-2"><button onClick={() => { updateChat({ pinned: !active.pinned }); notify(active.pinned ? "Unpinned" : "Pinned"); }} className="flex w-full items-center gap-3 rounded-xl border border-white/[.05] p-3 text-left text-xs text-white/40 transition hover:bg-white/[.04]"><Pin size={14} />{active.pinned ? "Unpin conversation" : "Pin conversation"}</button><button onClick={() => { updateChat({ muted: !active.muted }); notify(active.muted ? "Notifications on" : "Muted"); }} className="flex w-full items-center gap-3 rounded-xl border border-white/[.05] p-3 text-left text-xs text-white/40 transition hover:bg-white/[.04]"><BellOff size={14} />{active.muted ? "Turn notifications on" : "Mute notifications"}</button></div></aside>}
    </div>

    {toast && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-white/10 bg-[#15171e]/95 px-4 py-2.5 text-xs text-white/70 shadow-xl backdrop-blur-xl">{toast}</motion.div>}
  </main>;
}

export default function Page() { return <Home />; }
