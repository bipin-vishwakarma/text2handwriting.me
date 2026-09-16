import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, ArrowLeft, BookOpen, FlaskConical, FileText,
    Notebook, Check, Sparkles, PenTool
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../lib/store';
import SiteLogo from '../components/common/SiteLogo';

const TOTAL_STEPS = 4;

interface Slide {
    id: number;
    title: string;
    subtitle: string;
    content: React.ReactNode;
}

const USE_CASES = [
    { id: 'notes', icon: BookOpen, label: 'Class Notes', desc: 'Lectures, summaries, mindmaps' },
    { id: 'lab', icon: FlaskConical, label: 'Lab Practicals', desc: 'Lab notebooks with diagram pages' },
    { id: 'assignments', icon: FileText, label: 'Assignments', desc: 'Homework & university submissions' },
    { id: 'journal', icon: Notebook, label: 'Personal Journal', desc: 'Diary, planning, creative writing' },
];

const PAPER_OPTIONS = [
    { id: 'ruled', label: 'Ruled', emoji: '📄', desc: 'Classic school ruled lines' },
    { id: 'college', label: 'College Ruled', emoji: '📓', desc: 'Narrow lines for neat writing' },
    { id: 'graph', label: 'Graph Paper', emoji: '📐', desc: 'For math & diagrams' },
    { id: 'dotted', label: 'Dotted', emoji: '🔵', desc: 'Minimal dots for free-form' },
];

