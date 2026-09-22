import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Check,
    Download,
    FileText,
    Palette,
    Sparkles,
    type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type StudioScene = {
    id: string;
    label: string;
    eyebrow: string;
    title: string;
    description: string;
    icon: LucideIcon;
    accent: string;
    tint: string;
};

const STUDIO_SCENES: StudioScene[] = [
    {
        id: 'compose',
        label: 'Compose',
        eyebrow: '01 · Start with words',
        title: 'Bring in the content.',
        description: 'Paste text, choose a subject preset, or continue from a saved draft.',
        icon: FileText,
        accent: '#a78bfa',
        tint: 'rgba(139, 92, 246, 0.18)',
    },
    {
        id: 'style',
        label: 'Style',
        eyebrow: '02 · Make it yours',
        title: 'Tune the page visually.',
        description: 'Pair handwriting, ink, spacing, paper, and layout while the preview stays live.',
        icon: Palette,
        accent: '#67e8f9',
        tint: 'rgba(6, 182, 212, 0.17)',
    },
    {
        id: 'export',
        label: 'Export',
        eyebrow: '03 · Review, then export',
        title: 'Finish with confidence.',
        description: 'Inspect every page, see the final price, and download PDF or ZIP only when ready.',
        icon: Download,
        accent: '#6ee7b7',
        tint: 'rgba(16, 185, 129, 0.17)',
    },
];

const TICKER_ITEMS = [
    '30+ handwriting styles',
    'Live paper preview',
    'PDF & image ZIP',
    'No subscription',
    'Browser-rendered documents',
];

