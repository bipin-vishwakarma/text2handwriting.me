import { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
    Sparkles, ArrowRight, BookOpen, Zap, 
    ChevronDown, Camera, Flame,
    FlaskConical, Eye, PenTool, ShieldCheck,
    CheckCircle2, FileText, Layers, BadgeIndianRupee, LockKeyhole
} from 'lucide-react';
const NotebookHero3D = lazy(() => import('../components/landing/NotebookHero3D'));
import { Loader2 } from 'lucide-react';
import BeforeAfterSlider from '../components/landing/BeforeAfterSlider';
import TiltCard from '../components/landing/TiltCard';
import { useStore } from '../lib/store';
import type { PaperMaterial } from '../types';

// Interactive Sandbox Presets
const SANDBOX_PRESETS = [
    {
        title: "Physics Lab Record",
        subject: "Physics",
        text: "Aim: To verify Ohm's Law and determine the unknown resistance of a metallic conductor.\nFormula: V = I × R (where R is the slope of the V-I characteristic curve).\nObservation: Current increases linearly with voltage across all 5 trial steps (2V to 10V). Mean measured resistance R = 4.82 Ω with < 0.8% standard deviation.",
        font: "Caveat, cursive",
        ink: "#1e3a8a", // Royal Blue
    },
    {
        title: "Computer Science Assignment",
        subject: "CS & Engineering",
        text: "Question 2: Explain Pipelining and Data Hazards in RISC-V Architecture.\nAnswer: Pipelining overlaps instruction execution across five stages: IF, ID, EX, MEM, and WB. Data hazards occur when instructions depend on the result of a previous uncompleted instruction. These are resolved using data forwarding or pipeline stalls.",
        font: "Indie Flower, cursive",
        ink: "#0f172a", // Ballpoint Black
    },
    {
        title: "Chemistry Observation",
        subject: "Chemistry",
        text: "Procedure: Pipette out 20.0 mL of standard 0.05 M oxalic acid into a conical flask. Add one test tube of dilute H2SO4 to acidify. Heat the mixture gently to 60°C and titrate against potassium permanganate solution until a permanent pale pink color is observed.",
        font: "Cedarville Cursive, cursive",
        ink: "#0284c7", // Gel Pen Blue
    },
    {
        title: "Calculus Theorem",
        subject: "Mathematics",
        text: "Theorem: The Fundamental Theorem of Calculus links differentiation and integration.\nPart 1: If f is continuous on [a,b], then g(x) = ∫[a,x] f(t) dt is continuous on [a,b] and differentiable on (a,b), with g'(x) = f(x).\nPart 2: ∫[a,b] f(x) dx = F(b) - F(a), where F'(x) = f(x).",
        font: "Playfair Display, serif",
        ink: "#4c1d95", // Deep Violet
    }
];

// Curated Paper Textures
const PAPER_SHOWCASE: {
    id: PaperMaterial;
    name: string;
    desc: string;
    lines: 'ruled' | 'lab' | 'graph' | 'parchment' | 'dotted' | 'ruled-yellow';
    badge: string;
}[] = [
    {
        id: 'ruled',
        name: 'Classmate 30-Line Ruled',
        desc: 'Standard Indian student ruled notebook with pink margin line.',
        lines: 'ruled',
        badge: 'Most Popular',
    },
    {
        id: 'youva-spiral',
        name: 'Dual-Page Practical Record',
        desc: 'Facing blank diagram sheet on left, ruled theory notes on right.',
        lines: 'lab',
        badge: 'Lab Mode',
    },
    {
        id: 'graph',
        name: 'Millimeter Engineering Graph',
        desc: 'Precision cyan grid for circuit diagrams, Fourier plots & math.',
        lines: 'graph',
        badge: 'Engineering',
    },
    {
        id: 'vintage',
        name: 'Vintage 180-GSM Parchment',
        desc: 'Warm textured grain for historical essays and humanities assignments.',
        lines: 'parchment',
        badge: 'Textured',
    },
    {
        id: 'dotted',
        name: 'Dotted Bullet Journal',
        desc: 'Subtle 5mm dot grid for neat sketches, formulas & flowcharts.',
        lines: 'dotted',
        badge: 'Minimal',
    },
    {
        id: 'college',
        name: 'Legal Examination Pad',
        desc: 'Canary yellow ruled sheets with wide left margin for annotations.',
        lines: 'ruled-yellow',
        badge: 'Exam Mode',
    }
];

