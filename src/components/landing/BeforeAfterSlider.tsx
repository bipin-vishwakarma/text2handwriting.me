import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MoveHorizontal, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

const COMPARISON_PRESETS = [
    {
        id: 'physics',
        title: 'Physics Lab Experiment',
        beforeText: `EXPERIMENT 04: VERIFICATION OF OHM'S LAW
Aim: To determine resistance per unit length of a given wire by plotting V vs I.
Formula: V = I × R (where R is the slope of the characteristic curve in Ohms Ω).
Observation: Current scales linearly with applied voltage across all 5 trial steps.
Calculations: Mean measured resistance R = 4.82 Ω with < 0.8% standard deviation.
Result: Record your observations and conclusions for review.`,
        afterText: `EXPERIMENT 04: VERIFICATION OF OHM'S LAW
Aim: To determine resistance per unit length of a given wire by plotting V vs I.
Formula: V = I × R (where R is the slope of the characteristic curve in Ohms Ω).
Observation: Current scales linearly with applied voltage across all 5 trial steps.
Calculations: Mean measured resistance R = 4.82 Ω with < 0.8% standard deviation.
Result: Record your observations and conclusions for review.`,
        handwritingFont: 'Caveat, cursive',
        inkColor: '#1e3a8a', // Royal Blue
    },
    {
        id: 'computer',
        title: 'Computer Science Theory',
        beforeText: `QUESTION 01: EXPLAIN PIPELINING & HAZARDS IN RISC-V
Overview: Pipelining increases CPU instruction throughput by overlapping 5 stages.
Stage Breakdown: IF (Instruction Fetch), ID (Decode), EX (Execute), MEM, WB (Write-back).
Structural Hazards: Hardware resource contention resolved via duplicate functional units.
Data Hazards: Read-After-Write (RAW) dependencies resolved with data forwarding.
Control Hazards: Branch prediction penalties mitigated using dynamic 2-bit branch predictors.`,
        afterText: `QUESTION 01: EXPLAIN PIPELINING & HAZARDS IN RISC-V
Overview: Pipelining increases CPU instruction throughput by overlapping 5 stages.
Stage Breakdown: IF (Instruction Fetch), ID (Decode), EX (Execute), MEM, WB (Write-back).
Structural Hazards: Hardware resource contention resolved via duplicate functional units.
Data Hazards: Read-After-Write (RAW) dependencies resolved with data forwarding.
Control Hazards: Branch prediction penalties mitigated using dynamic 2-bit branch predictors.`,
        handwritingFont: 'Indie Flower, cursive',
        inkColor: '#0f172a', // Fountain Black
    },
    {
        id: 'chemistry',
        title: 'Chemistry Titration',
        beforeText: `EXPERIMENT 02: REDOX TITRATION OF STANDARD OXALIC ACID
Procedure: Pipette out exactly 20.0 mL of 0.05 M oxalic acid into the conical flask.
Acidification: Add one test tube of 2N dilute sulfuric acid to prevent MnO2 precipitation.
Heating: Warm the contents gently to 60°C - 70°C before commencing burette titration.
Titration: Run KMnO4 solution dropwise with constant swirling until pale permanent pink.
Endpoint: Concordant burette reading noted at V = 19.8 mL with zero meniscus error.`,
        afterText: `EXPERIMENT 02: REDOX TITRATION OF STANDARD OXALIC ACID
Procedure: Pipette out exactly 20.0 mL of 0.05 M oxalic acid into the conical flask.
Acidification: Add one test tube of 2N dilute sulfuric acid to prevent MnO2 precipitation.
Heating: Warm the contents gently to 60°C - 70°C before commencing burette titration.
Titration: Run KMnO4 solution dropwise with constant swirling until pale permanent pink.
Endpoint: Concordant burette reading noted at V = 19.8 mL with zero meniscus error.`,
        handwritingFont: 'Cedarville Cursive, cursive',
        inkColor: '#0369a1', // Gel Blue
    },
];

