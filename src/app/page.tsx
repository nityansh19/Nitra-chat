"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Archive, ArrowLeft, Bell, CheckCheck, ChevronDown, CircleHelp, FileText,
  Hash, Image as ImageIcon, Info, Menu, MessageCircle, MoreHorizontal,
  Paperclip, PenLine, Phone, Plus, Search, Send, Settings, Smile, Sparkles,
  Users, Video, X
} from "lucide-react";
import { useMemo, useState } from "react";

const conversations = [
  { id: "maya", name: "Maya Chen", initials: "MC", preview: "That new flow looks really good.", time: "2m", unread: 2, online: true, accent: "from-violet-400 to-fuchsia-400" },
  { id: "dev", name: "Nitra Dev Team", initials: "ND", preview: "Arjun: pushed the websocket draft", time: "18m", unread: 7, group: true, accent: "from-cyan-400 to-blue-500" },
  { id: "alex", name: "Alex Morgan", initials: "AM", preview: "Can you review this when free?", time: "1h", online: true, accent: "from-amber-300 to-orange-500" },
  { id: "design", name: "Design Studio", initials: "DS", preview: "You: Let's keep the motion subtle", time: "3h", group: true, accent: "from-rose-400 to-red-500" },
  { id: "sam", name: "Sam Rivera", initials: "SR", preview: "Voice message", time: "Yesterday", accent: "from-emerald-300 to-teal-500" },
];

const initialMessages = [
  { id: 1, from: "them", text: "Hey! I just checked the latest Nitra flow.", time: "6:42 PM" },
  { id: 2, from: "me", text: "Nice. I was trying to make the workspace feel less like a clone and more like a real product.", time: "6:43 PM" },
  { id: 3, from: "them", text: "That new flow looks really good. The transitions make it feel alive without being distracting.", time: "6:44 PM" },
  { id: 4, from: "me", text: "Exactly the vibe. Next step is real-time presence + WebSockets.", time: "6:45 PM" },
  { id: 5, from: "them", text: "Love it. Keep the composer simple too — the context should stay in the conversation.", time: "6:46 PM" },
];

function Avatar({ initials, online, accent = "from-indigo-400 to-cyan-400", size = "md" }: { initials: string; online?: boolean; accent?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8 text-[10px]", md: "h-10 w-10 text-xs", lg: "h-16 w-16 text-lg" };
  return <div className={`relative shrink-0 rounded-2xl bg-gradient-to-br ${accent} p-[1px] ${sizes[size]}`}><div className="flex h-full w-full items-center justify-center rounded-[calc(1rem-1px)] bg-[#11131a] font-semibold text-white/90">{initials}</div>{online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0d0f14] bg-emerald-400" />}</div>;
}

function IconButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return <button onClick={onClick} aria-label={label} title={label} className="flex h-9 w-9 items-center justify-center rounded-xl text-white/45 transition hover:bg-white/[.06] hover:text-white">{children}</button>;
}

