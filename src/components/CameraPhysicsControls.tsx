import React from 'react';
import { useStore } from '../lib/store';
import type { LightingMode, PaperCrease } from '../types';
import { Camera, Smartphone, Maximize2, RotateCcw, Dices, Copy } from 'lucide-react';

export const CameraPhysicsControls: React.FC = () => {
    const {
        phoneShadow, setPhoneShadow,
        phoneShadowAngle, setPhoneShadowAngle,
        phoneShadowIntensity, setPhoneShadowIntensity,
        phoneShadowVariation, setPhoneShadowVariation,
        perspectiveWarp, setPerspectiveWarp,
        tiltX, setTiltX,
        tiltY, setTiltY,
        lightingMode, setLightingMode,
        lightingWarmth, setLightingWarmth,
        paperCrease, setPaperCrease,
        sensorNoise, setSensorNoise,
        randomTilt, setRandomTilt,
        spiralBinding, setSpiralBinding,
        inkBleedThrough, setInkBleedThrough,
        inkBleedIntensity, setInkBleedIntensity,
        activePageIndex,
        effectScope, setEffectScope,
        pageEffectOverrides, setPageEffectOverride,
        applyPageEffectsToAll,
        resetEffects,
        randomizeRealism,
    } = useStore();

    // Check if active page has any overrides
    const currentPageOverrides = pageEffectOverrides[activePageIndex] || {};
    const effectiveCrease = effectScope === 'current' && currentPageOverrides.paperCrease !== undefined
        ? currentPageOverrides.paperCrease
        : paperCrease;
    const effectivePhoneShadow = effectScope === 'current' && currentPageOverrides.phoneShadow !== undefined
        ? currentPageOverrides.phoneShadow
        : phoneShadow;
    const effectivePhoneShadowAngle = effectScope === 'current' && currentPageOverrides.phoneShadowAngle !== undefined
        ? currentPageOverrides.phoneShadowAngle
        : phoneShadowAngle;
    const effectivePhoneShadowIntensity = effectScope === 'current' && currentPageOverrides.phoneShadowIntensity !== undefined
        ? currentPageOverrides.phoneShadowIntensity
        : phoneShadowIntensity;

    const handleSetCrease = (crease: PaperCrease) => {
        if (effectScope === 'current') {
            setPageEffectOverride(activePageIndex, { paperCrease: crease });
        } else {
            setPaperCrease(crease);
        }
    };

    const handleSetPhoneShadow = (enabled: boolean) => {
        if (effectScope === 'current') {
            setPageEffectOverride(activePageIndex, { phoneShadow: enabled });
        } else {
            setPhoneShadow(enabled);
        }
    };

    const handleSetPhoneShadowAngle = (angle: number) => {
        if (effectScope === 'current') {
            setPageEffectOverride(activePageIndex, { phoneShadowAngle: angle });
        } else {
            setPhoneShadowAngle(angle);
        }
    };

    const handleSetPhoneShadowIntensity = (intensity: number) => {
        if (effectScope === 'current') {
            setPageEffectOverride(activePageIndex, { phoneShadowIntensity: intensity });
        } else {
            setPhoneShadowIntensity(intensity);
        }
    };

    const lightingModes: { id: LightingMode; label: string; icon: string }[] = [
        { id: 'warm-lamp', label: 'Desk Lamp', icon: '🛋️' },
        { id: 'cool-daylight', label: 'Daylight', icon: '☀️' },
        { id: 'flash', label: 'Camera Flash', icon: '⚡' },
        { id: 'scanner-contrast', label: 'Scanner', icon: '📄' },
        { id: 'flat', label: 'Flat Scan', icon: '🖨️' },
    ];

    const creaseOptions: { id: PaperCrease; label: string }[] = [
        { id: 'none', label: 'Clean' },
        { id: 'center-h', label: 'Half Fold' },
        { id: 'cross', label: 'Quarter Fold' },
        { id: 'corner-fold', label: 'Dog-Ear' },
        { id: 'letter-tri-fold', label: 'Tri-Fold' },
        { id: 'crumpled', label: 'Crumpled' },
        { id: 'spiral-holes', label: 'Spiral Holes' },
        { id: 'diagonal-crease', label: 'Diagonal' },
        { id: 'vintage-worn', label: 'Vintage Worn' },
    ];

    return (
        <div className="space-y-4">
            {/* Header & Quick Action Buttons */}
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <div className="flex items-center gap-1.5">
                    <Camera size={13} className="text-neutral-500" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-neutral-600">Camera & Effects</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={randomizeRealism}
                        title="Roll organic human realism (angles, jitter, natural flaws)"
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/60 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    >
                        <Dices size={12} className="text-amber-700" />
                        <span>Randomize 🎲</span>
                    </button>
                    <button
                        type="button"
                        onClick={resetEffects}
                        title="Reset all camera & visual effects to defaults"
                        className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                        <RotateCcw size={11} />
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            {/* Scope Pill: Current Page vs All Pages */}
            <div className="bg-neutral-100 p-1 rounded-xl flex items-center gap-1 text-[10px] font-bold">
                <button
                    type="button"
                    onClick={() => setEffectScope('all')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                        effectScope === 'all'
                            ? 'bg-white text-neutral-900 shadow-2xs'
                            : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                >
                    📚 Apply to All Pages
                </button>
                <button
                    type="button"
                    onClick={() => setEffectScope('current')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                        effectScope === 'current'
                            ? 'bg-white text-indigo-700 shadow-2xs'
                            : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                >
                    📄 Page {activePageIndex + 1} Only
                </button>
            </div>

            {effectScope === 'current' && Object.keys(currentPageOverrides).length > 0 && (
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[10px]">
                    <span className="text-indigo-800 font-medium">Page {activePageIndex + 1} has custom overrides</span>
                    <button
                        type="button"
                        onClick={() => applyPageEffectsToAll(activePageIndex)}
                        className="text-indigo-600 hover:text-indigo-900 font-bold flex items-center gap-1"
                        title="Apply this page's custom effects to all other pages"
                    >
                        <Copy size={11} /> Apply to All
                    </button>
                </div>
            )}

            {/* 1. Phone Cast Shadow Toggle & Controls */}
            <div className="bg-neutral-50 p-3 rounded-2xl space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                        <Smartphone size={14} className="text-neutral-500" />
                        <span className="text-[11px] font-bold text-neutral-800">Phone Cast Shadow</span>
                    </div>
                    <input
                        type="checkbox"
                        checked={effectivePhoneShadow}
                        onChange={(e) => handleSetPhoneShadow(e.target.checked)}
                        className="w-4 h-4 rounded border-black/10 text-neutral-900 focus:ring-0 cursor-pointer accent-neutral-900"
                    />
                </label>

                {effectivePhoneShadow && (
                    <div className="space-y-2.5 pt-1 border-t border-black/5">
                        <div>
                            <div className="flex justify-between text-[9px] font-bold text-neutral-400 uppercase tracking-tighter mb-1">
                                <span>Shadow Angle</span>
                                <span className="text-neutral-800">{effectivePhoneShadowAngle}°</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                step="15"
                                value={effectivePhoneShadowAngle}
                                onChange={(e) => handleSetPhoneShadowAngle(Number(e.target.value))}
                                className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-[9px] font-bold text-neutral-400 uppercase tracking-tighter mb-1">
                                <span>Shadow Intensity</span>
                                <span className="text-neutral-800">{Math.round(effectivePhoneShadowIntensity * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="0.8"
                                step="0.05"
                                value={effectivePhoneShadowIntensity}
                                onChange={(e) => handleSetPhoneShadowIntensity(Number(e.target.value))}
                                className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                            />
                        </div>

                        {/* Per-Page Shadow Variations Toggle */}
                        <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-black/5">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-neutral-800">Per-Page Shadow Variations</span>
                                <span className="text-[9px] text-neutral-400">Natural shift in shadow angle, distance & position for each sheet</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={phoneShadowVariation}
                                onChange={(e) => setPhoneShadowVariation(e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-black/10 text-neutral-900 focus:ring-0 cursor-pointer accent-neutral-900"
                            />
                        </label>
                    </div>
                )}
            </div>

            {/* 2. 3D Perspective Tilt Toggle & Sliders */}
            <div className="bg-neutral-50 p-3 rounded-2xl space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                        <Maximize2 size={14} className="text-neutral-500" />
                        <span className="text-[11px] font-bold text-neutral-800">3D Camera Tilt (Angle)</span>
                    </div>
                    <input
                        type="checkbox"
                        checked={perspectiveWarp}
                        onChange={(e) => setPerspectiveWarp(e.target.checked)}
                        className="w-4 h-4 rounded border-black/10 text-neutral-900 focus:ring-0"
                    />
                </label>

                {perspectiveWarp && (
                    <div className="space-y-2.5 pt-1 border-t border-black/5">
                        <div>
                            <div className="flex justify-between text-[9px] font-bold text-neutral-400 uppercase tracking-tighter mb-1">
                                <span>Camera Pitch (X Tilt)</span>
                                <span className="text-neutral-800">{tiltX}°</span>
                            </div>
                            <input
                                type="range"
                                min="-10"
                                max="10"
                                step="1"
                                value={tiltX}
                                onChange={(e) => setTiltX(Number(e.target.value))}
                                className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-[9px] font-bold text-neutral-400 uppercase tracking-tighter mb-1">
                                <span>Camera Yaw (Y Tilt)</span>
                                <span className="text-neutral-800">{tiltY}°</span>
                            </div>
                            <input
                                type="range"
                                min="-10"
                                max="10"
                                step="1"
                                value={tiltY}
                                onChange={(e) => setTiltY(Number(e.target.value))}
                                className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                            />
                        </div>

                        {/* Random Handheld Variation Toggle */}
                        <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-black/5">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-neutral-800">Random Angle per Page</span>
                                <span className="text-[9px] text-neutral-400">Natural handheld variation for each sheet</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={randomTilt}
                                onChange={(e) => setRandomTilt(e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-black/10 text-neutral-900 focus:ring-0"
                            />
                        </label>
                    </div>
                )}
            </div>

            {/* 3. Room Lighting Mode */}
            <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-1.5 block">
                    Room Lighting Environment
                </span>
                <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-1 rounded-xl">
                    {lightingModes.map((lm) => (
                        <button
                            key={lm.id}
                            type="button"
                            onClick={() => setLightingMode(lm.id)}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
                                lightingMode === lm.id
                                    ? 'bg-white text-neutral-900 shadow-xs'
                                    : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                        >
                            <span className="text-xs">{lm.icon}</span>
                            <span className="truncate">{lm.label}</span>
                        </button>
                    ))}
                </div>

                {lightingMode === 'warm-lamp' && (
                    <div className="mt-2">
                        <div className="flex justify-between text-[9px] font-bold text-neutral-400 uppercase tracking-tighter mb-1">
                            <span>Lamp Warmth (Tungsten 2900K)</span>
                            <span className="text-neutral-800">{Math.round(lightingWarmth * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="0.9"
                            step="0.05"
                            value={lightingWarmth}
                            onChange={(e) => setLightingWarmth(Number(e.target.value))}
                            className="w-full h-1 bg-amber-200/50 rounded-full appearance-none accent-amber-600 cursor-pointer"
                        />
                    </div>
                )}
            </div>

            {/* 4. Paper Creases & Folds */}
            <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-1.5 block">
                    Paper Folds & Creases
                </span>
                <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-1 rounded-xl">
                    {creaseOptions.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSetCrease(c.id)}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all ${
                                effectiveCrease === c.id
                                    ? 'bg-white text-neutral-900 shadow-xs'
                                    : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 5.1. 3D Twin-Wire Spiral Binding Toggle */}
            <div className="bg-neutral-50 border border-neutral-200/80 p-3 rounded-2xl">
                <label className="flex items-center justify-between cursor-pointer">
                    <div>
                        <span className="text-[11px] font-bold text-neutral-900 block">3D Spiral Binding (Twin-Wire)</span>
                        <span className="text-[9px] text-neutral-500 block">Metallic silver loops with Left/Right page parity</span>
                    </div>
                    <input
                        type="checkbox"
                        checked={spiralBinding}
                        onChange={(e) => setSpiralBinding(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
                    />
                </label>
            </div>

            {/* 5.2. Reverse-Page Ink Ghosting (Bleed-Through) */}
            <div className="bg-neutral-50 border border-neutral-200/80 p-3 rounded-2xl space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                    <div>
                        <span className="text-[11px] font-bold text-neutral-900 block">Reverse-Page Ink Ghosting</span>
                        <span className="text-[9px] text-neutral-500 block">Faint mirrored show-through on 65 GSM paper</span>
                    </div>
                    <input
                        type="checkbox"
                        checked={inkBleedThrough}
                        onChange={(e) => setInkBleedThrough(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
                    />
                </label>
                {inkBleedThrough && (
                    <div className="pt-1 border-t border-neutral-200/60">
                        <div className="flex justify-between text-[9px] font-bold text-neutral-400 uppercase tracking-tighter mb-1">
                            <span>Ghosting Opacity</span>
                            <span className="text-neutral-900 font-mono">{Math.round(inkBleedIntensity * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.04"
                            max="0.28"
                            step="0.02"
                            value={inkBleedIntensity}
                            onChange={(e) => setInkBleedIntensity(Number(e.target.value))}
                            className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                        />
                    </div>
                )}
            </div>

            {/* 6. Sensor Noise & Vignette */}
            <div>
                <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-1.5">
                    <span>Camera Sensor Noise (Grain)</span>
                    <span className="text-neutral-900 font-black">{Math.round(sensorNoise * 100)}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="0.35"
                    step="0.05"
                    value={sensorNoise}
                    onChange={(e) => setSensorNoise(Number(e.target.value))}
                    className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                />
            </div>
        </div>
    );
};