interface BeforeAfterSliderProps {
    hideHeader?: boolean;
    className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
    hideHeader = false,
    className = ''
}) => {
    const [sliderPos, setSliderPos] = useState(50);
    const [selectedPreset, setSelectedPreset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const preset = COMPARISON_PRESETS[selectedPreset];

    const updatePosition = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
        setSliderPos(pct);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            updatePosition(e.clientX);
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging || !e.touches[0]) return;
            updatePosition(e.touches[0].clientX);
        };
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleMouseUp);
            window.addEventListener('touchcancel', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
            window.removeEventListener('touchcancel', handleMouseUp);
        };
    }, [isDragging, updatePosition]);

    return (
        <div className={`w-full max-w-5xl mx-auto select-none ${className}`}>
            {/* Header & Preset Switcher */}
            {!hideHeader ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-black tracking-wide uppercase mb-1.5">
                            <Sparkles size={12} className="text-violet-600" />
                            <span>Side-by-Side Comparison</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black font-display text-neutral-900 tracking-tight">
                            Mechanical Type vs. text2handwriting.me Handwriting
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                            Drag the center slider to compare the typed layout with handwriting-style variation, ink, and margin treatments.
                        </p>
                    </div>

                    {/* Preset Pills */}
                    <div className="flex items-center gap-1.5 bg-neutral-100/80 p-1 rounded-2xl border border-neutral-200/80 self-stretch sm:self-auto overflow-x-auto">
                        {COMPARISON_PRESETS.map((p, idx) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setSelectedPreset(idx)}
                                aria-pressed={selectedPreset === idx}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 ${
                                    selectedPreset === idx
                                        ? 'bg-white text-neutral-950 shadow-xs border border-black/5'
                                        : 'text-neutral-600 hover:text-neutral-900'
                                }`}
                            >
                                {p.title.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <span className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">
                        Select Subject Sample:
                    </span>
                    <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
                        {COMPARISON_PRESETS.map((p, idx) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setSelectedPreset(idx)}
                                aria-pressed={selectedPreset === idx}
                                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 ${
                                    selectedPreset === idx
                                        ? 'bg-white text-stone-950 shadow-xs font-extrabold'
                                        : 'text-stone-600 hover:text-stone-900'
                                }`}
                            >
                                {p.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Comparison Canvas Card */}
            <div
                ref={containerRef}
                className="relative h-[340px] sm:h-[440px] rounded-3xl overflow-hidden shadow-2xl border border-neutral-300 ring-1 ring-black/5 cursor-ew-resize select-none touch-pan-y bg-stone-100"
                onMouseDown={(e) => {
                    updatePosition(e.clientX);
                    setIsDragging(true);
                }}
                onTouchStart={(e) => {
                    if (e.touches[0]) updatePosition(e.touches[0].clientX);
                    setIsDragging(true);
                }}
                role="slider"
                tabIndex={0}
                aria-label="Comparison position"
                aria-valuemin={5}
                aria-valuemax={95}
                aria-valuenow={Math.round(sliderPos)}
                aria-valuetext={`${Math.round(sliderPos)}% handwriting-style preview visible`}
                onKeyDown={(e) => {
                    const next = (value: number) => setSliderPos(Math.max(5, Math.min(95, value)));
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        next(sliderPos - 5);
                    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        next(sliderPos + 5);
                    } else if (e.key === 'Home') {
                        e.preventDefault();
                        next(5);
                    } else if (e.key === 'End') {
                        e.preventDefault();
                        next(95);
                    }
                }}
            >
                {/* 1. RIGHT SIDE / BACKGROUND: REALISTIC HANDWRITTEN NOTEBOOK */}
                <div className="absolute inset-0 bg-[#fffdfa] overflow-hidden flex flex-col justify-between p-4 sm:p-10 z-10">
                    {/* Ruled lines pattern */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-45"
                        style={{
                            backgroundImage: 'linear-gradient(to bottom, transparent 31px, #93c5fd 32px)',
                            backgroundSize: '100% 32px',
                        }}
                    />

                    {/* Red left margin line */}
                    <div className="absolute top-0 bottom-0 left-12 sm:left-16 w-[1.5px] bg-red-400 opacity-60 pointer-events-none" />

                    {/* Badge */}
                    <div className="relative z-10 self-end">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-black shadow-xs">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            text2handwriting.me Organic Handwriting
                        </span>
                    </div>

                    {/* Handwritten Content */}
                    <div className="relative z-10 pl-6 sm:pl-12 max-w-2xl">
                        <div
                            style={{
                                fontFamily: preset.handwritingFont,
                                color: preset.inkColor,
                                lineHeight: '32px',
                            }}
                            className="text-base sm:text-xl font-normal whitespace-pre-wrap select-none leading-[32px] tracking-wide"
                        >
                            {preset.afterText}
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between text-[10px] sm:text-xs text-neutral-400 font-mono">
                        <span>Classmate 30-Line Ruled Register</span>
                        <span className="hidden sm:inline">Organic micro-jitter: Active</span>
                    </div>
                </div>

                {/* 2. LEFT SIDE / FOREGROUND CLIP: STERILE DIGITAL TYPED TEXT */}
                <div
                    className="absolute inset-0 bg-[#f8fafc] border-r-2 border-violet-600 overflow-hidden flex flex-col justify-between p-4 sm:p-10 z-20 pointer-events-none"
                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                    {/* Faint terminal / digital grid */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-20"
                        style={{
                            backgroundImage: 'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    />

                    {/* Badge */}
                    <div className="relative z-10 self-start">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/90 border border-slate-300 text-slate-700 text-[11px] font-black shadow-xs font-mono">
                            <FileText size={12} />
                            Sterile Computer Typed Text
                        </span>
                    </div>

                    {/* Digital Rigid Monospace Content */}
                    <div className="relative z-10 font-mono text-xs sm:text-sm text-slate-800 max-w-2xl whitespace-pre-wrap leading-[32px] select-none">
                        {preset.beforeText}
                    </div>

                    <div className="relative z-10 text-[10px] sm:text-xs text-slate-500 font-mono">
                        <span>Raw Digital Monospace Font (Courier New / Consolas)</span>
                    </div>
                </div>

                {/* 3. CENTER DRAGGABLE SPLITTER BAR */}
                <div
                    className="absolute top-0 bottom-0 z-30 pointer-events-none flex items-center justify-center -translate-x-1/2"
                    style={{ left: `${sliderPos}%` }}
                >
                    {/* Vertical Divider Line */}
                    <div className="w-[3px] h-full bg-gradient-to-b from-violet-500 via-indigo-600 to-cyan-500 shadow-lg" />

                    {/* Floating 3D Circular Handle */}
                    <div
                        className={`absolute w-10 h-10 rounded-full bg-white text-neutral-900 border-2 border-violet-600 shadow-xl flex items-center justify-center transition-transform pointer-events-auto cursor-grab active:cursor-grabbing ${
                            isDragging ? 'scale-115 ring-4 ring-violet-500/30' : 'hover:scale-108'
                        }`}
                    >
                        <MoveHorizontal size={18} className="text-violet-700" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BeforeAfterSlider;
