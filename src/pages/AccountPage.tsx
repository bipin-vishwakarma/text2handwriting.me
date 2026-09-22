import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, BookOpen, Check, ChevronRight, Edit2, FileText, HardDrive,
    Loader2, LogOut, Mail, Save, ShieldCheck, Sparkles, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../lib/store';
import { getAllExportedFiles } from '../lib/fileStorage';
import SiteLogo from '../components/common/SiteLogo';

const ASSIGNMENT_DEFAULTS_KEY = 'text2handwriting_assignment_defaults';

type AssignmentDefaults = { name: string; studentId: string; subject: string };

function formatAssignmentHeader({ name, studentId, subject }: AssignmentDefaults) {
    return [
        name.trim() ? `Name: ${name.trim()}` : '',
        studentId.trim() ? `SAP ID / Roll No: ${studentId.trim()}` : '',
        subject.trim() ? `Subject: ${subject.trim()}` : '',
    ].filter(Boolean).join('\n');
}

const panelClass = 'rounded-[1.5rem] border border-white/80 bg-white/72 shadow-[0_18px_55px_-42px_rgba(28,25,23,.46)] backdrop-blur-xl';

export default function AccountPage() {
    const { user, isAuthenticated, logout, updateUserProfile, isLoading } = useAuth();
    const history = useStore((state) => state.history);
    const setPageOptions = useStore((state) => state.setPageOptions);
    const navigate = useNavigate();
    const [editingName, setEditingName] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [saving, setSaving] = useState(false);
    const [profileFeedback, setProfileFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
    const [exportCount, setExportCount] = useState<number | null>(null);
    const [avatarFailed, setAvatarFailed] = useState(false);
    const [defaults, setDefaults] = useState<AssignmentDefaults>({ name: '', studentId: '', subject: '' });
    const [defaultsFeedback, setDefaultsFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !user)) navigate('/auth?redirect=/account', { replace: true });
    }, [isLoading, isAuthenticated, user, navigate]);

    useEffect(() => {
        getAllExportedFiles().then((files) => setExportCount(files.length)).catch(() => setExportCount(null));
    }, []);

    useEffect(() => {
        if (!user) return;
        const fallback: AssignmentDefaults = { name: user.name || '', studentId: user.studentId || '', subject: '' };
        try {
            const saved = localStorage.getItem(ASSIGNMENT_DEFAULTS_KEY);
            if (!saved) { setDefaults(fallback); return; }
            const parsed = JSON.parse(saved) as Partial<AssignmentDefaults>;
            setDefaults({ name: parsed.name || fallback.name, studentId: parsed.studentId || fallback.studentId, subject: parsed.subject || '' });
        } catch {
            setDefaults(fallback);
        }
    }, [user]);

    if (isLoading) {
        return <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#fbfaf8]"><SiteLogo size={44} className="animate-pulse" /><p className="text-sm font-semibold text-stone-500">Loading your account…</p></div>;
    }
    if (!isAuthenticated || !user) return null;

    const initial = (user.given_name || user.name || '?')[0]?.toUpperCase();
    const provider = { google: 'Google', github: 'GitHub', student: 'Student ID', email: 'Email' }[user.authProvider] || 'Email';
    const saveName = async () => {
        const name = editName.trim();
        if (!name) { setProfileFeedback({ kind: 'error', message: 'Name cannot be empty.' }); return; }
        setSaving(true);
        setProfileFeedback(null);
        try {
            await updateUserProfile({ name, given_name: name.split(' ')[0] });
            setProfileFeedback({ kind: 'success', message: 'Name updated.' });
            setEditingName(false);
        } catch {
            setProfileFeedback({ kind: 'error', message: 'Could not update your name. Please try again.' });
        } finally { setSaving(false); }
    };

    const saveAssignmentDefaults = () => {
        try {
            localStorage.setItem(ASSIGNMENT_DEFAULTS_KEY, JSON.stringify(defaults));
            setPageOptions({ headerText: formatAssignmentHeader(defaults) });
            setDefaultsFeedback({ kind: 'success', message: 'Saved on this device and applied to the current studio session.' });
        } catch {
            setDefaultsFeedback({ kind: 'error', message: 'Could not save defaults. Check browser storage and try again.' });
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_13%_2%,rgb(237_233_254_/_0.72),transparent_29%),radial-gradient(circle_at_88%_20%,rgb(219_234_254_/_0.6),transparent_26%),#f8f7f4] text-stone-900">
            <header className="sticky top-0 z-20 border-b border-white/70 bg-white/65 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
                    <button type="button" onClick={() => navigate('/')} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-stone-600 transition hover:bg-white hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-violet-700"><ArrowLeft size={16} /> <span className="hidden sm:inline">Home</span></button>
                    <div className="flex items-center gap-2 font-black tracking-tight"><SiteLogo size={24} /><span>Account</span></div>
                    <button type="button" onClick={() => navigate('/editor')} className="inline-flex min-h-11 items-center rounded-xl bg-stone-950 px-3.5 text-sm font-bold text-white shadow-lg shadow-stone-900/15 transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">Open studio</button>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
                <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2rem] bg-[#15131b] px-6 py-7 text-white shadow-[0_28px_70px_-35px_rgba(39,26,75,.75)] sm:px-9 sm:py-10">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_8%,rgba(167,139,250,.32),transparent_27%),radial-gradient(circle_at_10%_110%,rgba(45,212,191,.14),transparent_30%)]" />
                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-2xl font-black shadow-xl backdrop-blur-xl">
                                {user.picture && !avatarFailed ? <img src={user.picture} alt="" className="h-full w-full object-cover" onError={() => setAvatarFailed(true)} /> : initial}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-200">Your workspace</p>
                                {editingName ? <div className="mt-1 flex items-center gap-2"><input value={editName} onChange={(event) => { setEditName(event.target.value); setProfileFeedback(null); }} onKeyDown={(event) => { if (event.key === 'Enter') void saveName(); if (event.key === 'Escape') setEditingName(false); }} aria-label="Your name" autoFocus className="min-w-0 rounded-lg border border-violet-300 bg-white/10 px-2 py-1 text-xl font-black text-white outline-none ring-0 placeholder:text-white/50 focus:border-white" /><button type="button" aria-label="Save name" onClick={() => void saveName()} disabled={saving} className="rounded-lg bg-white p-2 text-emerald-700 disabled:opacity-50">{saving ? <Loader2 size={17} className="animate-spin" /> : <Check size={17} />}</button><button type="button" aria-label="Cancel name edit" onClick={() => { setEditingName(false); setProfileFeedback(null); }} disabled={saving} className="rounded-lg p-2 text-white/70 hover:bg-white/10"><X size={17} /></button></div> : <div className="mt-1 flex items-center gap-2"><h1 className="truncate text-2xl font-black tracking-tight text-white sm:text-3xl">{user.name}</h1><button type="button" aria-label="Edit name" onClick={() => { setEditName(user.name); setProfileFeedback(null); setEditingName(true); }} className="rounded-lg p-1.5 text-white/55 transition hover:bg-white/10 hover:text-white"><Edit2 size={15} /></button></div>}
                                <p className="mt-1 truncate text-sm text-white/60">{user.email}</p>
                                {profileFeedback && <p role={profileFeedback.kind === 'error' ? 'alert' : 'status'} className={`mt-2 text-xs font-bold ${profileFeedback.kind === 'error' ? 'text-rose-200' : 'text-emerald-200'}`}>{profileFeedback.message}</p>}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-white/12 bg-white/[0.07] p-4 text-sm leading-relaxed text-white/68 backdrop-blur-xl sm:max-w-xs">Your drafts and exports stay on this device. Your account is used for sign-in and purchases.</div>
                    </div>
                </motion.section>

                <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={`${panelClass} p-5 sm:p-7`}>
                        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">Continue creating</p><h2 className="mt-1 text-2xl font-black tracking-tight text-stone-950">Your document workspace</h2><p className="mt-2 max-w-lg text-sm leading-relaxed text-stone-500">Pick up a local draft, prepare a new page, or review files saved in this browser.</p></div><button type="button" onClick={() => navigate('/editor')} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"><Sparkles size={15} /> New document</button></div>
                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            {[{ icon: FileText, value: history.length, label: 'Draft snapshots', tone: 'text-violet-700 bg-violet-50' }, { icon: HardDrive, value: exportCount === null ? '—' : exportCount, label: 'Saved exports', tone: 'text-sky-700 bg-sky-50' }, { icon: ShieldCheck, value: 'Local', label: 'Document storage', tone: 'text-emerald-700 bg-emerald-50' }].map(({ icon: Icon, value, label, tone }) => <div key={label} className="rounded-2xl border border-stone-200/80 bg-stone-50/75 p-4"><span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}><Icon size={17} /></span><p className="mt-5 text-2xl font-black tracking-tight text-stone-950">{value}</p><p className="mt-1 text-xs font-semibold text-stone-500">{label}</p></div>)}
                        </div>
                    </motion.div>

                    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`${panelClass} p-5 sm:p-7`}>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-400">Sign-in</p><h2 className="mt-1 text-xl font-black text-stone-950">Account details</h2>
                        <dl className="mt-5 space-y-4 text-sm"><div><dt className="text-xs font-bold text-stone-400">Email</dt><dd className="mt-1 break-all font-semibold text-stone-800">{user.email}</dd></div><div><dt className="text-xs font-bold text-stone-400">Provider</dt><dd className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-600"><ShieldCheck size={13} className="text-violet-600" /> {provider}</dd></div></dl>
                    </motion.section>
                </section>

                <section className="mt-6 grid gap-4 lg:grid-cols-2">
                    <details className={`${panelClass} group p-5 sm:p-7`}>
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-700"><BookOpen size={18} /></span><div><h2 className="font-black text-stone-950">Document defaults</h2><p className="mt-0.5 text-sm text-stone-500">Optional header details for your next document.</p></div></div><ChevronRight size={18} className="text-stone-400 transition group-open:rotate-90" /></summary>
                        <div className="mt-6 border-t border-stone-200/70 pt-5"><p className="mb-4 text-xs leading-relaxed text-stone-500">These values stay in this browser. Saving applies the formatted header to the current editor session.</p><div className="grid gap-3 sm:grid-cols-3"><label className="grid gap-1.5 text-xs font-bold text-stone-600">Name<input value={defaults.name} onChange={(event) => { setDefaults((current) => ({ ...current, name: event.target.value })); setDefaultsFeedback(null); }} placeholder="Your name" className="min-h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15" /></label><label className="grid gap-1.5 text-xs font-bold text-stone-600">SAP ID / Roll No.<input value={defaults.studentId} onChange={(event) => { setDefaults((current) => ({ ...current, studentId: event.target.value })); setDefaultsFeedback(null); }} placeholder="500123456" className="min-h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15" /></label><label className="grid gap-1.5 text-xs font-bold text-stone-600">Subject<input value={defaults.subject} onChange={(event) => { setDefaults((current) => ({ ...current, subject: event.target.value })); setDefaultsFeedback(null); }} placeholder="Subject" className="min-h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15" /></label></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p role={defaultsFeedback?.kind === 'error' ? 'alert' : 'status'} className={`text-xs font-semibold ${defaultsFeedback?.kind === 'error' ? 'text-rose-700' : 'text-emerald-700'}`}>{defaultsFeedback?.message}</p><button type="button" onClick={saveAssignmentDefaults} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-violet-300 bg-white px-4 text-sm font-bold text-violet-800 shadow-sm transition hover:bg-violet-50"><Save size={15} /> Save defaults</button></div></div>
                    </details>

                    <section className={`${panelClass} p-5 sm:p-7`}><p className="text-xs font-black uppercase tracking-[0.16em] text-stone-400">Help & privacy</p><h2 className="mt-1 text-xl font-black text-stone-950">Keep control of your work</h2><div className="mt-5 space-y-2">{[['Privacy policy', '/privacy'], ['Terms of service', '/terms'], ['Support', '/support']].map(([label, href]) => <button type="button" key={href} onClick={() => navigate(href)} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-stone-700 transition hover:bg-stone-50"><Mail size={16} className="text-stone-400" />{label}<ChevronRight size={17} className="ml-auto text-stone-300" /></button>)}</div></section>
                </section>

                <button type="button" onClick={async () => { await logout(); navigate('/', { replace: true }); }} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-600"><LogOut size={17} /> Sign out</button>
            </main>
        </div>
    );
}