function RailButton({ children, active, label }: { children: React.ReactNode; active?: boolean; label: string }) {
  return <button title={label} aria-label={label} className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition ${active ? "bg-white/[.1] text-white shadow-glow" : "text-white/35 hover:bg-white/[.06] hover:text-white/80"}`}>{children}{active && <span className="absolute -left-3 h-5 w-1 rounded-r-full bg-white" />}</button>;
}

export default function Home() {
  const [active, setActive] = useState("maya");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [showMobileList, setShowMobileList] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [typing, setTyping] = useState(false);
  const current = conversations.find(c => c.id === active) ?? conversations[0];
  const filtered = useMemo(() => conversations.filter(c => `${c.name} ${c.preview}`.toLowerCase().includes(query.toLowerCase())), [query]);

  function sendMessage() {
    const value = message.trim();
    if (!value) return;
    setMessages(prev => [...prev, { id: Date.now(), from: "me", text: value, time: "now" }]);
    setMessage("");
    setTyping(true);
    window.setTimeout(() => setTyping(false), 1300);
  }

  return (
    <main className="noise flex h-screen overflow-hidden bg-[#08090d] text-white">
      <aside className="desktop-rail glass relative z-20 flex w-[76px] flex-col items-center justify-between border-y-0 border-l-0 px-3 py-5">
        <div className="flex flex-col items-center gap-5">
          <motion.div whileHover={{ rotate: 8, scale: 1.05 }} className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black shadow-glow"><MessageCircle size={21} strokeWidth={2.5} /></motion.div>
          <RailButton active label="Chats"><MessageCircle size={20} /></RailButton>
          <RailButton label="People"><Users size={20} /></RailButton>
          <RailButton label="Saved"><Archive size={20} /></RailButton>
          <RailButton label="Notifications"><Bell size={20} /></RailButton>
        </div>
        <div className="flex flex-col items-center gap-3">
          <RailButton label="Settings"><Settings size={19} /></RailButton>
          <Avatar initials="NR" accent="from-indigo-400 to-violet-500" />
        </div>
      </aside>

      <AnimatePresence>
        {showMobileList && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMobileList(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden" />}
      </AnimatePresence>

      <aside className={`absolute inset-y-0 left-0 z-40 flex w-[330px] flex-col border-r border-white/[.07] bg-[#0c0e13] transition-transform lg:relative lg:z-10 lg:flex ${showMobileList ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center justify-between px-5 pb-4 pt-6">
          <div><p className="text-[11px] font-medium uppercase tracking-[.22em] text-white/30">Workspace</p><h1 className="mt-1 text-xl font-semibold tracking-tight">Messages</h1></div>
          <div className="flex gap-1"><IconButton label="New message"><PenLine size={18} /></IconButton><IconButton label="Close" onClick={() => setShowMobileList(false)}><X size={18} /></IconButton></div>
        </div>
        <div className="px-4 pb-4"><div className="flex h-10 items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.035] px-3"><Search size={16} className="text-white/30" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search conversations" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25" /><kbd className="hidden rounded-md bg-white/[.06] px-1.5 py-0.5 text-[10px] text-white/25 sm:block">⌘ K</kbd></div></div>
        <div className="flex-1 overflow-y-auto px-2">
          <div className="mb-2 flex items-center justify-between px-3"><span className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/25">Recent</span><button className="text-xs text-white/25 hover:text-white/60">Edit</button></div>
          {filtered.map(c => <motion.button layout key={c.id} onClick={() => { setActive(c.id); setShowMobileList(false); }} className={`group mb-1 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${active === c.id ? "bg-white/[.075]" : "hover:bg-white/[.04]"}`}><Avatar initials={c.initials} online={c.online} accent={c.accent} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className={`truncate text-sm font-medium ${active === c.id ? "text-white" : "text-white/75"}`}>{c.name}</span><span className="shrink-0 text-[10px] text-white/25">{c.time}</span></span><span className="mt-1 flex items-center justify-between gap-2"><span className="truncate text-xs text-white/30">{c.preview}</span>{c.unread ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">{c.unread}</span> : null}</span></span></motion.button>)}
        </div>
        <div className="border-t border-white/[.06] p-4"><div className="flex items-center gap-3 rounded-2xl bg-white/[.035] p-3"><Avatar initials="NR" accent="from-indigo-400 to-violet-500" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">Nityansh</p><p className="flex items-center gap-1.5 text-[11px] text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Available</p></div><MoreHorizontal size={17} className="text-white/25" /></div></div>
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col bg-[radial-gradient(circle_at_50%_-20%,rgba(115,130,255,.08),transparent_45%)]">
        <header className="glass flex h-[72px] shrink-0 items-center justify-between border-x-0 border-t-0 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3"><IconButton label="Open conversations" onClick={() => setShowMobileList(true)}><Menu size={20} /></IconButton><Avatar initials={current.initials} online={current.online} accent={current.accent} /><div className="min-w-0"><h2 className="truncate text-sm font-semibold">{current.name}</h2><p className="mt-0.5 text-[11px] text-white/30">{current.online ? "Active now" : "Last seen recently"}</p></div></div>
          <div className="flex items-center gap-1"><IconButton label="Search in chat"><Search size={18} /></IconButton><IconButton label="Start call"><Phone size={18} /></IconButton><IconButton label="Start video call"><Video size={18} /></IconButton><IconButton label="Chat info" onClick={() => setShowDetails(v => !v)}><Info size={18} /></IconButton></div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-3xl flex-col">
            <div className="mb-8 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[.2em] text-white/20"><span className="h-px flex-1 bg-white/[.06]" />Today<span className="h-px flex-1 bg-white/[.06]" /></div>
            <AnimatePresence initial={false}>{messages.map((m, i) => <motion.div key={m.id} initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .25, delay: i > messages.length - 2 ? .05 : 0 }} className={`mb-3 flex ${m.from === "me" ? "justify-end" : "justify-start"}`}><div className={`group max-w-[78%] sm:max-w-[68%] ${m.from === "me" ? "items-end" : "items-start"}`}><div className={`rounded-2xl px-4 py-3 text-sm leading-6 ${m.from === "me" ? "rounded-br-md bg-white text-[#0a0b0e]" : "rounded-bl-md border border-white/[.07] bg-white/[.045] text-white/80"}`}>{m.text}</div><div className={`mt-1.5 flex items-center gap-1.5 px-1 text-[10px] text-white/20 ${m.from === "me" ? "justify-end" : ""}`}>{m.time}{m.from === "me" && <CheckCheck size={12} />}</div></div></motion.div>)}</AnimatePresence>
            <AnimatePresence>{typing && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-3 flex"><div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/[.07] bg-white/[.045] px-4 py-3"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:-.2s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:-.1s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" /></div></motion.div>}</AnimatePresence>
          </div>
        </div>

        <div className="px-3 pb-4 sm:px-6 sm:pb-6"><div className="mx-auto max-w-3xl"><div className="glass flex items-end gap-2 rounded-2xl p-2 shadow-glow"><div className="flex pb-1"><IconButton label="Attach file"><Paperclip size={18} /></IconButton><IconButton label="Add image"><ImageIcon size={18} /></IconButton></div><textarea value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} rows={1} placeholder="Write a message..." className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-white outline-none placeholder:text-white/25" /><div className="flex items-center gap-1 pb-1"><IconButton label="Emoji"><Smile size={18} /></IconButton><motion.button whileTap={{ scale: .9 }} onClick={sendMessage} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30" disabled={!message.trim()} aria-label="Send message"><Send size={17} /></motion.button></div></div><p className="mt-2 hidden text-center text-[10px] text-white/15 sm:block">Enter to send · Shift + Enter for a new line</p></div></div>
      </section>

      <AnimatePresence>{showDetails && <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 285, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="details-panel hidden shrink-0 overflow-hidden border-l border-white/[.07] bg-[#0b0d12] xl:block"><div className="w-[285px] px-5 py-7"><div className="flex flex-col items-center text-center"><Avatar initials={current.initials} online={current.online} accent={current.accent} size="lg" /><h3 className="mt-4 text-base font-semibold">{current.name}</h3><p className="mt-1 text-xs text-white/30">@{current.id}</p><div className="mt-5 flex gap-2"><button className="rounded-xl bg-white/[.06] px-4 py-2 text-xs text-white/70 hover:bg-white/[.1]">Profile</button><button className="rounded-xl bg-white/[.06] px-4 py-2 text-xs text-white/70 hover:bg-white/[.1]">Mute</button></div></div><div className="my-7 h-px bg-white/[.06]" /><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-white/25">Shared space</p><div className="space-y-2"><InfoRow icon={<FileText size={15} />} title="Files" value="12 items" /><InfoRow icon={<ImageIcon size={15} />} title="Media" value="24 items" /><InfoRow icon={<Hash size={15} />} title="Links" value="8 links" /></div><div className="my-7 h-px bg-white/[.06]" /><div className="rounded-2xl border border-white/[.06] bg-white/[.025] p-4"><div className="mb-2 flex items-center gap-2 text-xs font-medium"><Sparkles size={14} className="text-white/60" />Nitra workspace</div><p className="text-[11px] leading-5 text-white/30">Real-time collaboration, clean context, and conversations that stay focused.</p></div></div></motion.aside>}</AnimatePresence>
    </main>
  );
}

function InfoRow({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return <button className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-white/[.04]"><span className="text-white/30">{icon}</span><span className="flex-1"><span className="block text-xs text-white/65">{title}</span><span className="block text-[10px] text-white/25">{value}</span></span><ChevronDown size={14} className="-rotate-90 text-white/15" /></button>;
}
