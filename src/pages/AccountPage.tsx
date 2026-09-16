import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, LogOut, FileText, Shield, Star, ChevronRight,
    Edit2, Check, X, GraduationCap, Mail, Loader2, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Text2HandwritingLogo from '../components/common/Text2HandwritingLogo';

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
    google: (
        <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    ),
    github: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-stone-800">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
    ),
    student: <GraduationCap size={16} className="text-violet-600" />,
    email: <Mail size={16} className="text-indigo-500" />,
};

export default function AccountPage() {
    const { user, isAuthenticated, logout, updateUserProfile, isLoading } = useAuth();
    const navigate = useNavigate();

    const [editingName, setEditingName] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !user)) {
            navigate('/auth?redirect=/account', { replace: true });
        }
    }, [isLoading, isAuthenticated, user, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] selection:bg-violet-200 selection:text-violet-900 gap-4">
                <Text2HandwritingLogo size={44} className="animate-pulse" />
                <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
                    <div className="w-2 h-2 rounded-full bg-violet-600 animate-ping" />
                    <span>Loading student account...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    const initial = user.given_name?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || '?';
    const providerLabel: Record<string, string> = {
        google: 'Google', github: 'GitHub', student: 'Student ID', email: 'Email'
    };

    const handleSaveName = async () => {
        setSaving(true);
        await updateUserProfile({ name: editName, given_name: editName.split(' ')[0] });
        setSaving(false);
        setEditingName(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const statCards = [
        { label: 'Documents Created', value: user.savedDocsCount ?? 0, icon: FileText, color: 'violet' },
        { label: 'Account Type', value: 'Free', icon: Star, color: 'amber' },
        { label: 'Cloud Backup', value: user.cloudBackupEnabled ? 'Active' : 'Off', icon: Shield, color: 'emerald' },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#FAF8F5] text-stone-900 selection:bg-violet-200 selection:text-violet-900"><div className="pointer-events-none -z-10 absolute inset-0 overflow-hidden"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" /></div>
            {/* Navbar-like header */}
            <div className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-stone-500 hover:text-violet-600 transition-colors">
                        ← Back
                    </button>
                    <span className="font-black text-stone-900">My Account</span>
                    <button
                        onClick={() => navigate('/editor')}
                        className="text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                    >
                        Open Editor →
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

                {/* Profile card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6"
                >
                    <div className="flex items-start gap-5">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0 shadow-lg">
                            {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                            {/* Name edit */}
                            {editingName ? (
                                <div className="flex items-center gap-2 mb-1">
                                    <input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="text-xl font-black text-stone-900 border-b-2 border-violet-400 focus:outline-none bg-transparent flex-1"
                                        autoFocus
                                    />
                                    <button onClick={handleSaveName} disabled={saving} className="text-emerald-500 hover:text-emerald-600">
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                    </button>
                                    <button onClick={() => setEditingName(false)} className="text-stone-400 hover:text-stone-600">
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-black text-stone-900 truncate">{user.name}</h2>
                                    <button onClick={() => { setEditName(user.name); setEditingName(true); }} className="text-stone-400 hover:text-violet-500 transition-colors">
                                        <Edit2 size={15} />
                                    </button>
                                </div>
                            )}
                            <p className="text-stone-500 text-sm truncate">{user.email}</p>

                            {/* Provider badge */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-xs font-semibold text-stone-600">
                                    {PROVIDER_ICONS[user.authProvider]}
                                    {providerLabel[user.authProvider] || user.authProvider}
                                </div>
                                {user.studentId && (
                                    <div className="px-2.5 py-1 rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                                        {user.studentId}
                                    </div>
                                )}
                                {user.collegeName && (
                                    <div className="px-2.5 py-1 rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 truncate max-w-[140px]">
                                        {user.collegeName}
                                    </div>
                                )}
                                <div className="px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Supabase Cloud Auth</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="grid grid-cols-3 gap-4"
                >
                    {statCards.map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 text-center">
                            <div className={`w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center bg-${color}-100`}>
                                <Icon size={18} className={`text-${color}-500`} />
                            </div>
                            <p className="text-xl font-black text-stone-900">{value}</p>
                            <p className="text-xs text-stone-500 mt-0.5">{label}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Product access and transparent export pricing */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                    className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden shadow-xl"
                >
                    <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-[-30px] left-[-30px] w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-yellow-950 text-xs font-black tracking-wide shadow-sm animate-pulse">
                                <Sparkles size={13} className="text-yellow-900" />
                                <span>FREE WORKSPACE PREVIEW</span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white/90 text-xs font-semibold backdrop-blur-xs">
                                No subscription
                            </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black mb-2 text-white">
                            Design freely. Pay only when you export.
                        </h3>
                        <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-5 max-w-xl">
                            Create and preview your document with the full studio before checkout. When it is ready, export pricing is calculated clearly as <b>₹10 per document plus ₹2 per generated page</b>.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                            {[
                                'Full-resolution PDF and image exports',
                                'Interactive Lab Notebook & Diagram Canvas',
                                'A curated library of handwriting styles',
                                '3D Metallic Twin-Wire Coil Bindings',
                                'Smart Margin Indexing & Comparison Columns',
                                'Exact total shown before secure checkout'
                            ].map(f => (
                                <div key={f} className="flex items-center gap-2 text-xs sm:text-sm text-white/95">
                                    <div className="w-4 h-4 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0">
                                        <Check size={11} className="text-emerald-300 font-bold" />
                                    </div>
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-white/15">
                            <div className="flex-1">
                                <p className="text-xs text-white/70">
                                    Account status: <span className="text-emerald-300 font-bold">Studio access active</span>
                                </p>
                                <p className="text-[11px] text-white/50">
                                    Editing and previewing are free. You only pay when you choose to download an export.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate('/editor')}
                                className="px-5 py-3 bg-white text-violet-900 hover:bg-violet-50 rounded-xl font-bold text-sm shadow-md hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Sparkles size={16} className="text-violet-700" />
                                <span>Open the Studio</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Quick links */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="bg-white rounded-3xl shadow-sm border border-stone-100 divide-y divide-stone-100 overflow-hidden"
                >
                    {[
                        { label: 'Privacy Policy', href: '/privacy', icon: Shield },
                        { label: 'Terms of Service', href: '/terms', icon: FileText },
                        { label: 'FAQ & Support', href: '/faq', icon: User },
                    ].map(({ label, href, icon: Icon }) => (
                        <button
                            key={label}
                            onClick={() => navigate(href)}
                            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-stone-50 transition-colors text-left"
                        >
                            <Icon size={18} className="text-stone-400" />
                            <span className="font-medium text-stone-700">{label}</span>
                            <ChevronRight size={16} className="ml-auto text-stone-300" />
                        </button>
                    ))}
                </motion.div>

                {/* Sign out */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                >
                    <button
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-red-200 text-red-500 font-bold hover:bg-red-50 hover:border-red-400 transition-all"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                    <p className="text-center text-xs text-stone-400 mt-3">
                        Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

