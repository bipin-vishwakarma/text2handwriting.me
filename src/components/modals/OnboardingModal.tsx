import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    ArrowRight, 
    ArrowLeft, 
    CheckCircle2, 
    Sparkles, 
    FlaskConical, 
    Camera, 
    FileText, 
    Download
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useScrollLock } from '../../hooks/useScrollLock';

const SLIDES = [
    {
        id: 'margins',
        title: 'Smart Margin Indexing',
        badge: 'Exam & Assignment Mode',
        icon: FileText,
        color: 'from-blue-500/10 to-indigo-500/10 text-blue-600',
        headline: 'Question numbers automatically pin to the red margin',
        description: 'Type "Q1.", "Ans:", "(a)", or "(i)" anywhere in your text. text2handwriting.me can place the question index in the left margin for a familiar notebook-style layout.',
        demo: (
            <div className="w-full bg-white rounded-xl border border-neutral-200/90 p-3 shadow-inner relative overflow-hidden text-left font-mono text-xs">
                <div className="absolute top-0 bottom-0 left-16 w-[1.5px] bg-rose-400/80" />
                <div className="space-y-2">
                    <div className="flex items-center">
                        <span className="w-14 text-center font-bold text-rose-600 text-[11px]">Q1.</span>
                        <span className="text-neutral-800 font-sans pl-3 text-xs">Define Newton's Second Law of Motion.</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-14 text-center font-bold text-rose-600 text-[11px]">Ans:</span>
                        <span className="text-neutral-700 font-sans pl-3 text-xs">The rate of change of momentum is proportional...</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-14 text-center font-bold text-rose-600 text-[11px]">(a)</span>
                        <span className="text-neutral-700 font-sans pl-3 text-xs">Derive the mathematical relation F = m × a.</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'lab-mode',
        title: 'Mixed Page & Lab Notebooks',
        badge: 'NEW Feature for Students',
        icon: FlaskConical,
        color: 'from-purple-500/10 to-pink-500/10 text-purple-600',
        headline: 'Blank left page for diagrams, ruled right page for theory',
        description: 'Engineering and science practical records require blank/plain facing sheets for circuit schematics, ray diagrams, or graphs, paired with ruled sheets for written observations. text2handwriting.me handles alternating pages and diagram uploads seamlessly!',
        demo: (
            <div className="w-full grid grid-cols-2 gap-2 text-left">
                {/* Left Page (Blank Diagram) */}
                <div className="bg-white rounded-lg border-2 border-dashed border-purple-300 p-2 text-center flex flex-col items-center justify-center min-h-[90px] shadow-xs">
                    <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center text-purple-600 mb-1">
                        <FlaskConical size={13} />
                    </div>
                    <span className="text-[10px] font-bold text-purple-900 leading-tight">Left Blank Sheet</span>
                    <span className="text-[9px] text-neutral-500">Insert Schematics / Graphs</span>
                </div>
                {/* Right Page (Ruled Theory) */}
                <div className="bg-white rounded-lg border border-neutral-300 p-2 shadow-xs space-y-1.5 overflow-hidden">
                    <div className="text-[9px] font-black text-rose-600 border-b border-rose-300 pb-0.5">AIM & PROCEDURE</div>
                    <div className="h-[1px] bg-neutral-200 w-full" />
                    <div className="h-[1px] bg-neutral-200 w-4/5" />
                    <div className="h-[1px] bg-neutral-200 w-full" />
                    <div className="h-[1px] bg-neutral-200 w-2/3" />
                </div>
            </div>
        )
    },
    {
        id: 'realism',
        title: 'Biological Fatigue & Shadows',
        badge: 'Natural Studio Lighting',
        icon: Camera,
        color: 'from-amber-500/10 to-orange-500/10 text-amber-600',
        headline: 'Camera-style shadows, desk lighting & optional variation',
        description: 'Use optional visual treatments such as line variation, strikethrough styling, desk-lamp warmth, and camera-style shadows to shape the page presentation. These controls create a styled digital preview rather than evidence of human authorship.',
        demo: (
            <div className="w-full bg-linear-to-r from-amber-50/70 to-orange-50/50 rounded-xl border border-amber-200/80 p-3 text-left space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-800">
                    <span>✍️ Organic Human Fatigue</span>
                    <span className="text-emerald-600 font-mono text-[10px]">Active</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-800">
                    <span>📱 Smartphone Cast Shadow</span>
                    <span className="text-emerald-600 font-mono text-[10px]">125° Warm</span>
                </div>
            </div>
        )
    },
    {
        id: 'importer',
        title: 'AI Cleaner & Multi-Format Import',
        badge: 'Clean ChatGPT Content',
        icon: Sparkles,
        color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600',
        headline: 'Strip AI preambles with 1 click or import Word & PDF files',
        description: 'Copied your homework from ChatGPT or Claude? Click "Clean AI" to instantly strip robot phrases like "Sure! Here is your assignment:". You can also drag-and-drop Word (.docx), PDF files, or run OCR on scanned notes.',
        demo: (
            <div className="w-full bg-white rounded-xl border border-neutral-200/90 p-2.5 text-left space-y-1.5 text-xs">
                <div className="text-[10px] text-rose-500 line-through bg-rose-50 px-1.5 py-0.5 rounded">
                    "Certainly! Below is the 5-page assignment on Data Structures:"
                </div>
                <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    <span>Auto-Cleaned & Ready for Handwriting Simulation</span>
                </div>
            </div>
        )
    },
    {
        id: 'export',
        title: 'Instant High-Res Multi-Page PDF',
        badge: 'Submission Ready',
        icon: Download,
        color: 'from-rose-500/10 to-red-500/10 text-rose-600',
        headline: 'Download sharp, printable PDFs with student date headers',
        description: 'Export clean multi-page documents as high-DPI PDFs or individual image ZIPs. Optional notebook-style headers can include a day tracker, date, and page number.',
        demo: (
            <div className="w-full bg-neutral-900 text-white rounded-xl p-3 text-left space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Download size={14} className="text-emerald-400" />
                        <span className="text-xs font-bold font-mono">assignment_lab_final.pdf</span>
                    </div>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                        Vector / High DPI
                    </span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-snug">
                    Print-ready, pixel-accurate rendering across all pages.
                </p>
            </div>
        )
    }
];

interface OnboardingModalProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function OnboardingModal({ isOpen: propIsOpen, onClose: propOnClose }: OnboardingModalProps = {}) {
    const storeIsOpen = useStore(state => state.isOnboardingOpen);
    const storeClose = useStore(state => state.closeOnboarding);
    const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
    const onClose = propOnClose || storeClose;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const completeOnboarding = useStore(state => state.completeOnboarding);
    const dialogRef = useRef<HTMLDivElement>(null);

    useScrollLock(isOpen);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            handleFinish(true);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleFinish = useCallback((markComplete = false) => {
        if (markComplete || dontShowAgain) {
            try {
                localStorage.setItem('text2handwriting_onboarding_dismissed', 'true');
            } catch {
                // Storage can be unavailable in privacy modes.
            }
            completeOnboarding();
        }
        onClose();
        setCurrentIndex(0);
    }, [completeOnboarding, dontShowAgain, onClose]);

    // Keyboard navigation: Left/Right arrows, Escape
    useEffect(() => {
        if (!isOpen) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('button')?.focus());

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                if (currentIndex < SLIDES.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    handleFinish(true);
                }
            } else if (e.key === 'ArrowLeft') {
                if (currentIndex > 0) {
                    setCurrentIndex(prev => prev - 1);
                }
            } else if (e.key === 'Escape') {
                handleFinish(false);
            } else if (e.key === 'Tab') {
                const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
                );
                if (!focusable?.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            previouslyFocused?.focus();
        };
    }, [isOpen, currentIndex, handleFinish]);

    const slide = SLIDES[currentIndex];
    const SlideIcon = slide.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-md"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            handleFinish(false);
                        }
                    }}
                >
                    <motion.div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="onboarding-title"
                        aria-describedby="onboarding-description"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.94, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 15 }}
                        transition={{ type: "spring", damping: 25, stiffness: 320 }}
                        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full max-h-[calc(100dvh-2rem)] relative flex flex-col border border-neutral-200"
                    >
                        {/* TOP HEADER */}
                        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-neutral-400">
                                    Step {currentIndex + 1} of {SLIDES.length}
                                </span>
                                <span className="text-neutral-300">•</span>
                                <span className="text-xs font-bold text-neutral-800">
                                    text2handwriting.me Student Tour
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleFinish(false)}
                                className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-full transition-colors cursor-pointer"
                                aria-label="Close tour"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* SLIDE CONTENT */}
                        <div className="p-5 sm:p-7 flex flex-col overflow-y-auto">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={slide.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.22 }}
                                    className="space-y-4 text-left"
                                >
                                    {/* Icon & Badge */}
                                    <div className="flex items-center justify-between">
                                        <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${slide.color} flex items-center justify-center shadow-xs`}>
                                            <SlideIcon size={24} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-full">
                                            {slide.badge}
                                        </span>
                                    </div>

                                    {/* Title & Headline */}
                                    <div>
                                        <h3 id="onboarding-title" className="text-xl font-display font-extrabold text-neutral-900 leading-tight">
                                            {slide.title}
                                        </h3>
                                        <p className="text-xs font-bold text-neutral-700 mt-1">
                                            {slide.headline}
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <p id="onboarding-description" className="text-xs text-neutral-600 leading-relaxed">
                                        {slide.description}
                                    </p>

                                    {/* Interactive Visual Demo Card */}
                                    <div className="pt-1">
                                        {slide.demo}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* PROGRESS DOTS */}
                            <div className="flex items-center justify-center gap-1.5 mt-6 pt-4 border-t border-neutral-100">
                                {SLIDES.map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`transition-all rounded-full cursor-pointer ${
                                            idx === currentIndex
                                                ? 'w-6 h-2 bg-neutral-900'
                                                : 'w-2 h-2 bg-neutral-200 hover:bg-neutral-300'
                                        }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>

                            {/* FOOTER ACTIONS */}
                            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                                {/* Don't show again toggle */}
                                <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] font-bold text-neutral-500 hover:text-neutral-800">
                                    <input
                                        type="checkbox"
                                        checked={dontShowAgain}
                                        onChange={(e) => setDontShowAgain(e.target.checked)}
                                        className="w-3.5 h-3.5 rounded border-neutral-300 accent-neutral-900 cursor-pointer"
                                    />
                                    <span>Don't show this on startup</span>
                                </label>

                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    {currentIndex > 0 ? (
                                        <button
                                            type="button"
                                            onClick={handlePrev}
                                            className="px-3.5 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                        >
                                            <ArrowLeft size={13} />
                                            <span>Back</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-3.5 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-all cursor-pointer"
                                        >
                                            Skip Tour
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="px-5 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer"
                                    >
                                        <span>{currentIndex === SLIDES.length - 1 ? 'Start Writing' : 'Next Slide'}</span>
                                        <ArrowRight size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