export default function OnboardingPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const setPaperMaterial = useStore(s => s.setPaperMaterial);

    const [step, setStep] = useState(0);
    const [useCases, setUseCases] = useState<string[]>([]);
    const [paperPick, setPaperPick] = useState<string>('ruled');
    const [direction, setDirection] = useState(1); // +1 = forward, -1 = back

    const goNext = useCallback(() => {
        setDirection(1);
        setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
    }, []);

    const goBack = useCallback(() => {
        setDirection(-1);
        setStep(s => Math.max(s - 1, 0));
    }, []);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/auth?redirect=/onboarding', { replace: true });
        }
    }, [isLoading, isAuthenticated, navigate]);

    useEffect(() => {
        // Keyboard navigation — declared after goNext/goBack to avoid TDZ
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' && step < TOTAL_STEPS - 1) goNext();
            if (e.key === 'ArrowLeft' && step > 0) goBack();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [step, goNext, goBack]);

    const finish = () => {
        // Apply the paper preference
        if (paperPick === 'ruled') setPaperMaterial('ruled');
        else if (paperPick === 'college') setPaperMaterial('college');
        else if (paperPick === 'graph') setPaperMaterial('graph');
        else if (paperPick === 'dotted') setPaperMaterial('dotted');

        localStorage.setItem('text2handwriting_onboarding_done', 'true');
        navigate('/editor', { replace: true });
    };

    const skip = () => {
        localStorage.setItem('text2handwriting_onboarding_done', 'true');
        navigate('/editor', { replace: true });
    };

    const toggleUseCase = (id: string) => {
        setUseCases(prev =>
            prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
        );
    };

    const slides: Slide[] = [
        {
            id: 0,
            title: `Welcome, ${user?.given_name || 'Scholar'} 👋`,
            subtitle: 'text2handwriting.me turns your typed text into beautiful, realistic handwritten PDFs — in seconds.',
            content: (
                <div className="flex flex-col items-center gap-6 py-4">
                    <div className="w-24 h-24 bg-violet-100 rounded-3xl flex items-center justify-center shadow-lg">
                        <SiteLogo size={56} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                        {[
                            { emoji: '✍️', label: 'Type text' },
                            { emoji: '🪄', label: 'AI transforms' },
                            { emoji: '📄', label: 'Export PDF' },
                        ].map(item => (
                            <div key={item.label} className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
                                <span className="text-3xl">{item.emoji}</span>
                                <span className="text-xs font-semibold text-neutral-600">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
        {
            id: 1,
            title: 'What will you use text2handwriting.me for?',
            subtitle: 'Pick all that apply — we\'ll personalize your experience.',
            content: (
                <div className="grid grid-cols-2 gap-3 w-full">
                    {USE_CASES.map(({ id, icon: Icon, label, desc }) => {
                        const active = useCases.includes(id);
                        return (
                            <button
                                key={id}
                                onClick={() => toggleUseCase(id)}
                                className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 transition-all text-left ${
                                    active
                                        ? 'border-violet-500 bg-violet-50 shadow-md'
                                        : 'border-neutral-200 bg-white hover:border-violet-300 hover:bg-violet-50/50'
                                }`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? 'bg-violet-500' : 'bg-neutral-100'}`}>
                                    <Icon size={18} className={active ? 'text-white' : 'text-neutral-500'} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-neutral-800">{label}</p>
                                    <p className="text-xs text-neutral-500">{desc}</p>
                                </div>
                                {active && (
                                    <div className="absolute top-3 right-3 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                                        <Check size={12} className="text-white" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            ),
        },
        {
            id: 2,
            title: 'Pick your default paper',
            subtitle: 'You can always change this later from the sidebar.',
            content: (
                <div className="grid grid-cols-2 gap-3 w-full">
                    {PAPER_OPTIONS.map(({ id, label, emoji, desc }) => (
                        <button
                            key={id}
                            onClick={() => setPaperPick(id)}
                            className={`flex flex-col items-start gap-1.5 p-4 rounded-2xl border-2 text-left transition-all ${
                                paperPick === id
                                    ? 'border-violet-500 bg-violet-50 shadow-md'
                                    : 'border-neutral-200 bg-white hover:border-violet-300'
                            }`}
                        >
                            <span className="text-2xl">{emoji}</span>
                            <p className="font-bold text-sm text-neutral-800">{label}</p>
                            <p className="text-xs text-neutral-500">{desc}</p>
                            {paperPick === id && (
                                <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center mt-1">
                                    <Check size={12} className="text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            ),
        },
        {
            id: 3,
            title: "You're all set! 🎉",
            subtitle: 'Your text2handwriting.me workspace is ready. Start writing your first page.',
            content: (
                <div className="flex flex-col items-center gap-6 py-2">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Sparkles size={36} className="text-emerald-500" />
                    </div>
                    <div className="w-full space-y-3">
                        {[
                            { icon: PenTool, text: 'Choose a handwriting font & size' },
                            { icon: BookOpen, text: 'Paste or type your notes in the editor' },
                            { icon: FlaskConical, text: 'Enable Lab Notebook mode for practicals' },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-neutral-100 shadow-sm">
                                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Icon size={16} className="text-violet-600" />
                                </div>
                                <p className="text-sm font-medium text-neutral-700">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 gap-4">
                <SiteLogo size={44} className="animate-pulse" />
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                    <div className="w-2 h-2 rounded-full bg-violet-600 animate-ping" />
                    <span>Preparing your student workspace...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const currentSlide = slides[step] || slides[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex flex-col">
            {/* Top progress bar */}
            <div className="w-full h-1 bg-neutral-200">
                <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                    transition={{ duration: 0.4 }}
                />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                    <SiteLogo size={28} />
                    <span className="font-black text-neutral-900">text2handwriting.me</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-400">{step + 1} of {TOTAL_STEPS}</span>
                    <button onClick={skip} className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">
                        Skip
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            initial={{ opacity: 0, x: direction * 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: direction * -40 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h1 className="text-2xl font-black text-neutral-900 mb-2">{currentSlide.title}</h1>
                            <p className="text-neutral-500 mb-6">{currentSlide.subtitle}</p>
                            <div className="relative">{currentSlide.content}</div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom navigation */}
            <div className="p-6 flex items-center justify-between max-w-md mx-auto w-full">
                <button
                    onClick={goBack}
                    disabled={step === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-neutral-200 font-semibold text-neutral-600 hover:border-neutral-300 disabled:opacity-30 transition-all"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Step dots */}
                <div className="flex items-center gap-1.5">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
                            className={`rounded-full transition-all ${i === step ? 'w-6 h-2.5 bg-violet-500' : 'w-2.5 h-2.5 bg-neutral-300 hover:bg-neutral-400'}`}
                        />
                    ))}
                </div>

                {step < TOTAL_STEPS - 1 ? (
                    <button
                        onClick={goNext}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors"
                    >
                        Next <ArrowRight size={16} />
                    </button>
                ) : (
                    <button
                        onClick={finish}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors"
                    >
                        Open Editor <ArrowRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}
