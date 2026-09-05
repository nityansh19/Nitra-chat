"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Archive, ArrowLeft, Bell, CheckCheck, ChevronDown, CircleHelp, FileText,
  Hash, Image as ImageIcon, Info, Menu, MessageCircle, MoreHorizontal,
  Paperclip, PenLine, Phone, Plus, Search, Send, Settings, Smile, Sparkles,
  Users, Video, X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Conversation = {
  id: string; name: string; initials: string; preview: string; time: string;
  unread: number; online?: boolean; group?: boolean; accent: string;
};
type Message = { id: number; from: "me" | "them"; text: string; time: string; reactions?: string[] };

const conversations: Conversation[] = [
  { id: "maya", name: "Maya Chen", initials: "MC", preview: "That new flow looks really good.", time: "2m", unread: 2, online: true, accent: "from-violet-400 to-fuchsia-400" },
  { id: "dev", name: "Nitra Dev Team", initials: "ND", preview: "Arjun: pushed the websocket draft", time: "18m", unread: 7, group: true, accent: "from-cyan-400 to-blue-500" },
  { id: "alex", name: "Alex Morgan", initials: "AM", preview: "Can you review this when free?", time: "1h", unread: 0, online: true, accent: "from-amber-300 to-orange-500" },
  { id: "design", name: "Design Studio", initials: "DS", preview: "You: Let's keep the motion subtle", time: "3h", unread: 0, group: true, accent: "from-rose-400 to-red-500" },
  { id: "sam", name: "Sam Rivera", initials: "SR", preview: "Voice message", time: "Yesterday", unread: 0, accent: "from-emerald-300 to-teal-500" }
];

const seed: Message[] = [
  { id: 1, from: "them", text: "Hey! I just checked the latest Nitra flow.", time: "6:42 PM" },
  { id: 2, from: "me", text: "Nice. I was trying to make the workspace feel less like a clone and more like a real product.", time: "6:43 PM" },
  { id: 3, from: "them", text: "That new flow looks really good. The transitions make it feel alive without being distracting.", time: "6:44 PM", reactions: ["✨ 2"] },
  { id: 4, from: "me", text: "Exactly the vibe. Next step is real-time presence + WebSockets.", time: "6:45 PM" },
  { id: 5, from: "them", text: "Love it. Keep the composer simple too — the context should stay in the conversation.", time: "6:46 PM" }
];

const replies = [
  "Absolutely — I'm on it.",
  "Yep, that makes sense. Let's keep it clean.",
  "Nice. I'll take a look and get back to you.",
  "That's the direction I had in mind too."
];