export default function InteractiveStudioShowcase() {
    const [activeScene, setActiveScene] = useState(0);
    const scene = STUDIO_SCENES[activeScene];
    const SceneIcon = scene.icon;

    return (
        <section className="px-4 py-8 sm:px-6 sm:py-12" aria-labelledby="studio-showcase-heading">
            <div className="landing-squircle relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#101014] text-white shadow-[0_36px_100px_-38px_rgba(38,21,75,0.72)] sm:rounded-[3rem]">
                <div
                    className="pointer-events-none absolute inset-0 opacity-90 transition-[background] duration-700"
                    style={{
                        background: `radial-gradient(circle at 74% 24%, ${scene.tint}, transparent 30%), radial-gradient(circle at 14% 92%, rgba(244, 114, 182, 0.09), transparent 28%)`,
                    }}
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />

                <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:p-14">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 backdrop-blur-xl">
                            <Sparkles size={13} className="text-violet-300" aria-hidden="true" />
                            Interactive studio flow
                        </div>
                        <h2 id="studio-showcase-heading" className="mt-5 max-w-xl text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.02]">
                            One calm workspace.
                            <span className="block bg-linear-to-r from-violet-300 via-fuchsia-200 to-cyan-300 bg-clip-text text-transparent">
                                Every page under control.
                            </span>
                        </h2>
                        <p className="mt-5 max-w-lg text-sm leading-7 text-white/58 sm:text-base">
                            Move from raw text to a reviewed document without jumping between disconnected tools.
                        </p>

                        <div className="mt-8 grid grid-cols-3 gap-1.5 rounded-2xl border border-white/10 bg-black/25 p-1.5 backdrop-blur-xl" role="tablist" aria-label="Studio workflow">
                            {STUDIO_SCENES.map((item, index) => {
                                const Icon = item.icon;
                                const selected = activeScene === index;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={selected}
                                        aria-controls="studio-scene-panel"
                                        onClick={() => setActiveScene(index)}
                                        className={`relative flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-xl px-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 sm:text-sm ${
                                            selected ? 'text-white' : 'text-white/45 hover:text-white/80'
                                        }`}
                                    >
                                        {selected && (
                                            <motion.span
                                                layoutId="studio-active-tab"
                                                className="absolute inset-0 rounded-xl border border-white/12 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.13)]"
                                                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                                            />
                                        )}
                                        <Icon size={15} className="relative" aria-hidden="true" />
                                        <span className="relative">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-7 min-h-36" id="studio-scene-panel" role="tabpanel">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={scene.id}
                                    initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.24 }}
                                >
                                    <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: scene.accent }}>
                                        {scene.eyebrow}
                                    </p>
                                    <h3 className="mt-2 text-2xl font-black tracking-tight text-white">{scene.title}</h3>
                                    <p className="mt-2 max-w-md text-sm leading-6 text-white/55">{scene.description}</p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <Link
                            to="/editor"
                            className="group mt-2 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-stone-950 shadow-[0_12px_30px_rgba(0,0,0,.28)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300 active:translate-y-0"
                        >
                            Open the studio
                            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="relative min-h-[430px] sm:min-h-[520px]" aria-hidden="true">
                        <motion.div
                            className="absolute left-[4%] top-[11%] h-[76%] w-[78%] rounded-[2rem] border border-white/10 bg-white/[0.055]"
                            animate={{ rotate: activeScene === 0 ? -7 : activeScene === 1 ? -4 : -9, y: activeScene * 3 }}
                            transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                        />
                        <motion.div
                            className="absolute right-[2%] top-[16%] h-[72%] w-[80%] rounded-[2rem] border border-white/10 bg-white/[0.07]"
                            animate={{ rotate: activeScene === 0 ? 6 : activeScene === 1 ? 9 : 4, y: -activeScene * 4 }}
                            transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                        />

                        <motion.div
                            className="absolute inset-x-[8%] inset-y-[7%] overflow-hidden rounded-[1.8rem] border border-white/70 bg-[#fffdf8] text-stone-900 shadow-[0_34px_90px_rgba(0,0,0,.46),inset_0_1px_0_white] sm:rounded-[2.25rem]"
                            animate={{ rotate: activeScene === 0 ? -1.6 : activeScene === 1 ? 0.8 : -0.4, scale: activeScene === 1 ? 1.015 : 1 }}
                            transition={{ type: 'spring', stiffness: 190, damping: 24 }}
                        >
                            <div className="flex h-14 items-center justify-between border-b border-stone-200 bg-white/85 px-5">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                </div>
                                <span className="rounded-full bg-stone-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-stone-500">Live preview</span>
                            </div>
                            <div className="grid h-[calc(100%-3.5rem)] grid-cols-[72px_1fr] sm:grid-cols-[96px_1fr]">
                                <div className="border-r border-stone-200 bg-stone-50 p-3">
                                    {[0, 1, 2, 3].map((item) => (
                                        <motion.div
                                            key={item}
                                            className="mb-3 aspect-[.72] rounded-md border border-stone-200 bg-white shadow-sm"
                                            animate={{ borderColor: item === activeScene ? scene.accent : '#e7e5e4' }}
                                        />
                                    ))}
                                </div>
                                <div className="relative overflow-hidden p-5 sm:p-8">
                                    <div className="absolute bottom-0 left-10 top-0 w-px bg-rose-200" />
                                    <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(transparent_27px,#bfdbfe_28px)] [background-size:100%_28px]" />
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={scene.id}
                                            initial={{ opacity: 0, x: 16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -12 }}
                                            transition={{ duration: 0.26 }}
                                            className="relative pl-6"
                                        >
                                            <div className="mb-5 flex items-center justify-between">
                                                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-stone-400">Notebook / 01</span>
                                                <span className="rounded-full px-2 py-1 text-[9px] font-black" style={{ color: scene.accent, background: scene.tint }}>
                                                    {scene.label}
                                                </span>
                                            </div>
                                            <p className="font-display text-xl font-black text-stone-900 sm:text-2xl">The Fundamental Theorem</p>
                                            <p className="mt-6 font-[Caveat] text-lg leading-7 text-blue-900 sm:text-xl">
                                                Integration and differentiation are inverse processes. A live preview helps you tune spacing, ink, and paper before export.
                                            </p>
                                            <div className="mt-7 flex flex-wrap gap-2">
                                                {['Caveat', 'Royal blue', 'Ruled'].map((chip) => (
                                                    <span key={chip} className="rounded-full border border-stone-200 bg-white/85 px-2.5 py-1 text-[9px] font-bold text-stone-500 shadow-sm">
                                                        {chip}
                                                    </span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="absolute bottom-[2%] right-[1%] flex items-center gap-2 rounded-2xl border border-white/15 bg-[#19191f]/90 px-4 py-3 text-xs font-bold shadow-2xl backdrop-blur-xl"
                            animate={{ y: [0, -7, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <span className="grid h-7 w-7 place-items-center rounded-full" style={{ color: scene.accent, background: scene.tint }}>
                                <SceneIcon size={14} />
                            </span>
                            <span>{scene.label} mode</span>
                            <Check size={14} className="text-emerald-300" />
                        </motion.div>
                    </div>
                </div>

                <div className="relative overflow-hidden border-t border-white/10 bg-white/[0.035] py-4 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                    <div className="landing-showcase-marquee flex w-max items-center gap-3 pr-3">
                        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
                            <div key={`${item}-${index}`} className="flex items-center gap-3 whitespace-nowrap text-xs font-bold text-white/46">
                                <span className="h-1 w-1 rounded-full bg-violet-300" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
