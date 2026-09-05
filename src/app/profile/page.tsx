"use client";

import { ArrowLeft, Check, ChevronRight, Copy, LogOut, MessageCircle, Shield, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type User = { name: string; email: string; phone: string; id: string; initials: string; bio?: string; status?: string };

const defaultUser: User = { name: "Nitra User", email: "", phone: "", id: "@nitra_user", initials: "NU", bio: "New to Nitra.", status: "Available" };

export default function ProfilePage() {
  const [user, setUser] = useState<User>(defaultUser);
  const [draft, setDraft] = useState<User>(defaultUser);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("nitra-demo-user");
    if (!raw) return;
    try { const parsed = { ...defaultUser, ...JSON.parse(raw) }; setUser(parsed); setDraft(parsed); } catch { /* keep defaults */ }
  }, []);

  const initials = useMemo(() => {
    const value = draft.name.trim();
    return value.split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase() || "NU";
  }, [draft.name]);

  function save() {
    const next = { ...draft, name: draft.name.trim() || "Nitra User", bio: draft.bio?.trim() || "New to Nitra.", status: draft.status?.trim() || "Available", initials };
    localStorage.setItem("nitra-demo-user", JSON.stringify(next));
    setUser(next); setDraft(next); setEditing(false); setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  function copyId() {
    navigator.clipboard?.writeText(user.id);
    setCopied(true); window.setTimeout(() => setCopied(false), 1200);
  }

  function signOut() {
    localStorage.removeItem("nitra-demo-user");
    window.location.href = "/";
  }

  return <main className="min-h-screen bg-[#08090d] text-white">
    <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.035] px-3 py-2 text-sm text-white/55 transition hover:bg-white/[.07] hover:text-white"><ArrowLeft size={16} className="transition group-hover:-translate-x-1" /> Back to Nitra</Link>
        <div className="flex items-center gap-2 text-sm font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black"><MessageCircle size={16} /></span>Nitra Chat</div>
      </header>

      <section className="relative overflow-hidden rounded-[30px] border border-white/[.08] bg-white/[.035] p-6 shadow-2xl backdrop-blur-2xl sm:p-10">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[30px] bg-gradient-to-br from-indigo-400 via-violet-500 to-fuchsia-400 p-[2px] shadow-2xl"><div className="flex h-full w-full items-center justify-center rounded-[28px] bg-[#11131a] text-3xl font-semibold">{initials}</div></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-[.25em] text-white/25">Nitra identity</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{user.name}</h1><div className="mt-2 flex flex-wrap items-center gap-2"><button onClick={copyId} className="flex items-center gap-2 rounded-full border border-white/[.07] bg-white/[.035] px-3 py-1.5 text-xs text-white/55 hover:bg-white/[.07]">{user.id}<Copy size={12} />{copied ? "Copied" : ""}</button><span className="flex items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-1.5 text-xs text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{user.status || "Available"}</span></div></div>
          </div>
          <button onClick={() => { setDraft(user); setEditing(true); }} className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]">Edit profile</button>
        </div>
      </section>

      <div className="mt-5 grid gap-5 md:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-[26px] border border-white/[.07] bg-white/[.025] p-6"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[.05]"><UserRound size={17} className="text-white/60" /></div><div><h2 className="font-medium">About you</h2><p className="text-xs text-white/25">What people can see on your profile</p></div></div><p className="mt-6 rounded-2xl border border-white/[.06] bg-black/10 p-4 text-sm leading-6 text-white/55">{user.bio || "New to Nitra."}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><Info label="Email" value={user.email || "Not added"} /><Info label="Phone" value={user.phone || "Not added"} /></div></section>
        <section className="rounded-[26px] border border-white/[.07] bg-white/[.025] p-6"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[.05]"><Shield size={17} className="text-white/60" /></div><div><h2 className="font-medium">Privacy</h2><p className="text-xs text-white/25">Frontend-only controls for now</p></div></div><div className="mt-5 space-y-2"><PrivacyRow title="Profile visibility" value="Everyone" /><PrivacyRow title="Activity status" value="Visible" /><PrivacyRow title="Read receipts" value="On" /></div></section>
      </div>

      <section className="mt-5 rounded-[26px] border border-white/[.07] bg-white/[.025] p-6"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/25">Phase 4 foundation</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><Feature title="Identity" text="Persistent demo Nitra ID" /><Feature title="Profile" text="Editable name, bio & status" /><Feature title="Privacy" text="UI ready for backend rules" /></div></section>

      <button onClick={signOut} className="mt-5 flex w-full items-center justify-between rounded-2xl border border-red-400/10 bg-red-400/[.025] p-4 text-left text-sm text-red-200/65 transition hover:bg-red-400/[.06]"><span className="flex items-center gap-3"><LogOut size={17} /> Sign out of this frontend demo</span><ChevronRight size={16} /></button>

      {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-[28px] border border-white/[.08] bg-[#101219] p-6 shadow-2xl"><div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.2em] text-white/25">Edit identity</p><h2 className="mt-1 text-xl font-semibold">Make it yours</h2></div><button onClick={() => setEditing(false)} className="text-white/30 hover:text-white">×</button></div><div className="space-y-4"><EditField label="Display name" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} /><div><label className="mb-2 block text-xs text-white/50">Nitra ID</label><div className="flex h-11 items-center rounded-xl border border-white/[.06] bg-black/20 px-3 text-sm text-white/35">{draft.id}<span className="ml-auto text-[9px] uppercase tracking-wider">Locked</span></div></div><div><label className="mb-2 block text-xs text-white/50">Bio</label><textarea value={draft.bio || ""} onChange={e => setDraft({ ...draft, bio: e.target.value.slice(0, 120) })} rows={3} className="w-full resize-none rounded-xl border border-white/[.08] bg-black/20 p-3 text-sm outline-none focus:border-white/20" placeholder="A short bio..." /></div><EditField label="Status" value={draft.status || ""} onChange={v => setDraft({ ...draft, status: v })} /><div className="flex justify-end gap-2 pt-2"><button onClick={() => setEditing(false)} className="rounded-xl px-4 py-2.5 text-sm text-white/45 hover:bg-white/[.05]">Cancel</button><button onClick={save} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black">{saved ? <><Check size={15} /> Saved</> : "Save changes"}</button></div></div></div></div>}
    </div>
  </main>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/[.06] bg-black/10 p-4"><p className="text-[10px] uppercase tracking-[.16em] text-white/20">{label}</p><p className="mt-2 truncate text-sm text-white/50">{value}</p></div>; }
function PrivacyRow({ title, value }: { title: string; value: string }) { return <div className="flex items-center justify-between rounded-xl border border-white/[.05] bg-black/10 p-3"><span className="text-xs text-white/45">{title}</span><span className="text-xs text-white/25">{value}</span></div>; }
function Feature({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl border border-white/[.06] bg-black/10 p-4"><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs leading-5 text-white/25">{text}</p></div>; }
function EditField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <div><label className="mb-2 block text-xs text-white/50">{label}</label><input value={value} onChange={e => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-white/[.08] bg-black/20 px-3 text-sm outline-none focus:border-white/20" /></div>; }
