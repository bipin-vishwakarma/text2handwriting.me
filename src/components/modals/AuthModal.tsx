import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, CheckCircle2, GraduationCap, Github, Mail, Sparkles, 
    Loader2, School, ShieldCheck, AlertCircle, Lock, User, KeyRound, Eye, EyeOff, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useScrollLock } from '../../hooks/useScrollLock';
import SiteLogo from '../common/SiteLogo';

export default function AuthModal() {
    const { 
        isAuthModalOpen, 
        setAuthModalOpen, 
        isSupabaseConfigured,
        loginWithGoogle, 
        loginWithGithub, 
        loginWithStudentId, 
        loginWithEmail,
        loginWithPassword,
        signUpWithPassword,
        isLoading 
    } = useAuth();

    const [authTab, setAuthTab] = useState<'oauth' | 'student' | 'email'>('oauth');
    const [emailSubTab, setEmailSubTab] = useState<'magic' | 'password'>('magic');
    const [isSignUp, setIsSignUp] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // Student Form State
    const [studentName, setStudentName] = useState('Aarav Sharma');
    const [studentId, setStudentId] = useState('STU-50012489');
    const [collegeName, setCollegeName] = useState('');

    // Email Form State
    const [emailInput, setEmailInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [emailName, setEmailName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useScrollLock(isAuthModalOpen);

    const handleGoogleAuth = async () => {
        setErrorMessage(null);
        const res = await loginWithGoogle();
        if (res.redirected) return;
        if (!res.success) {
            setErrorMessage(res.error || 'Google sign-in could not be completed.');
        }
    };

    const handleGithubAuth = async () => {
        setErrorMessage(null);
        const res = await loginWithGithub();
        if (res.redirected) return;
        if (!res.success) {
            setErrorMessage(res.error || 'GitHub sign-in could not be completed.');
        }
    };

    const handleStudentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        if (!studentName.trim() || !studentId.trim()) return;
        loginWithStudentId(studentName, studentId, collegeName);
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);
        if (!emailInput.trim()) return;

        if (emailSubTab === 'magic') {
            const res = await loginWithEmail(emailInput);
            if (res.success) {
                setSuccessMessage(res.message || 'Magic link sent! Check your inbox.');
            } else {
                setErrorMessage(res.error || 'Failed to send magic link.');
            }
        } else {
            // Password flow
            if (!passwordInput || passwordInput.length < 6) {
                setErrorMessage('Password must be at least 6 characters.');
                return;
            }
            if (isSignUp) {
                const res = await signUpWithPassword(emailInput, passwordInput, {
                    name: emailName,
                });
                if (res.success) {
                    if (res.needsEmailConfirmation) {
                        setSuccessMessage('Check your inbox for a verification link from Text2Handwriting. Your account becomes active after you confirm it.');
                    }
                } else {
                    setErrorMessage(res.error || 'Could not create account.');
                }
            } else {
                const res = await loginWithPassword(emailInput, passwordInput);
                if (!res.success) {
                    setErrorMessage(res.error || 'Invalid email or password.');
                }
            }
        }
    };

    return (
        <AnimatePresence>
            {isAuthModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-neutral-950/65 backdrop-blur-md">
                    {/* Ambient Luminous Bloom */}
                    <div className="absolute w-96 h-96 bg-gradient-to-tr from-violet-600/30 via-indigo-500/20 to-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ type: "spring", damping: 26, stiffness: 320 }}
                        className="bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden isolate shadow-2xl max-w-md w-full relative flex flex-col border border-white/60 ring-1 ring-neutral-900/10"
                    >
                        {/* HEADER with text2handwriting.me Logo & Status */}
                        <div className="px-6 py-4.5 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-neutral-50/90 via-white to-neutral-50/90 shrink-0">
                            <div className="flex items-center gap-3">
                                <SiteLogo size={32} />
                                <div>
                                    <h2 className="text-sm font-extrabold text-neutral-900 leading-tight flex items-center gap-1.5">
                                        <span>Sign in to text2handwriting.me</span>
                                        <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">Beta</span>
                                    </h2>
                                    <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                                        <CheckCircle2 size={11} /> Free to design and preview
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex gap-1.5 mr-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]/80" />
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setAuthModalOpen(false)}
                                    className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-full transition-all cursor-pointer"
                                    aria-label="Close dialog"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* TAB SELECTOR */}
                        <div className="flex border-b border-neutral-100 bg-neutral-100/70 p-1.5 gap-1 text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => { setAuthTab('oauth'); setErrorMessage(null); }}
                                className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    authTab === 'oauth' ? 'bg-white text-neutral-900 shadow-xs ring-1 ring-black/5' : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/40'
                                }`}
                            >
                                <Sparkles size={13} className="text-indigo-500" />
                                <span>Fast OAuth</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setAuthTab('student'); setErrorMessage(null); }}
                                className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    authTab === 'student' ? 'bg-white text-neutral-900 shadow-xs ring-1 ring-black/5' : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/40'
                                }`}
                            >
                                <GraduationCap size={14} className="text-blue-600" />
                                <span>Student ID</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setAuthTab('email'); setErrorMessage(null); }}
                                className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    authTab === 'email' ? 'bg-white text-neutral-900 shadow-xs ring-1 ring-black/5' : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/40'
                                }`}
                            >
                                <Mail size={13} className="text-amber-500" />
                                <span>Email Pass</span>
                            </button>
                        </div>

                        {/* CONTENT AREA */}
                        <div className="p-6 bg-white relative">
                            {/* Error banner */}
                            {errorMessage && (
                                <div
                                    className={`mb-4 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 border shadow-xs ${
                                        errorMessage.toLowerCase().includes('provider is not enabled') ||
                                        errorMessage.toLowerCase().includes('unsupported provider') ||
                                        errorMessage.toLowerCase().includes('rebwoyqwxnoqmxvumzjf')
                                            ? 'bg-amber-50/90 border-amber-200/90 text-amber-950'
                                            : 'bg-rose-50 border-rose-200 text-rose-800'
                                    }`}
                                >
                                    <AlertCircle
                                        size={16}
                                        className={`shrink-0 mt-0.5 ${
                                            errorMessage.toLowerCase().includes('provider is not enabled') ||
                                            errorMessage.toLowerCase().includes('unsupported provider') ||
                                            errorMessage.toLowerCase().includes('rebwoyqwxnoqmxvumzjf')
                                                ? 'text-amber-600'
                                                : 'text-rose-600'
                                        }`}
                                    />
                                    <div className="flex-1 space-y-1.5">
                                        <p className="font-extrabold text-xs">
                                            {errorMessage.toLowerCase().includes('provider is not enabled') ||
                                            errorMessage.toLowerCase().includes('unsupported provider') ||
                                            errorMessage.toLowerCase().includes('rebwoyqwxnoqmxvumzjf')
                                                ? 'OAuth Provider Setup Required'
                                                : 'Authentication Notice'}
                                        </p>
                                        <p className="leading-relaxed text-[11px]">{errorMessage}</p>
                                        {(errorMessage.toLowerCase().includes('provider is not enabled') ||
                                            errorMessage.toLowerCase().includes('unsupported provider') ||
                                            errorMessage.toLowerCase().includes('rebwoyqwxnoqmxvumzjf')) && (
                                            <div className="pt-1 flex flex-wrap items-center gap-1.5">
                                                <a
                                                    href="https://supabase.com/dashboard/project/rebwoyqwxnoqmxvumzjf/auth/providers"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-[11px] shadow-xs"
                                                >
                                                    <span>Open Supabase Providers</span>
                                                    <ExternalLink size={11} />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setErrorMessage(null);
                                                        setAuthTab('student');
                                                    }}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100/60 text-amber-950 rounded-lg font-bold text-[11px] cursor-pointer"
                                                >
                                                    <GraduationCap size={12} className="text-amber-700" />
                                                    <span>Use Student ID</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Success banner */}
                            {successMessage && (
                                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                                    <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-600" />
                                    <span>{successMessage}</span>
                                </div>
                            )}

                            {authTab === 'oauth' && (
                                <div className="space-y-3.5">
                                    <div className="text-center mb-4">
                                        <div className="w-12 h-12 mx-auto mb-2 bg-linear-to-br from-indigo-50 to-blue-50 rounded-2xl flex items-center justify-center shadow-xs border border-indigo-100/60">
                                            <SiteLogo size={32} />
                                        </div>
                                        <h3 className="text-sm font-extrabold text-neutral-900">Sign in to text2handwriting.me</h3>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            Sync notebooks, realistic styles & lab diagrams across devices.
                                        </p>
                                    </div>

                                    {/* Google OAuth Button */}
                                    <button
                                        type="button"
                                        onClick={handleGoogleAuth}
                                        disabled={isLoading}
                                        className="w-full py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-2xs hover:shadow-xs active:scale-98 disabled:opacity-60 cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                                        </svg>
                                        <span>Continue with Google</span>
                                    </button>

                                    {/* GitHub OAuth Button */}
                                    <button
                                        type="button"
                                        onClick={handleGithubAuth}
                                        disabled={isLoading}
                                        className="w-full py-3 px-4 bg-neutral-900 hover:bg-black text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-md shadow-neutral-900/10 active:scale-98 disabled:opacity-60 cursor-pointer"
                                    >
                                        <Github size={16} />
                                        <span>Continue with GitHub</span>
                                    </button>

                                    {/* 1-Click Instant Demo Button */}
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={() => loginWithStudentId('Student Scholar', '500124890', 'University College')}
                                            disabled={isLoading}
                                            className="w-full py-2.5 px-3 bg-violet-50 hover:bg-violet-100/80 text-violet-800 border border-violet-200/80 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                                        >
                                            <School size={14} className="text-violet-600" />
                                            <span>⚡ Quick Student Demo Sign In</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {authTab === 'student' && (
                                <form onSubmit={handleStudentSubmit} className="space-y-3.5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            Student Full Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={studentName}
                                            onChange={(e) => setStudentName(e.target.value)}
                                            placeholder="e.g. Bipin Vishwakarma"
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            University / College Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={collegeName}
                                            onChange={(e) => setCollegeName(e.target.value)}
                                            placeholder="e.g. University / Institute of Technology"
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            Student Roll No. / Enrollment ID
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={studentId}
                                            onChange={(e) => setStudentId(e.target.value)}
                                            placeholder="e.g. 500124890 / Roll ID"
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full mt-2 py-3 bg-neutral-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-60 cursor-pointer"
                                    >
                                        {isLoading ? (
                                            <Loader2 size={15} className="animate-spin" />
                                        ) : (
                                            <>
                                                <GraduationCap size={15} />
                                                <span>Save & Activate Student ID</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {authTab === 'email' && (
                                <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                                    <div className="flex bg-neutral-100 p-1 rounded-xl gap-1 text-[11px] font-bold mb-3">
                                        <button
                                            type="button"
                                            onClick={() => setEmailSubTab('magic')}
                                            className={`flex-1 py-1.5 rounded-lg transition-all ${
                                                emailSubTab === 'magic' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
                                            }`}
                                        >
                                            Passwordless Link
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEmailSubTab('password')}
                                            className={`flex-1 py-1.5 rounded-lg transition-all ${
                                                emailSubTab === 'password' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
                                            }`}
                                        >
                                            Email & Password
                                        </button>
                                    </div>

                                    {emailSubTab === 'password' && isSignUp && (
                                        <div>
                                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                <input
                                                    type="text"
                                                    value={emailName}
                                                    onChange={(e) => setEmailName(e.target.value)}
                                                    placeholder="e.g. Aarav Sharma"
                                                    className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                            <input
                                                type="email"
                                                required
                                                value={emailInput}
                                                onChange={(e) => setEmailInput(e.target.value)}
                                                placeholder="name@student.edu"
                                                className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {emailSubTab === 'password' && (
                                        <div>
                                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    value={passwordInput}
                                                    onChange={(e) => setPasswordInput(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full pl-8 pr-9 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 focus:bg-white focus:border-neutral-900 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                                >
                                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full mt-2 py-3 bg-neutral-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-60 cursor-pointer"
                                    >
                                        {isLoading ? (
                                            <Loader2 size={15} className="animate-spin" />
                                        ) : emailSubTab === 'magic' ? (
                                            <>
                                                <Mail size={15} />
                                                <span>Send Magic Link</span>
                                            </>
                                        ) : isSignUp ? (
                                            <>
                                                <Lock size={15} />
                                                <span>Create Student Account</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock size={15} />
                                                <span>Sign In</span>
                                            </>
                                        )}
                                    </button>

                                    {emailSubTab === 'password' && (
                                        <div className="text-center pt-2 text-[11px] text-neutral-500">
                                            {isSignUp ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsSignUp(false)}
                                                    className="text-violet-600 font-bold hover:underline"
                                                >
                                                    Already have an account? Sign In
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsSignUp(true)}
                                                    className="text-violet-600 font-bold hover:underline"
                                                >
                                                    Don't have an account? Create one
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </form>
                            )}

                            {/* PRIVACY & ENCRYPTION BADGE */}
                            <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-1.5 text-emerald-600">
                                    <ShieldCheck size={13} />
                                    <span>{isSupabaseConfigured ? 'Supabase Auth' : 'Client Encrypted'}</span>
                                </div>
                                <span>Transparent pay-per-export pricing</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
