"use client";

import { ArrowLeft, Camera, Check, ChevronRight, Copy, ExternalLink, Globe2, Loader2, LogOut, MessageCircle, MapPin, Pencil, Shield, UserRound, X } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { logoutFromFirebase, subscribeToFirebaseAuth } from "@/lib/firebase-auth";
import { getUserProfile, mapFirestoreError, updateUserProfile, type UserProfile } from "@/lib/firebase-chat";

type User = { uid?: string; name: string; email: string; phone: string; id: string; initials: string; bio?: string; status?: string; avatar?: string; location?: string; role?: string; website?: string };
const defaultUser: User = { name: "Nitra User", email: "", phone: "", id: "@nitra_user", initials: "NU", bio: "New to Nitra.", status: "Available", location: "", role: "", website: "", avatar: "" };

function fromProfile(profile: UserProfile): User {
  return { uid: profile.uid, name: profile.name || "Nitra User", email: profile.email || "", phone: profile.phone || "", id: profile.nitraId || "@nitra_user", initials: profile.initials || "NU", bio: profile.bio || "New to Nitra.", status: profile.status || "Available", avatar: profile.avatarUrl || "", location: profile.location || "", role: profile.role || "", website: profile.website || "" };
}

function fromLocalStorage(): User | null {
  const raw = localStorage.getItem("nitra-demo-user");
  if (!raw) return null;
  try { return { ...defaultUser, ...JSON.parse(raw) } as User; } catch { return null; }
}