// Frequently Asked Questions
const FAQ_ITEMS = [
    {
        q: "How realistic does the handwriting look when printed or exported?",
        a: "text2handwriting.me is engineered specifically to eliminate mechanical font uniformity. Every letter features natural stroke-width variations, micro-slant baseline jitter, realistic pen ink bleeding, and optional human scratch-outs. When printed on physical A4 paper or exported as a PDF, it produces authentic, natural handwriting."
    },
    {
        q: "Can I try text2handwriting.me before paying?",
        a: "Yes. You can compose, style, and preview your document in the studio before checkout. A downloadable export is priced transparently at ₹10 plus ₹2 per generated page, so you only pay when your document is ready."
    },
    {
        q: "How does the Lab Notebook / Mixed Page mode work?",
        a: "In Lab Notebook mode, facing pages are automatically paired: the left page is blank (or millimeter graph) for circuit schematics, biology diagrams, and graphs, while the right page is lined for procedure, theory, and observations. Both are exported together in sequence."
    },
    {
        q: "Are my assignments and private notes stored on external servers?",
        a: "By default, text2handwriting.me processes all text-to-handwriting generation and PDF exports 100% locally in your browser memory. Your text never leaves your device unless you opt into Supabase Cloud Sync."
    },
    {
        q: "Can I use custom fonts or add my own handwriting?",
        a: "Yes! text2handwriting.me comes preloaded with over 30 authentic Indian and international student handwriting styles (from neat cursive to rushed ballpoint scribble), and supports uploading custom TTF/WOFF font files."
    }
];

const NotebookLoader = () => (
    <div className="w-full h-[520px] sm:h-[640px] lg:h-[760px] flex items-center justify-center bg-stone-100/50 rounded-3xl animate-pulse">
        <Loader2 className="text-stone-300 animate-spin" size={32} />
    </div>
);

