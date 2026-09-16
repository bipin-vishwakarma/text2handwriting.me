import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, ArrowRight, Eye, EyeOff, Loader2, 
    BookOpen, PenTool, Sparkles, CheckCircle2, AlertCircle, KeyRound, Home, Github, ShieldCheck, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SiteLogo from '../components/common/SiteLogo';

type AuthStep = 'choose' | 'email-password';

const providerCard =
    'flex items-center justify-center gap-3 w-full px-5 py-3.5 rounded-xl border border-neutral-200/80 bg-white hover:bg-neutral-50/80 transition-all cursor-pointer font-semibold text-neutral-700 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed';

const features = [
    { icon: PenTool, text: 'Natural handwriting styling in seconds', desc: 'Adjust paper, ink, spacing, and organic variation.' },
    { icon: BookOpen, text: '15+ authentic student paper types', desc: 'Lab notebooks, ruled pages, and assignment sheets.' },
    { icon: Sparkles, text: 'Design and preview before paying', desc: 'Exports use simple pay-per-document pricing.' },
];

export default function AuthPage() {
    const { 
        isAuthenticated, 
        loginWithGoogle, 
        loginWithGithub, 
        loginWithPassword,
        signUpWithPassword,
        isLoading 
    } = useAuth();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/onboarding';

    const [step, setStep] = useState<AuthStep>('choose');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successNotice, setSuccessNotice] = useState<string | null>(null);

    // Email Forms State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [fullName, setFullName] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // If already logged in, navigate immediately
    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirect, { replace: true });
        }
    }, [isAuthenticated, navigate, redirect]);

    const isNewUser = () => !localStorage.getItem('text2handwriting_onboarding_done');

    const afterAuth = () => {
        const dest = isNewUser() ? '/onboarding' : (searchParams.get('redirect') || '/editor');
        navigate(dest, { replace: true });
    };

    const handleGoogle = async () => {
        setErrorMessage(null);
        const dest = `${window.location.origin}${isNewUser() ? '/onboarding' : (searchParams.get('redirect') || '/editor')}`;
        const res = await loginWithGoogle(dest);
        if (res.redirected) return;
        if (!res.success) {
            setErrorMessage(res.error || 'Google sign-in encountered an issue.');
        } else {
            afterAuth();
        }
    };

    const handleGithub = async () => {
        setErrorMessage(null);
        const dest = `${window.location.origin}${isNewUser() ? '/onboarding' : (searchParams.get('redirect') || '/editor')}`;
        const res = await loginWithGithub(dest);
        if (res.redirected) return;
        if (!res.success) {
            setErrorMessage(res.error || 'GitHub sign-in encountered an issue.');
        } else {
            afterAuth();
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessNotice(null);
        const errs: Record<string, string> = {};
        if (!email.trim() || !email.includes('@')) errs.email = 'Enter a valid email address';
        if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters';
        if (isSignUp && !fullName.trim()) errs.fullName = 'Full name is required';
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});

        if (isSignUp) {
            const res = await signUpWithPassword(email, password, { name: fullName });
            if (res.success) {
                if (res.needsEmailConfirmation) {
                    setSuccessNotice(`Confirmation email sent to ${email}. Check your inbox to verify your account.`);
                } else {
                    afterAuth();
                }
            } else {
                setErrorMessage(res.error || 'Failed to create account. Please try again.');
            }
        } else {
            const res = await loginWithPassword(email, password);
            if (res.success) {
                afterAuth();
            } else {
                setErrorMessage(res.error || 'Invalid email or password.');
            }
        }
    };

    const hasIncomingCode = typeof window !== 'undefined' && (
        new URLSearchParams(window.location.search).has('code') ||
        window.location.hash.includes('access_token')
    );

    if (isLoading && hasIncomingCode) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 gap-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-violet-500 blur-xl opacity-20 animate-pulse rounded-full" />
                    <SiteLogo size={56} className="relative z-10 animate-pulse" />
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-white shadow-sm border border-neutral-100 rounded-full text-sm font-semibold text-neutral-600">
                    <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
                    <span>Securely signing you in...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] overflow-hidden flex bg-white font-sans selection:bg-violet-200 selection:text-violet-900">
            {/* Left Panel: The Canvas */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex flex-col justify-between w-[48%] relative overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-[#0A0118]"
            >
                {/* Mesh Gradient Background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/30 blur-[100px] mix-blend-screen" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-fuchsia-600/20 blur-[120px] mix-blend-screen" />
                    <div className="absolute top-[40%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[100px] mix-blend-screen" />
                </div>

                {/* Top Section */}
                <div className="relative z-10 p-8 lg:p-12">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10">
                            <SiteLogo size={32} className="text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">text2handwriting.me</span>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
                        <Sparkles size={14} className="text-violet-300" />
                        <span className="text-xs font-semibold text-violet-200 tracking-wide uppercase">Beta Access</span>
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-[1.1] mb-5">
                        Your authentic <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 italic font-medium">handwriting</span> <br />
                        digitized.
                    </h2>
                    
                    <p className="text-white/60 text-lg leading-relaxed max-w-md font-light">
                        The most realistic text-to-handwriting engine. Trusted by students worldwide for assignments and lab records.
                    </p>
                </div>

                {/* Bottom Section - Glassmorphism Features */}
                <div className="relative z-10 p-8 lg:p-12 pt-0">
                    <div className="flex flex-col gap-4">
                        {features.map(({ icon: Icon, text, desc }, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                                key={text} 
                                className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center flex-shrink-0 border border-violet-500/20">
                                    <Icon size={20} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium text-[15px] mb-0.5">{text}</h3>
                                    <p className="text-white/50 text-sm">{desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Right Panel: The Form */}
            <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-white">
                
                {/* Mobile Background Bloom */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-100/50 rounded-full blur-[100px] pointer-events-none lg:hidden -z-10" />

                {/* Header */}
                <div className="p-6 lg:p-8 flex justify-between items-center relative z-20">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
                            <Home size={14} />
                        </div>
                        <span>Back</span>
                    </Link>
                </div>

                {/* Main Form Area */}
                <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="w-full max-w-[400px] relative z-10 lg:-mt-12"
                    >
                        {/* Mobile logo */}
                        <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
                            <div className="bg-violet-600 p-2.5 rounded-xl shadow-lg shadow-violet-600/20">
                                <SiteLogo size={28} className="text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-neutral-900">text2handwriting.me</span>
                        </div>

                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3"
                            >
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <p className="leading-relaxed font-medium">{errorMessage}</p>
                            </motion.div>
                        )}

                        {successNotice && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-start gap-3"
                            >
                                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                                <p className="leading-relaxed font-medium">{successNotice}</p>
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {step === 'choose' && (
                                <motion.div
                                    key="choose"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <h1 className="text-[32px] font-semibold tracking-tight text-neutral-900 mb-2">Welcome</h1>
                                    <p className="text-neutral-500 mb-8 text-[15px]">Log in or create an account to save your work.</p>

                                    <div className="space-y-3.5">
                                        <button 
                                            type="button" 
                                            className={providerCard}
                                            onClick={handleGoogle} 
                                            disabled={isLoading}
                                        >
                                            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            <span className="text-[15px]">Continue with Google</span>
                                        </button>

                                        <button 
                                            type="button" 
                                            className={providerCard} 
                                            onClick={handleGithub} 
                                            disabled={isLoading}
                                        >
                                            <Github className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-[15px]">Continue with GitHub</span>
                                        </button>
                                        
                                        <div className="flex items-center gap-3 py-3">
                                            <div className="h-[1px] bg-neutral-200 flex-1"></div>
                                            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Or</span>
                                            <div className="h-[1px] bg-neutral-200 flex-1"></div>
                                        </div>

                                        <button 
                                            type="button" 
                                            className={providerCard} 
                                            onClick={() => setStep('email-password')} 
                                            disabled={isLoading}
                                        >
                                            <Mail size={18} className="text-neutral-500 flex-shrink-0" />
                                            <span className="text-[15px]">Continue with Email</span>
                                        </button>
                                    </div>

                                    <div className="mt-10 flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium bg-neutral-50 py-3 rounded-xl border border-neutral-100">
                                        <ShieldCheck size={16} className="text-emerald-500" />
                                        <span>Secure 256-bit encryption</span>
                                    </div>

                                    <p className="text-center text-[13px] text-neutral-400 mt-8 font-medium">
                                        By continuing, you agree to our{' '}
                                        <Link to="/terms" className="text-neutral-600 hover:text-violet-600 underline underline-offset-2">Terms</Link> and{' '}
                                        <Link to="/privacy" className="text-neutral-600 hover:text-violet-600 underline underline-offset-2">Privacy Policy</Link>.
                                    </p>
                                </motion.div>
                            )}

                            {step === 'email-password' && (
                                <motion.div
                                    key="email-password"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <button 
                                        type="button" 
                                        onClick={() => setStep('choose')} 
                                        className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 mb-6 transition-colors"
                                    >
                                        <ArrowRight size={16} className="rotate-180" />
                                        Back
                                    </button>
                                    <h1 className="text-[32px] font-semibold tracking-tight text-neutral-900 mb-2">
                                        {isSignUp ? 'Create account' : 'Welcome back'}
                                    </h1>
                                    <p className="text-neutral-500 mb-8 text-[15px]">
                                        {isSignUp ? 'Enter your details below to create your account.' : 'Enter your email and password to log in.'}
                                    </p>

                                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                        {isSignUp && (
                                            <div>
                                                <label className="text-[13px] font-medium text-neutral-700 mb-1.5 block">Full Name</label>
                                                <div className="relative">
                                                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="John Doe"
                                                        value={fullName}
                                                        onChange={e => setFullName(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none text-neutral-900 bg-white transition-all text-[15px]"
                                                    />
                                                </div>
                                                {errors.fullName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.fullName}</p>}
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-[13px] font-medium text-neutral-700 mb-1.5 block">Email Address</label>
                                            <div className="relative">
                                                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                <input
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none text-neutral-900 bg-white transition-all text-[15px]"
                                                    autoFocus
                                                />
                                            </div>
                                            {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
                                        </div>

                                        <div>
                                            <label className="text-[13px] font-medium text-neutral-700 mb-1.5 flex justify-between items-center">
                                                <span>Password</span>
                                                {!isSignUp && <button type="button" className="text-violet-600 hover:underline cursor-pointer" onClick={() => alert('Password reset will be available soon.')}>Forgot?</button>}
                                            </label>
                                            <div className="relative">
                                                <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-neutral-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none text-neutral-900 bg-white transition-all text-[15px]"
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowPassword(!showPassword)} 
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-60 shadow-lg shadow-violet-600/20 active:scale-[0.98] cursor-pointer"
                                        >
                                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                                                <>
                                                    <span>{isSignUp ? 'Create account' : 'Sign in'}</span>
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    <div className="mt-8 text-center text-[14px] text-neutral-500 font-medium">
                                        {isSignUp ? (
                                            <p>
                                                Already have an account?{' '}
                                                <button 
                                                    type="button" 
                                                    onClick={() => setIsSignUp(false)} 
                                                    className="text-violet-600 hover:text-violet-700 font-semibold hover:underline cursor-pointer"
                                                >
                                                    Sign in
                                                </button>
                                            </p>
                                        ) : (
                                            <p>
                                                Don't have an account?{' '}
                                                <button 
                                                    type="button" 
                                                    onClick={() => setIsSignUp(true)} 
                                                    className="text-violet-600 hover:text-violet-700 font-semibold hover:underline cursor-pointer"
                                                >
                                                    Sign up
                                                </button>
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}