export default function ProfilePage() {
  const [user, setUser] = useState<User>(defaultUser);
  const [draft, setDraft] = useState<User>(defaultUser);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToFirebaseAuth(async (firebaseUser) => {
      if (!firebaseUser) {
        const local = fromLocalStorage();
        if (local) { setUser(local); setDraft(local); }
        setLoading(false);
        return;
      }
      try {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          const next = fromProfile(profile);
          setUser(next); setDraft(next);
          localStorage.setItem("nitra-demo-user", JSON.stringify(next));
        } else {
          const local = fromLocalStorage();
          if (local) { const next = { ...local, uid: firebaseUser.uid, email: firebaseUser.email || local.email }; setUser(next); setDraft(next); }
        }
      } catch (err) {
        setError(mapFirestoreError(err));
        const local = fromLocalStorage();
        if (local) { setUser(local); setDraft(local); }
      } finally { setLoading(false); }
    });
    return unsubscribe;
  }, []);

  const initials = useMemo(() => { const value = draft.name.trim(); return value.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase() || "NU"; }, [draft.name]);
  const completion = useMemo(() => { const fields = [user.name, user.bio, user.status, user.avatar, user.location, user.role]; return Math.round((fields.filter(Boolean).length / fields.length) * 100); }, [user]);

  async function save() {
    if (!user.uid) { setError("Your Firebase account is not ready. Please sign out and sign in again."); return; }
    setSaving(true); setError("");
    const next: User = { ...draft, uid: user.uid, name: draft.name.trim() || "Nitra User", bio: draft.bio?.trim() || "New to Nitra.", status: draft.status?.trim() || "Available", location: draft.location?.trim() || "", role: draft.role?.trim() || "", website: draft.website?.trim() || "", initials };
    try {
      await updateUserProfile(user.uid, { name: next.name, phone: next.phone || "", initials: next.initials, bio: next.bio, status: next.status, avatarUrl: next.avatar || "", role: next.role, location: next.location, website: next.website });
      localStorage.setItem("nitra-demo-user", JSON.stringify(next));
      setUser(next); setDraft(next); setEditing(false); setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (err) { setError(mapFirestoreError(err)); } finally { setSaving(false); }
  }

  function copyId() { navigator.clipboard?.writeText(user.id); setCopied(true); window.setTimeout(() => setCopied(false), 1200); }
  function handleAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setAvatarError("");
    if (!file.type.startsWith("image/")) return setAvatarError("Choose an image file.");
    if (file.size > 2 * 1024 * 1024) return setAvatarError("Profile pictures must be under 2 MB.");
    const reader = new FileReader(); reader.onload = () => setDraft(current => ({ ...current, avatar: String(reader.result) })); reader.readAsDataURL(file);
  }
  function removeAvatar() { setDraft(current => ({ ...current, avatar: "" })); }
  async function signOut() { try { await logoutFromFirebase(); } catch {} localStorage.removeItem("nitra-demo-user"); window.location.href = "/"; }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#08090d] text-white"><div className="flex items-center gap-3 text-sm text-white/40"><Loader2 size={17} className="animate-spin" />Loading your Nitra profile…</div></main>;

  return <main className="min-h-screen bg-[#08090d] text-white"><div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
    <header className="mb-8 flex items-center justify-between"><Link href="/" className="group flex items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.035] px-3 py-2 text-sm text-white/55 transition hover:bg-white/[.07] hover:text-white"><ArrowLeft size={16} className="transition group-hover:-translate-x-1" /> Back to Nitra</Link><div className="flex items-center gap-2 text-sm font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black"><MessageCircle size={16} /></span>Nitra Chat</div></header>
    {error && <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-red-400/15 bg-red-400/[.06] p-4 text-sm text-red-100/80"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={15} /></button></div>}
    <section className="relative overflow-hidden rounded-[30px] border border-white/[.08] bg-white/[.035] p-6 shadow-2xl backdrop-blur-2xl sm:p-10"><div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" /><div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="relative h-28 w-28 shrink-0 rounded-[30px] bg-gradient-to-br from-indigo-400 via-violet-500 to-fuchsia-400 p-[2px] shadow-2xl"><div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[28px] bg-[#11131a] text-3xl font-semibold">{user.avatar ? <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" /> : user.initials || "NU"}</div><button onClick={() => { setDraft(user); setEditing(true); }} className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#171923] text-white shadow-xl transition hover:scale-105" aria-label="Change profile picture"><Camera size={15} /></button></div><div><p className="text-[10px] font-semibold uppercase tracking-[.25em] text-white/25">Your Nitra identity</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{user.name}</h1><div className="mt-2 flex flex-wrap items-center gap-2"><button onClick={copyId} className="flex items-center gap-2 rounded-full border border-white/[.07] bg-white/[.035] px-3 py-1.5 text-xs text-white/55 hover:bg-white/[.07]">{user.id}<Copy size={12} />{copied ? "Copied" : ""}</button><span className="flex items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-1.5 text-xs text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{user.status || "Available"}</span></div>{(user.role || user.location) && <p className="mt-3 flex flex-wrap gap-3 text-xs text-white/30">{user.role && <span>{user.role}</span>}{user.location && <span className="flex items-center gap-1"><MapPin size={12} />{user.location}</span>}</p>}</div></div><button onClick={() => { setDraft(user); setEditing(true); setError(""); }} className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"><Pencil size={15} /> Edit profile</button></div></section>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><section className="rounded-[26px] border border-white/[.07] bg-white/[.025] p-6"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[.05]"><UserRound size={17} className="text-white/60" /></div><div><h2 className="font-medium">About you</h2><p className="text-xs text-white/25">Your public profile information</p></div></div><span className="text-xs text-violet-200/45">{completion}% complete</span></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[.05]"><div className="h-full rounded-full bg-violet-300/60 transition-all" style={{ width: `${completion}%` }} /></div><p className="mt-5 rounded-2xl border border-white/[.06] bg-black/10 p-4 text-sm leading-6 text-white/55">{user.bio || "New to Nitra."}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><Info label="Email" value={user.email || "Not added"} /><Info label="Phone" value={user.phone || "Not added"} /><Info label="Role" value={user.role || "Not added"} /><Info label="Location" value={user.location || "Not added"} /></div>{user.website && <a href={user.website.startsWith("http") ? user.website : `https://${user.website}`} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-2 rounded-2xl border border-white/[.06] bg-black/10 p-4 text-sm text-white/45 hover:bg-white/[.04] hover:text-white"><Globe2 size={15} />{user.website}<ExternalLink size={13} className="ml-auto" /></a>}</section><section className="rounded-[26px] border border-white/[.07] bg-white/[.025] p-6"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[.05]"><Shield size={17} className="text-white/60" /></div><div><h2 className="font-medium">Profile controls</h2><p className="text-xs text-white/25">Your profile is synced to Firebase</p></div></div><div className="mt-5 space-y-2"><PrivacyRow title="Profile visibility" value="Everyone" /><PrivacyRow title="Activity status" value="Visible" /><PrivacyRow title="Read receipts" value="On" /></div><button onClick={() => { setDraft(user); setEditing(true); }} className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/[.06] bg-black/10 p-4 text-xs text-white/45 hover:bg-white/[.04]">Personalize your profile <ChevronRight size={15} /></button></section></div>
    <section className="mt-5 rounded-[26px] border border-violet-300/10 bg-violet-300/[.025] p-6"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-violet-200/35">Your profile, your identity</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><Feature title="Photo" text="Your profile picture is stored with your Nitra profile" /><Feature title="Identity" text="Your Nitra ID stays unique and locked" /><Feature title="Presence" text="Set the status people see" /></div></section>
    <button onClick={signOut} className="mt-5 flex w-full items-center justify-between rounded-2xl border border-red-400/10 bg-red-400/[.025] p-4 text-left text-sm text-red-200/65 transition hover:bg-red-400/[.06]"><span className="flex items-center gap-3"><LogOut size={17} /> Sign out</span><ChevronRight size={16} /></button>
    {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" onMouseDown={() => !saving && setEditing(false)}><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-white/[.09] bg-[#101219] p-6 shadow-2xl" onMouseDown={e => e.stopPropagation()}><div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.2em] text-white/25">Profile editor</p><h2 className="mt-1 text-xl font-semibold">Make your Nitra profile yours.</h2><p className="mt-1 text-xs text-white/25">Changes are saved to your Firebase account.</p></div><button disabled={saving} onClick={() => setEditing(false)} className="flex h-9 w-9 items-center justify-center rounded-xl text-white/30 hover:bg-white/[.06] hover:text-white disabled:opacity-40" aria-label="Close"><X size={17} /></button></div><div className="mb-6 flex items-center gap-4 rounded-2xl border border-white/[.06] bg-white/[.025] p-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#171923] text-lg font-semibold">{draft.avatar ? <img src={draft.avatar} alt="Profile preview" className="h-full w-full object-cover" /> : initials}</div><div className="min-w-0 flex-1"><p className="text-sm font-medium">Profile picture</p><p className="mt-1 text-xs text-white/25">JPG, PNG, GIF or WebP · max 2 MB</p>{avatarError && <p className="mt-1 text-[11px] text-red-200/70">{avatarError}</p>}</div><div className="flex gap-2"><label className="cursor-pointer rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-white/90"><Camera size={13} className="mr-1 inline" /> Upload<input type="file" accept="image/*" onChange={handleAvatar} className="hidden" /></label>{draft.avatar && <button onClick={removeAvatar} className="rounded-xl border border-white/[.08] px-3 py-2 text-xs text-white/45 hover:bg-white/[.05]">Remove</button>}</div></div><div className="space-y-4"><EditField label="Display name" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} /><div><label className="mb-2 block text-xs text-white/50">Nitra ID</label><div className="flex h-11 items-center rounded-xl border border-white/[.06] bg-black/20 px-3 text-sm text-white/35">{draft.id}<span className="ml-auto text-[9px] uppercase tracking-wider">Locked</span></div></div><EditField label="Role / headline" value={draft.role || ""} onChange={v => setDraft({ ...draft, role: v })} placeholder="e.g. Full Stack Developer" /><EditField label="Location" value={draft.location || ""} onChange={v => setDraft({ ...draft, location: v })} placeholder="e.g. Lucknow, India" /><EditField label="Status" value={draft.status || ""} onChange={v => setDraft({ ...draft, status: v })} placeholder="Available" /><EditField label="Website" value={draft.website || ""} onChange={v => setDraft({ ...draft, website: v })} placeholder="example.com" /><div><label className="mb-2 block text-xs text-white/50">Bio</label><textarea value={draft.bio || ""} onChange={e => setDraft({ ...draft, bio: e.target.value.slice(0, 180) })} rows={4} className="w-full resize-none rounded-xl border border-white/[.08] bg-black/20 p-3 text-sm outline-none focus:border-violet-300/30" placeholder="Tell people a little about you..." /><p className="mt-1 text-right text-[9px] text-white/15">{(draft.bio || "").length}/180</p></div></div>{error && <div className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[.05] p-3 text-xs text-red-100/80">{error}</div>}<div className="mt-6 flex justify-end gap-2"><button disabled={saving} onClick={() => setEditing(false)} className="rounded-xl px-4 py-2.5 text-sm text-white/45 hover:bg-white/[.05] disabled:opacity-40">Cancel</button><button disabled={saving} onClick={save} className="flex min-w-32 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:cursor-wait disabled:opacity-70">{saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : saved ? <><Check size={15} /> Saved</> : "Save changes"}</button></div></div></div>}
  </div></main>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/[.06] bg-black/10 p-4"><p className="text-[10px] uppercase tracking-[.16em] text-white/20">{label}</p><p className="mt-2 truncate text-sm text-white/50">{value}</p></div>; }
function PrivacyRow({ title, value }: { title: string; value: string }) { return <div className="flex items-center justify-between rounded-xl border border-white/[.05] bg-black/10 p-3"><span className="text-xs text-white/45">{title}</span><span className="text-xs text-white/25">{value}</span></div>; }
function Feature({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl border border-white/[.06] bg-black/10 p-4"><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs leading-5 text-white/25">{text}</p></div>; }
function EditField({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) { return <div><label className="mb-2 block text-xs text-white/50">{label}</label><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-white/[.08] bg-black/20 px-3 text-sm outline-none placeholder:text-white/15 focus:border-violet-300/30" /></div>; }