function Avatar({ initials, online, accent = "from-indigo-400 to-cyan-400", size = "md" }: { initials: string; online?: boolean; accent?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8 text-[10px]", md: "h-10 w-10 text-xs", lg: "h-16 w-16 text-lg" };
  return <div className={`relative shrink-0 rounded-2xl bg-gradient-to-br ${accent} p-[1px] ${sizes[size]}`}><div className="flex h-full w-full items-center justify-center rounded-[calc(1rem-1px)] bg-[#11131a] font-semibold text-white/90">{initials}</div>{online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0d0f14] bg-emerald-400" />}</div>;
}

function IconButton({ children, label, onClick, active = false }: { children: React.ReactNode; label: string; onClick?: () => void; active?: boolean }) {
  return <button onClick={onClick} aria-label={label} title={label} className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${active ? "bg-white/[.09] text-white" : "text-white/45 hover:bg-white/[.06] hover:text-white"}`}>{children}</button>;
}

function RailButton({ children, active, label, onClick, badge }: { children: React.ReactNode; active?: boolean; label: string; onClick?: () => void; badge?: number }) {
  return <button onClick={onClick} title={label} aria-label={label} className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition ${active ? "bg-white/[.1] text-white shadow-glow" : "text-white/35 hover:bg-white/[.06] hover:text-white/80"}`}>{children}{badge ? <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-black">{badge}</span> : null}{active && <span className="absolute -left-3 h-5 w-1 rounded-r-full bg-white" />}</button>;
}

export default function Home() {
  const [active, setActive] = useState("maya");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>({ maya: seed });
  const [unread, setUnread] = useState<Record<string, number>>({ maya: 2, dev: 7 });
  const [showMobileList, setShowMobileList] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [showCommand, setShowCommand] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const [toast, setToast] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const current = conversations.find(c => c.id === active) ?? conversations[0];
  const messages = messagesByChat[active] ?? [];
  const filtered = useMemo(() => conversations.filter(c => `${c.name} ${c.preview}`.toLowerCase().includes(query.toLowerCase())), [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); setShowCommand(v => !v); }
      if (e.key === "Escape") { setShowCommand(false); setShowEmoji(false); setMenuId(null); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing]);

  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 1800);
  }

  function openChat(id: string) {
    setActive(id);
    setUnread(prev => ({ ...prev, [id]: 0 }));
    setShowMobileList(false);
    setMenuId(null);
  }

  function sendMessage() {
    const value = message.trim();
    if (!value) return;
    const newMessage: Message = { id: Date.now(), from: "me", text: value, time: "now" };
    setMessagesByChat(prev => ({ ...prev, [active]: [...(prev[active] ?? []), newMessage] }));
    setMessage("");
    setReplyTo(null);
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      const reply: Message = { id: Date.now() + 1, from: "them", text: replies[Math.floor(Math.random() * replies.length)], time: "now" };
      setMessagesByChat(prev => ({ ...prev, [active]: [...(prev[active] ?? []), reply] }));
    }, 1200);
  }

  function reactTo(id: number, emoji: string) {
    setMessagesByChat(prev => ({ ...prev, [active]: (prev[active] ?? []).map(m => m.id === id ? { ...m, reactions: [...(m.reactions ?? []), `${emoji} 1`] } : m) }));
    setMenuId(null);
  }

  function deleteMessage(id: number) {
    setMessagesByChat(prev => ({ ...prev, [active]: (prev[active] ?? []).filter(m => m.id !== id) }));
    setMenuId(null);
    notify("Message removed");
  }

  function newMessage() {
    setActive("maya");
    setUnread({});
    setShowCommand(false);
    setShowMobileList(false);
    window.setTimeout(() => inputRef.current?.focus(), 100);
  }

  return <main className="noise flex h-screen overflow-hidden bg-[#08090d] text-white" onClick={() => menuId !== null && setMenuId(null)}>
    <aside className="desktop-rail glass relative z-20 flex w-[76px] flex-col items-center justify-between border-y-0 border-l-0 px-3 py-5">
      <div className="flex flex-col items-center gap-4">
        <motion.div whileHover={{ rotate: 8, scale: 1.05 }} className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black shadow-glow"><MessageCircle size={21} strokeWidth={2.5} /></motion.div>
        <RailButton active label="Chats" onClick={() => setActive("maya")}><MessageCircle size={20} /></RailButton>
        <RailButton label="People" onClick={() => notify("People is coming in Phase 3")}><Users size={20} /></RailButton>
        <RailButton label="Saved" onClick={() => notify("Saved messages are coming soon")}><Archive size={20} /></RailButton>
        <RailButton label="Notifications" badge={7} onClick={() => notify("You're all caught up")}><Bell size={20} /></RailButton>
      </div>
      <div className="flex flex-col items-center gap-3"><RailButton label="Settings" onClick={() => notify("Settings will be connected to your profile later")}><Settings size={19} /></RailButton><Avatar initials="NR" accent="from-indigo-400 to-violet-500" /></div>
    </aside>

    <AnimatePresence>{showMobileList && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMobileList(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden" />}</AnimatePresence>

    <aside className={`absolute inset-y-0 left-0 z-40 flex w-[330px] flex-col border-r border-white/[.07] bg-[#0c0e13] transition-transform lg:relative lg:z-10 lg:flex ${showMobileList ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
      <div className="flex items-center justify-between px-5 pb-4 pt-6"><div><p className="text-[11px] font-medium uppercase tracking-[.22em] text-white/30">Workspace</p><h1 className="mt-1 text-xl font-semibold tracking-tight">Messages</h1></div><div className="flex gap-1"><IconButton label="New message" onClick={newMessage}><PenLine size={18} /></IconButton><IconButton label="Close" onClick={() => setShowMobileList(false)}><X size={18} /></IconButton></div></div>
      <div className="px-4 pb-4"><button onClick={() => setShowCommand(true)} className="flex h-10 w-full items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.035] px-3 text-left"><Search size={16} className="text-white/30" /><span className="flex-1 text-sm text-white/25">Search conversations</span><kbd className="rounded-md bg-white/[.06] px-1.5 py-0.5 text-[10px] text-white/25">⌘ K</kbd></button></div>
      <div className="flex-1 overflow-y-auto px-2"><div className="mb-2 flex items-center justify-between px-3"><span className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/25">Recent</span><button onClick={() => notify("Multi-select mode is coming soon")} className="text-xs text-white/25 hover:text-white/60">Edit</button></div>{filtered.length ? filtered.map(c => <motion.button layout key={c.id} onClick={() => openChat(c.id)} className={`group mb-1 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${active === c.id ? "bg-white/[.075]" : "hover:bg-white/[.04]"}`}><Avatar initials={c.initials} online={c.online} accent={c.accent} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className={`truncate text-sm font-medium ${active === c.id ? "text-white" : "text-white/75"}`}>{c.name}</span><span className="shrink-0 text-[10px] text-white/25">{c.time}</span></span><span className="mt-1 flex items-center justify-between gap-2"><span className="truncate text-xs text-white/30">{c.preview}</span>{unread[c.id] ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black">{unread[c.id]}</span> : null}</span></span></motion.button>) : <div className="px-4 py-12 text-center"><Search size={22} className="mx-auto text-white/15" /><p className="mt-3 text-sm text-white/35">No conversations found</p><p className="mt-1 text-xs text-white/20">Try another name or keyword.</p></div>}</div>
      <div className="border-t border-white/[.06] p-4"><button onClick={() => notify("Profile settings are coming soon")} className="flex w-full items-center gap-3 rounded-2xl bg-white/[.035] p-3 text-left transition hover:bg-white/[.06]"><Avatar initials="NR" accent="from-indigo-400 to-violet-500" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">Nityansh</p><p className="flex items-center gap-1.5 text-[11px] text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Available</p></div><MoreHorizontal size={17} className="text-white/25" /></button></div>
    </aside>

    <section className="relative flex min-w-0 flex-1 flex-col bg-[radial-gradient(circle_at_50%_-20%,rgba(115,130,255,.08),transparent_45%)]">
      <header className="glass flex h-[72px] shrink-0 items-center justify-between border-x-0 border-t-0 px-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><IconButton label="Open conversations" onClick={() => setShowMobileList(true)}><Menu size={20} /></IconButton><Avatar initials={current.initials} online={current.online} accent={current.accent} /><div className="min-w-0"><h2 className="truncate text-sm font-semibold">{current.name}</h2><p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/30">{current.online ? <><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Active now</> : "Last seen recently"}</p></div></div><div className="flex items-center gap-1"><IconButton label="Search in chat" onClick={() => setShowCommand(true)}><Search size={18} /></IconButton><IconButton label="Start call" onClick={() => notify("Voice calling will connect in the real-time phase")}><Phone size={18} /></IconButton><IconButton label="Start video call" onClick={() => notify("Video calling will connect in the real-time phase")}><Video size={18} /></IconButton><IconButton label="Chat info" active={showDetails} onClick={() => setShowDetails(v => !v)}><Info size={18} /></IconButton></div></header>

      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-3xl flex-col"><div className="mb-8 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[.2em] text-white/20"><span className="h-px flex-1 bg-white/[.06]" />Today<span className="h-px flex-1 bg-white/[.06]" /></div>
        <AnimatePresence initial={false}>{messages.map((m, i) => <motion.div key={m.id} initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .25 }} className={`mb-4 flex ${m.from === "me" ? "justify-end" : "justify-start"}`}><div className={`relative flex max-w-[82%] flex-col sm:max-w-[70%] ${m.from === "me" ? "items-end" : "items-start"}`}><div className="relative"><div onContextMenu={e => { e.preventDefault(); setMenuId(m.id); }} className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${m.from === "me" ? "rounded-br-md bg-white text-[#0a0b0e]" : "rounded-bl-md border border-white/[.07] bg-white/[.045] text-white/80"}`}>{m.text}</div><motion.button initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setMenuId(menuId === m.id ? null : m.id)} className="absolute -right-8 top-1/2 hidden -translate-y-1/2 rounded-lg p-1.5 text-white/25 transition hover:bg-white/[.06] hover:text-white group-hover:block sm:block" aria-label="Message actions"><MoreHorizontal size={14} /></motion.button>{menuId === m.id && <div onClick={e => e.stopPropagation()} className={`absolute z-20 top-8 w-36 rounded-xl border border-white/[.08] bg-[#151821] p-1.5 shadow-2xl ${m.from === "me" ? "right-0" : "left-0"}`}><button onClick={() => { setReplyTo(m); setMenuId(null); inputRef.current?.focus(); }} className="flex w-full rounded-lg px-3 py-2 text-left text-xs text-white/65 hover:bg-white/[.06]">Reply</button><button onClick={() => reactTo(m.id, "❤️")} className="flex w-full rounded-lg px-3 py-2 text-left text-xs text-white/65 hover:bg-white/[.06]">React ❤️</button>{m.from === "me" && <button onClick={() => deleteMessage(m.id)} className="flex w-full rounded-lg px-3 py-2 text-left text-xs text-red-300/80 hover:bg-white/[.06]">Delete</button>}</div>}</div><div className={`mt-1.5 flex items-center gap-1.5 px-1 text-[10px] text-white/20 ${m.from === "me" ? "justify-end" : ""}`}>{m.time}{m.from === "me" && <CheckCheck size={12} />}</div>{m.reactions?.length ? <div className="mt-1 flex gap-1">{m.reactions.map((r, ri) => <button key={ri} onClick={() => reactTo(m.id, "✨")} className="rounded-full border border-white/[.08] bg-white/[.04] px-2 py-0.5 text-[10px] text-white/45 hover:bg-white/[.08]">{r}</button>)}</div> : null}</div></motion.div>)}</AnimatePresence>
        <AnimatePresence>{typing && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 flex"><div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/[.07] bg-white/[.045] px-4 py-3"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:-.2s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:-.1s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" /></div></motion.div>}</AnimatePresence></div></div>

      <div className="px-3 pb-4 sm:px-6 sm:pb-6"><div className="mx-auto max-w-3xl">{replyTo && <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mb-2 flex items-center gap-2 rounded-xl border border-white/[.06] bg-white/[.035] px-3 py-2"><div className="h-7 w-0.5 rounded-full bg-white/50" /><div className="min-w-0 flex-1"><p className="text-[10px] font-medium text-white/45">Replying to {current.name}</p><p className="truncate text-xs text-white/25">{replyTo.text}</p></div><button onClick={() => setReplyTo(null)} className="text-white/25 hover:text-white"><X size={14} /></button></motion.div>}
        <div className="glass relative flex items-end gap-2 rounded-2xl p-2 shadow-glow"><div className="flex pb-1"><IconButton label="Attach file" onClick={() => notify("File attachments will be wired to storage later")}><Paperclip size={18} /></IconButton><IconButton label="Add image" onClick={() => notify("Media uploads will be wired in the media phase")}><ImageIcon size={18} /></IconButton></div><textarea ref={inputRef} value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} rows={1} placeholder="Write a message..." className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-white outline-none placeholder:text-white/25" /><div className="relative flex items-center gap-1 pb-1"><IconButton label="Emoji" active={showEmoji} onClick={() => setShowEmoji(v => !v)}><Smile size={18} /></IconButton>{showEmoji && <motion.div initial={{ opacity: 0, y: 8, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute bottom-12 right-0 grid w-44 grid-cols-6 gap-1 rounded-2xl border border-white/[.08] bg-[#151821] p-2 shadow-2xl">{["😀","😂","😍","🔥","✨","👍","❤️","🎉","🚀","😎","🤝","💡"].map(emoji => <button key={emoji} onClick={() => { setMessage(v => v + emoji); setShowEmoji(false); inputRef.current?.focus(); }} className="rounded-lg p-2 text-lg hover:bg-white/[.06]">{emoji}</button>)}</motion.div>}<motion.button whileTap={{ scale: .9 }} onClick={sendMessage} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30" disabled={!message.trim()} aria-label="Send message"><Send size={17} /></motion.button></div></div><p className="mt-2 hidden text-center text-[10px] text-white/15 sm:block">Enter to send · Shift + Enter for a new line</p></div></div>
    </section>

    <AnimatePresence>{showDetails && <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 285, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="details-panel hidden shrink-0 overflow-hidden border-l border-white/[.07] bg-[#0b0d12] xl:block"><div className="w-[285px] px-5 py-7"><div className="flex flex-col items-center text-center"><Avatar initials={current.initials} online={current.online} accent={current.accent} size="lg" /><h3 className="mt-4 text-base font-semibold">{current.name}</h3><p className="mt-1 text-xs text-white/30">@{current.id}</p><div className="mt-5 flex gap-2"><button onClick={() => notify("Profile preview coming soon")} className="rounded-xl bg-white/[.06] px-4 py-2 text-xs text-white/70 hover:bg-white/[.1]">Profile</button><button onClick={() => notify("Conversation muted")} className="rounded-xl bg-white/[.06] px-4 py-2 text-xs text-white/70 hover:bg-white/[.1]">Mute</button></div></div><div className="my-7 h-px bg-white/[.06]" /><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-white/25">Shared space</p><div className="space-y-2"><InfoRow icon={<FileText size={15} />} title="Files" value="12 items" onClick={() => notify("Files view coming later")} /><InfoRow icon={<ImageIcon size={15} />} title="Media" value="24 items" onClick={() => notify("Media view coming later")} /><InfoRow icon={<Hash size={15} />} title="Links" value="8 links" onClick={() => notify("Links view coming later")} /></div><div className="my-7 h-px bg-white/[.06]" /><div className="rounded-2xl border border-white/[.06] bg-white/[.025] p-4"><div className="mb-2 flex items-center gap-2 text-xs font-medium"><Sparkles size={14} className="text-white/60" />Nitra workspace</div><p className="text-[11px] leading-5 text-white/30">Phase 2 adds command search, reactions, reply actions, emoji, local chat state, keyboard shortcuts, and richer feedback.</p></div></div></motion.aside>}</AnimatePresence>

    <AnimatePresence>{showCommand && <motion.div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setShowCommand(false)}><motion.div initial={{ opacity: 0, y: -14, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} onMouseDown={e => e.stopPropagation()} className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/[.1] bg-[#101219] shadow-2xl"><div className="flex items-center gap-3 border-b border-white/[.07] px-4 py-3"><Search size={18} className="text-white/30" /><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people, conversations, commands..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/25" /><kbd className="rounded-md bg-white/[.06] px-2 py-1 text-[10px] text-white/30">ESC</kbd></div><div className="p-2"><p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[.18em] text-white/20">Quick actions</p><CommandItem icon={<PenLine size={16} />} title="New message" hint="Compose" onClick={newMessage} /><CommandItem icon={<MessageCircle size={16} />} title="Open Maya Chen" hint="Chat" onClick={() => { openChat("maya"); setShowCommand(false); }} /><CommandItem icon={<CircleHelp size={16} />} title="What is Nitra?" hint="Info" onClick={() => notify("Nitra is your real-time communication workspace")}/></div></motion.div></motion.div>}</AnimatePresence>

    <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 12, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-white/[.1] bg-[#151821]/95 px-4 py-2.5 text-xs text-white/75 shadow-2xl backdrop-blur-xl">{toast}</motion.div>}</AnimatePresence>
  </main>;
}

function InfoRow({ icon, title, value, onClick }: { icon: React.ReactNode; title: string; value: string; onClick: () => void }) {
  return <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-white/[.04]"><span className="text-white/30">{icon}</span><span className="flex-1"><span className="block text-xs text-white/65">{title}</span><span className="block text-[10px] text-white/25">{value}</span></span><ChevronDown size={14} className="-rotate-90 text-white/15" /></button>;
}

function CommandItem({ icon, title, hint, onClick }: { icon: React.ReactNode; title: string; hint: string; onClick: () => void }) {
  return <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[.06]"><span className="text-white/45">{icon}</span><span className="flex-1 text-sm text-white/75">{title}</span><span className="text-[10px] text-white/20">{hint}</span></button>;
}