export default function LandingPage() {
    const navigate = useNavigate();
    const setText = useStore(state => state.setText);
    const setPaperMaterial = useStore(state => state.setPaperMaterial);

    // Subtle Scroll Tracking
    const { scrollYProgress } = useScroll();
    const yHeroNotebook = useTransform(scrollYProgress, [0, 0.4], [0, 40]);
    const yHeroContent = useTransform(scrollYProgress, [0, 0.4], [0, -15]);

    // Interactive Sandbox State
    const [selectedPreset, setSelectedPreset] = useState(0);
    const [sandboxText, setSandboxText] = useState(SANDBOX_PRESETS[0].text);
    const [activeInk, setActiveInk] = useState(SANDBOX_PRESETS[0].ink);
    const [activeFont, setActiveFont] = useState(SANDBOX_PRESETS[0].font);
    const [activeJitter, setActiveJitter] = useState(true);
    const [activeMargin, setActiveMargin] = useState(true);

    // FAQ Accordion State
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const handleLoadPreset = (idx: number) => {
        setSelectedPreset(idx);
        setSandboxText(SANDBOX_PRESETS[idx].text);
        setActiveInk(SANDBOX_PRESETS[idx].ink);
        setActiveFont(SANDBOX_PRESETS[idx].font);
    };

    const handleTransferToStudio = () => {
        setText(sandboxText);
        navigate('/editor');
    };

    const handleSelectPaperAndLaunch = (paperId: PaperMaterial) => {
        setPaperMaterial(paperId);
        navigate('/editor');
    };

    // Smooth scroll to hash anchor on mount or hash change
    useEffect(() => {
        const scrollToHash = () => {
            const hash = window.location.hash;
            if (hash) {
                const targetId = hash.replace('#', '');
                const targetElem = document.getElementById(targetId);
                if (targetElem) {
                    setTimeout(() => {
                        targetElem.scrollIntoView({ behavior: 'smooth' });
                    }, 80);
                }
            }
        };

        scrollToHash();
        window.addEventListener('hashchange', scrollToHash);
        return () => window.removeEventListener('hashchange', scrollToHash);
    }, []);

    return (
        <div className="min-h-screen overflow-x-clip bg-[#FAF8F5] text-stone-900 selection:bg-violet-200 selection:text-violet-900 font-sans relative">

            {/* Architectural Warm Paper Dot Grid */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-30 -z-10"
                style={{
                    backgroundImage: 'radial-gradient(#94a3b8 0.75px, transparent 0.75px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Subtle Architectural Ambient Lighting (Clean, no muddy color smudges) */}
            <div 
                className="pointer-events-none -z-10 absolute inset-0 overflow-hidden"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" />
            </div>

            {/* =========================================================
                1. IMMERSIVE HERO STAGE (Open Dual-Page Spiral & Editorial)
            ========================================================= */}
            <section className="relative pt-32 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="grid min-w-0 grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                    
                    {/* Left Column: Dramatic Editorial Copy */}
                    <motion.div 
                        style={{ y: yHeroContent }}
                        className="min-w-0 lg:col-span-5 text-left space-y-6 z-10"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex max-w-full items-center gap-2 rounded-full border border-violet-200 bg-white/85 px-3 py-1.5 text-[11px] font-bold text-violet-800 shadow-sm backdrop-blur"
                        >
                            <Sparkles size={13} aria-hidden="true" />
                            <span className="truncate">DESIGN FREE · PAY ONLY TO EXPORT</span>
                        </motion.div>
                        {/* Grand Display Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl sm:text-5.5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-stone-950 font-display"
                        >
                            Turn typed text into handwriting{' '}
                            <span className="text-violet-700">
                                that feels yours.
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl font-normal"
                        >
                            Build polished handwritten notes, practical records, and study material without repetitive copying. Paste your text, tune every detail, preview the result, then export only when it looks right.
                        </motion.p>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
                        >
                            <Link
                                to="/editor"
                                className="px-7 py-4 bg-stone-950 hover:bg-stone-800 text-white rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-stone-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                            >
                                <Sparkles size={18} className="text-amber-400 group-hover:rotate-12 transition-transform" />
                                <span>Design My Document</span>
                                <ArrowRight size={18} className="text-white/80 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <a
                                href="#comparison"
                                className="px-6 py-4 bg-white hover:bg-stone-50 border border-stone-300/90 text-stone-800 rounded-2xl font-bold text-sm sm:text-base shadow-2xs hover:border-stone-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Eye size={18} className="text-violet-600" />
                                <span>Compare Realism</span>
                            </a>
                        </motion.div>

                        {/* Live Ink Swatch Micro-Widget */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="pt-4 flex items-center gap-3 border-t border-stone-200/80 text-xs text-stone-500"
                        >
                            <span className="font-mono text-[11px] uppercase tracking-wider text-stone-700 font-bold">Ink Tone:</span>
                            <div className="flex items-center gap-2">
                                {[
                                    { name: 'Royal Blue', color: '#1e3a8a' },
                                    { name: 'Ballpoint Black', color: '#0f172a' },
                                    { name: 'Gel Cyan', color: '#0284c7' },
                                    { name: 'Walnut Sepia', color: '#4c1d95' }
                                ].map(ink => (
                                    <button
                                        key={ink.name}
                                        type="button"
                                        onClick={() => setActiveInk(ink.color)}
                                        className={`w-5 h-5 rounded-full border border-stone-300 transition-all hover:scale-125 focus:outline-none cursor-pointer ${
                                            activeInk === ink.color ? 'ring-2 ring-violet-500 ring-offset-2 scale-110' : ''
                                        }`}
                                        style={{ backgroundColor: ink.color }}
                                        title={ink.name}
                                        aria-label={`Use ${ink.name} ink`}
                                    />
                                ))}
                            </div>
                            <span className="hidden min-[430px]:flex text-[11px] text-emerald-700 font-mono ml-auto font-bold items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Interactive Canvas Live
                            </span>
                        </motion.div>

                        {/* Verified Credibility Badges */}
                        <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-2.5 sm:gap-3 pt-2 text-center">
                            <div className="p-3.5 rounded-2xl bg-white/80 border border-stone-200/80 shadow-2xs">
                                <p className="text-lg font-black text-stone-900">Free</p>
                                <p className="text-[11px] text-stone-500 font-medium">Live preview</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-white/80 border border-stone-200/80 shadow-2xs">
                                <p className="text-lg font-black text-violet-700">30+</p>
                                <p className="text-[11px] text-stone-500 font-medium">Handwriting Fonts</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-white/80 border border-stone-200/80 shadow-2xs">
                                <p className="text-lg font-black text-emerald-600">100%</p>
                                <p className="text-[11px] text-stone-500 font-medium">Local & Private</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Uncaged Open Dual-Page Spiral Notebook */}
                    <div className="min-w-0 lg:col-span-7 relative flex items-center justify-center">
                        {/* Uncaged 3D Notebook Canvas (Free Floating, Interactive) */}
                        <motion.div 
                            style={{ y: yHeroNotebook }}
                            className="w-full min-w-0 max-w-[min(860px,115vw)] relative cursor-grab active:cursor-grabbing drop-shadow-[0_25px_35px_rgba(0,0,0,0.15)]"
                        >
                            <Suspense fallback={<NotebookLoader />}><NotebookHero3D activeInk={activeInk} /></Suspense>
                        </motion.div>
                    </div>

                </div>
            </section>

            {/* =========================================================
                2. BEFORE/AFTER COMPARISON SECTION
            ========================================================= */}
            <section id="comparison" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto relative scroll-mt-24">
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100/80 border border-violet-200 text-violet-800 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                        <Eye size={12} className="text-violet-600" />
                        <span>The Realism Difference</span>
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black text-stone-950 tracking-tight font-display">
                        Mechanical Type vs. Organic Ink
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base mt-2">
                        Drag the center slider horizontally to compare rigid computer fonts against text2handwriting.me's authentic ink absorption, motor jitter, and margin layout.
                    </p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5 }}
                >
                    <BeforeAfterSlider hideHeader />
                </motion.div>
            </section>

            {/* =========================================================
                3.5 PARALLAX HOW IT WORKS (4-Step Guided Journey)
            ========================================================= */}
            <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto relative scroll-mt-20">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-800 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                        <CheckCircle2 size={13} className="text-indigo-600" />
                        <span>Workflow · 4 Simple Steps</span>
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black text-stone-950 tracking-tight font-display">
                        How text2handwriting.me Works
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base mt-2.5 leading-relaxed">
                        Four straightforward steps to turn digital text into authentic student lab records, registers, and handwritten assignments.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {/* Step 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.4, delay: 0.05 }}
                        className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-violet-300 transition-all flex flex-col justify-between group"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <span className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-108 transition-transform">
                                    01
                                </span>
                                <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-mono font-bold uppercase">
                                    Input
                                </span>
                            </div>
                            <h3 className="text-lg font-black text-stone-900 mb-2">
                                Write, Paste, or Import
                            </h3>
                            <p className="text-xs text-stone-600 leading-relaxed">
                                Paste raw text, markdown, or drop documents (.docx, .pdf, .txt). The Smart Preamble Stripper purges ChatGPT fluff, while Smart Margin Indexing pins question numbers (Q1., Sol:) cleanly into notebook margins.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-1.5 text-[11px] font-mono text-violet-700 font-bold">
                            <span>Auto-detection active</span>
                        </div>
                    </motion.div>

                    {/* Step 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col justify-between group"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <span className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-108 transition-transform">
                                    02
                                </span>
                                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold uppercase">
                                    Stationery
                                </span>
                            </div>
                            <h3 className="text-lg font-black text-stone-900 mb-2">
                                Pick Paper & Ink Tone
                            </h3>
                            <p className="text-xs text-stone-600 leading-relaxed">
                                Select Classmate 30-Line Ruled registers, millimeter engineering graph paper, or parchment. Choose authentic student ink colors: Royal Blue, Ballpoint Black, Gel Cyan, or Emerald Green with true capillary absorption.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-1.5 text-[11px] font-mono text-indigo-700 font-bold">
                            <span>Curated paper & lab styles</span>
                        </div>
                    </motion.div>

                    {/* Step 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.4, delay: 0.25 }}
                        className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-cyan-300 transition-all flex flex-col justify-between group"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <span className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-108 transition-transform">
                                    03
                                </span>
                                <span className="px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-mono font-bold uppercase">
                                    Engine
                                </span>
                            </div>
                            <h3 className="text-lg font-black text-stone-900 mb-2">
                                Realism & Human Flaws
                            </h3>
                            <p className="text-xs text-stone-600 leading-relaxed">
                                Eliminate mechanical perfection. text2handwriting.me adds organic motor jitter, subtle line-drift waves, slight character width variations, realistic pen pressure, and deliberate human scratch-outs with wavy ink strokes.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-1.5 text-[11px] font-mono text-cyan-700 font-bold">
                            <span>Zero uniform glyphs</span>
                        </div>
                    </motion.div>

                    {/* Step 4 */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.4, delay: 0.35 }}
                        className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <span className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-108 transition-transform">
                                    04
                                </span>
                                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold uppercase">
                                    Export
                                </span>
                            </div>
                            <h3 className="text-lg font-black text-stone-900 mb-2">
                                4K Multi-Page PDF
                            </h3>
                            <p className="text-xs text-stone-600 leading-relaxed">
                                Toggle smartphone camera shadows, desk lamp warm glow, and paper fold creases. Export print-ready 4K high-resolution PDFs or image bundles with facing diagram sheets included in flawless sequence.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 font-bold">
                            <span>Vector crisp · 0 watermarks</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* =========================================================
                4. LIVE INTERACTIVE STUDIO SANDBOX
            ========================================================= */}
            <section id="live-sandbox" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
                <motion.div 
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5 }}
                    className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-10 shadow-xl shadow-stone-200/50"
                >
                    {/* Sandbox Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-stone-200/80">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100/80 border border-violet-200 text-violet-800 text-xs font-mono font-bold mb-2">
                                <PenTool size={13} className="text-violet-600" />
                                <span>Interactive Sandbox</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
                                Test Your Own Text Right Here
                            </h3>
                            <p className="text-xs sm:text-sm text-stone-600 mt-1">
                                Type or pick an assignment preset below to watch text2handwriting.me render authentic handwriting in real time.
                            </p>
                        </div>

                        {/* Preset Selector */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {SANDBOX_PRESETS.map((preset, idx) => (
                                <button
                                    key={preset.title}
                                    type="button"
                                    onClick={() => handleLoadPreset(idx)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        selectedPreset === idx
                                            ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200/70 border border-stone-200/80'
                                    }`}
                                >
                                    {preset.subject}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sandbox Split Interface */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
                        
                        {/* Left: Input Textarea & Controls */}
                        <div className="lg:col-span-5 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2 font-mono">
                                    Input Text (Type or Paste)
                                </label>
                                <textarea
                                    value={sandboxText}
                                    onChange={(e) => setSandboxText(e.target.value)}
                                    rows={8}
                                    className="w-full p-4 rounded-2xl bg-stone-50/80 border border-stone-200/90 focus:border-violet-500 focus:bg-white focus:outline-none text-stone-900 text-xs font-mono leading-relaxed resize-none shadow-inner"
                                    placeholder="Type anything here..."
                                />
                            </div>

                            {/* Control Toggles */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setActiveJitter(!activeJitter)}
                                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                                        activeJitter 
                                            ? 'bg-violet-50 border-violet-300 text-violet-800' 
                                            : 'bg-stone-100 border-stone-200 text-stone-500'
                                    }`}
                                >
                                    <span>Motor Jitter</span>
                                    <span className={`w-2 h-2 rounded-full ${activeJitter ? 'bg-violet-600' : 'bg-stone-400'}`} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveMargin(!activeMargin)}
                                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                                        activeMargin 
                                            ? 'bg-cyan-50 border-cyan-300 text-cyan-800' 
                                            : 'bg-stone-100 border-stone-200 text-stone-500'
                                    }`}
                                >
                                    <span>Margin Rules</span>
                                    <span className={`w-2 h-2 rounded-full ${activeMargin ? 'bg-cyan-600' : 'bg-stone-400'}`} />
                                </button>
                            </div>

                            {/* CTAs */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleTransferToStudio}
                                    className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                                >
                                    <Sparkles size={15} className="text-yellow-300" />
                                    <span>Transfer to Full Studio & Export PDF</span>
                                    <ArrowRight size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Right: Real-time Paper Canvas Preview */}
                        <div className="lg:col-span-7">
                            <div className="relative rounded-2xl bg-[#fdfbf7] p-8 sm:p-10 shadow-md min-h-[380px] sm:min-h-[420px] text-neutral-900 overflow-hidden border border-stone-300">
                                
                                {/* Margin double red line */}
                                {activeMargin && (
                                    <>
                                        <div className="absolute top-0 bottom-0 left-12 sm:left-16 w-[2px] bg-red-400 opacity-60 pointer-events-none" />
                                        <div className="absolute top-0 bottom-0 left-[51px] sm:left-[67px] w-[1px] bg-red-300 opacity-40 pointer-events-none" />
                                    </>
                                )}

                                {/* Blue ruled lines */}
                                <div
                                    className="absolute inset-0 pointer-events-none opacity-40"
                                    style={{
                                        backgroundImage: 'linear-gradient(to bottom, transparent 31px, #93c5fd 32px)',
                                        backgroundSize: '100% 32px',
                                    }}
                                />

                                {/* Top Date & Page header */}
                                <div className="relative z-10 flex items-center justify-between pl-8 pb-3 border-b border-rose-200/60 text-[11px] font-mono text-neutral-400 mb-4">
                                    <span>PAGE: 01</span>
                                    <span>DATE: {new Date().toLocaleDateString('en-GB')}</span>
                                </div>

                                {/* Handwritten text render */}
                                <div
                                    style={{
                                        fontFamily: activeFont,
                                        color: activeInk,
                                        lineHeight: '32px',
                                        transform: activeJitter ? 'rotate(-0.25deg)' : 'none',
                                    }}
                                    className="relative z-10 pl-8 text-lg sm:text-xl font-normal whitespace-pre-wrap leading-[32px] select-none"
                                >
                                    {sandboxText}
                                </div>

                                {/* Simulated ink stamp bottom watermark */}
                                <div className="relative z-10 pl-8 pt-8 flex items-center justify-between text-[10px] text-neutral-400 font-mono border-t border-neutral-200/50 mt-6">
                                    <span>Classmate 180-GSM Ruled Paper</span>
                                    <span className="text-emerald-700 font-bold">Organic Micro-Jitter Active</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </section>

            {/* =========================================================
                5. CURATED STUDENT PAPER TEXTURES (Bento Matrix)
            ========================================================= */}
            <section id="paper-vault" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-20">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100/80 border border-violet-200 text-violet-800 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                        <BookOpen size={12} className="text-violet-600" />
                        <span>The Paper Vault</span>
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black text-stone-950 tracking-tight font-display">
                        Authentic Student Registers & Formats
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base mt-2">
                        From standard Indian university ruled sheets to dual-page lab records and millimeter engineering graph papers.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PAPER_SHOWCASE.map((paper) => (
                        <TiltCard key={paper.id} className="h-full">
                            <div className="h-full p-6 rounded-3xl bg-white hover:bg-stone-50/50 border border-stone-200/90 hover:border-violet-400/60 transition-all flex flex-col justify-between group shadow-xs hover:shadow-xl">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[11px] font-bold border border-violet-200">
                                            {paper.badge}
                                        </span>
                                        <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 group-hover:text-white group-hover:bg-violet-600 transition-colors">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>

                                    {/* Paper Pattern Preview Swatch */}
                                    <div className="h-24 w-full rounded-2xl border border-stone-200/80 mb-4 overflow-hidden relative shadow-2xs">
                                        {paper.lines === 'ruled' && (
                                            <div className="w-full h-full bg-[#fdfbf7] p-3">
                                                <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-red-400 opacity-60" />
                                                <div
                                                    className="w-full h-full opacity-40"
                                                    style={{
                                                        backgroundImage: 'linear-gradient(to bottom, transparent 15px, #93c5fd 16px)',
                                                        backgroundSize: '100% 16px',
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {paper.lines === 'lab' && (
                                            <div className="w-full h-full grid grid-cols-2 divide-x divide-stone-200 bg-[#fdfbf7]">
                                                <div className="p-2 flex items-center justify-center bg-stone-50/50">
                                                    <span className="text-[9px] font-mono text-stone-400 font-bold">BLANK DIAGRAM</span>
                                                </div>
                                                <div
                                                    className="w-full h-full opacity-40 p-2"
                                                    style={{
                                                        backgroundImage: 'linear-gradient(to bottom, transparent 11px, #93c5fd 12px)',
                                                        backgroundSize: '100% 12px',
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {paper.lines === 'graph' && (
                                            <div
                                                className="w-full h-full bg-[#f0f9ff] opacity-75"
                                                style={{
                                                    backgroundImage: 'linear-gradient(to right, #bae6fd 1px, transparent 1px), linear-gradient(to bottom, #bae6fd 1px, transparent 1px)',
                                                    backgroundSize: '12px 12px',
                                                }}
                                            />
                                        )}
                                        {paper.lines === 'parchment' && (
                                            <div className="w-full h-full bg-[#fef3c7]/40 border-stone-200 flex items-center justify-center">
                                                <span className="text-[10px] font-serif text-amber-800/60 italic font-semibold">180 GSM Warm Parchment</span>
                                            </div>
                                        )}
                                        {paper.lines === 'dotted' && (
                                            <div
                                                className="w-full h-full bg-[#fafaf9]"
                                                style={{
                                                    backgroundImage: 'radial-gradient(#a8a29e 1px, transparent 1px)',
                                                    backgroundSize: '12px 12px',
                                                }}
                                            />
                                        )}
                                        {paper.lines === 'ruled-yellow' && (
                                            <div className="w-full h-full bg-[#fef9c3]/60 p-3">
                                                <div className="absolute left-8 top-0 bottom-0 w-[1.5px] bg-red-400 opacity-60" />
                                                <div
                                                    className="w-full h-full opacity-40"
                                                    style={{
                                                        backgroundImage: 'linear-gradient(to bottom, transparent 15px, #d97706 16px)',
                                                        backgroundSize: '100% 16px',
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <h4 className="text-lg font-bold text-stone-900 mb-1.5">{paper.name}</h4>
                                    <p className="text-xs text-stone-600 leading-relaxed">{paper.desc}</p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectPaperAndLaunch(paper.id)}
                                        className="text-xs font-bold text-violet-700 group-hover:text-violet-800 flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span>Open in Studio</span>
                                        <ArrowRight size={12} />
                                    </button>
                                    <span className="text-[10px] font-mono text-stone-400">Vector Print Ready</span>
                                </div>
                            </div>
                        </TiltCard>
                    ))}
                </div>
            </section>

            {/* =========================================================
                6. AUTHENTICITY FEATURES BENTO GRID
            ========================================================= */}
            <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-20">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-800 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                        <Zap size={12} className="text-amber-600" />
                        <span>Core Capabilities</span>
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black text-stone-950 tracking-tight font-display">
                        Crafted for Real Paper Authenticity
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base mt-2">
                        Every small detail of physical pens and paper, recreated with care.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Card 1: Smartphone Camera Perspective */}
                    <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-108 transition-transform">
                                <Camera size={24} />
                            </div>
                            <h3 className="text-xl font-black text-stone-900 mb-2">Smartphone Perspective & Cast Shadows</h3>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                Simulates taking a photo with a mobile phone. Adds subtle corner tilt, lens depth, and authentic phone silhouette cast shadows to look like real student submissions.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-mono text-indigo-600 font-bold">
                            Natural optical depth & illumination
                        </div>
                    </div>

                    {/* Card 2: Lab Notebook Diagram Canvas */}
                    <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-cyan-300 transition-all flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 mb-6 group-hover:scale-108 transition-transform">
                                <FlaskConical size={24} />
                            </div>
                            <h3 className="text-xl font-black text-stone-900 mb-2">Lab Record & Diagram Workbench</h3>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                Facing-sheet practical mode with built-in sketch tools. Insert SVG circuit schematics, ray optics, or titration apparatus directly onto blank sheets before PDF compilation.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-mono text-cyan-600 font-bold">
                            Dual-page practical mode
                        </div>
                    </div>

                    {/* Card 3: Natural Human Inconsistency */}
                    <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-purple-300 transition-all flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-6 group-hover:scale-108 transition-transform">
                                <Flame size={24} />
                            </div>
                            <h3 className="text-xl font-black text-stone-900 mb-2">Human Imperfections & Scratch-Outs</h3>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                Real handwriting has character. text2handwriting.me adds realistic baseline drift, pen pressure variations, and realistic human typos with authentic wavy strikethroughs.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-mono text-purple-600 font-bold">
                            Organic pen flow & ink absorption
                        </div>
                    </div>

                    {/* Card 4: Smart Margin Indexing */}
                    <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-108 transition-transform">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-xl font-black text-stone-900 mb-2">Smart Margin Indexing & AI Cleaner</h3>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                Automatically isolates question labels (Q1., Sol:, Fig:) into the red margin rule, while automatically stripping away conversational AI preambles like "Sure, here is your assignment".
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-mono text-amber-700 font-bold">
                            Standard Indian answer sheet format
                        </div>
                    </div>

                    {/* Card 5: Twin-Wire Spiral Binding */}
                    <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-108 transition-transform">
                                <Layers size={24} />
                            </div>
                            <h3 className="text-xl font-black text-stone-900 mb-2">Twin-Wire Spiral Coils & Paper Ream</h3>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                Render metallic chrome twin-wire spiral coils pinned exclusively along the left edge, complete with paper thickness edges, puncture punch holes, and subtle shadow grooves.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-mono text-emerald-600 font-bold">
                            Authentic stationery physics
                        </div>
                    </div>

                    {/* Card 6: Privacy and transparent checkout */}
                    <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-rose-300 transition-all flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-6 group-hover:scale-108 transition-transform">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-xl font-black text-stone-900 mb-2">Private Workspace & Clear Pricing</h3>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                Compose and render in your browser, preview before checkout, and see the exact export price before you pay. Your document content is not uploaded for handwriting generation.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-mono text-rose-600 font-bold">
                            Free preview · Pay per export · No subscription
                        </div>
                    </div>

                </div>
            </section>

            {/* =========================================================
                7. TRANSPARENT CONVERSION / PRICING
            ========================================================= */}
            <section id="pricing-preview" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-24">
                <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-xl shadow-stone-200/50">
                    <div className="grid lg:grid-cols-[1.15fr_.85fr]">
                        <div className="p-7 sm:p-10 lg:p-12">
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                                <BadgeIndianRupee size={14} aria-hidden="true" /> Simple pay-per-export pricing
                            </span>
                            <h2 className="mt-5 max-w-2xl text-3xl sm:text-5xl font-black tracking-tight text-stone-950 font-display">
                                Perfect the preview first. Pay only when it is ready.
                            </h2>
                            <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-stone-600">
                                There is no subscription and no surprise charge. Use the complete editor, explore paper and ink styles, and review every page before opening secure checkout.
                            </p>
                            <div className="mt-7 grid gap-3 sm:grid-cols-3">
                                {[
                                    ['01', 'Create', 'Paste or import your text'],
                                    ['02', 'Preview', 'Tune every page visually'],
                                    ['03', 'Export', 'Pay once and download'],
                                ].map(([step, title, detail]) => (
                                    <div key={step} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                                        <span className="text-[10px] font-black tracking-widest text-violet-600">{step}</span>
                                        <p className="mt-1 text-sm font-black text-stone-900">{title}</p>
                                        <p className="mt-1 text-xs leading-relaxed text-stone-500">{detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col justify-between bg-stone-950 p-7 text-white sm:p-10 lg:p-12">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">One export</p>
                                <div className="mt-3 flex items-end gap-2">
                                    <span className="text-5xl font-black tracking-tight">₹10</span>
                                    <span className="pb-1.5 text-sm text-stone-300">base fee</span>
                                </div>
                                <p className="mt-2 text-sm text-stone-300">+ ₹2 for each generated page</p>
                                <ul className="mt-7 space-y-3 text-sm text-stone-200">
                                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Full-resolution PDF or ZIP</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Price shown before checkout</li>
                                    <li className="flex items-center gap-2"><LockKeyhole size={16} className="text-emerald-400" /> Secure Razorpay checkout</li>
                                </ul>
                            </div>
                            <Link to="/editor" className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-black text-stone-950 transition hover:bg-violet-50 active:scale-[.98]">
                                Start with a free preview <ArrowRight size={17} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                8. FREQUENTLY ASKED QUESTIONS (Accordion)
            ========================================================= */}
            <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto scroll-mt-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-black text-stone-950 tracking-tight font-display">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-stone-600 text-sm mt-2">
                        Everything you need to know about text2handwriting.me, authenticity, and student export rights.
                    </p>
                </div>

                <div className="space-y-3.5">
                    {FAQ_ITEMS.map((item, idx) => (
                        <div
                            key={item.q}
                            className="rounded-2xl border border-stone-200/90 bg-white shadow-2xs overflow-hidden transition-colors"
                        >
                            <button
                                type="button"
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-stone-900 text-base cursor-pointer hover:bg-stone-50/60"
                                aria-expanded={openFaq === idx}
                                aria-controls={`landing-faq-${idx}`}
                            >
                                <span>{item.q}</span>
                                <ChevronDown
                                    size={18}
                                    className={`text-stone-400 transition-transform ${openFaq === idx ? 'rotate-180 text-violet-600' : ''}`}
                                />
                            </button>
                            <AnimatePresence>
                                {openFaq === idx && (
                                    <motion.div
                                        id={`landing-faq-${idx}`}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="px-5 pb-5 text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-3">
                                            {item.a}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </section>

            {/* =========================================================
                9. CALL-TO-ACTION PORTAL
            ========================================================= */}
            <section className="py-20 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-indigo-950 to-violet-950 border border-indigo-500/30 p-10 sm:p-16 text-center shadow-[0_0_40px_rgba(139,92,246,0.15)] text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold font-mono">
                            <Sparkles size={13} className="text-amber-400" />
                            <span>FREE TO DESIGN · PAY ONLY TO EXPORT</span>
                        </div>

                        <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-violet-400 tracking-tight font-display pb-1">
                            Start Creating Handwritten Assignments in Seconds.
                        </h2>

                        <p className="text-stone-200 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                            Open the studio without a subscription, shape every detail, and preview every page before deciding to export.
                        </p>

                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/editor"
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400 rounded-2xl font-bold text-base shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Sparkles size={18} className="text-yellow-300" />
                                <span>Create My Free Preview</span>
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}






