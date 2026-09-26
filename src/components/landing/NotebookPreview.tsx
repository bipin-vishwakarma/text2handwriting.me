import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { shouldAutoLoadNotebook, type ConnectionHints } from '../../utils/notebookNetwork';
import { ArrowUpRight, RotateCcw } from 'lucide-react';

const NotebookHero3D = lazy(() => import('./NotebookHero3D'));

class PreviewBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

/** Keep first paint lightweight, then enhance on a fast connection after the initial paint. */
export default function NotebookPreview({ activeInk }: { activeInk: string }) {
    const [automatic3D, setAutomatic3D] = useState(false);
    const [manual3D, setManual3D] = useState<boolean | null>(null);
    const show3D = manual3D ?? automatic3D;

    useEffect(() => {
        if (manual3D !== null) return;
        const connection = (navigator as Navigator & { connection?: ConnectionHints & EventTarget }).connection;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let timer: ReturnType<typeof setTimeout> | undefined;
        const update = () => {
            clearTimeout(timer);
            const eligible = shouldAutoLoadNotebook(connection, navigator.onLine, motion.matches);
            if (!eligible) setAutomatic3D(false);
            else timer = setTimeout(() => setAutomatic3D(true), 1200);
        };
        update();
        connection?.addEventListener('change', update);
        motion.addEventListener('change', update);
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        return () => {
            clearTimeout(timer);
            connection?.removeEventListener('change', update);
            motion.removeEventListener('change', update);
            window.removeEventListener('online', update);
            window.removeEventListener('offline', update);
        };
    }, [manual3D]);
    const paper = (
        <div className="notebook-preview" style={{ color: activeInk }}>
            <div className="notebook-preview__spread" aria-label="Handwriting preview: a two-page notebook with study notes">
                <div className="notebook-preview__page notebook-preview__page--left">
                    <span className="notebook-preview__eyebrow">YOUR NEXT CHAPTER</span>
                    <p className="notebook-preview__title">Good ideas.<br />In your style.</p>
                    <svg viewBox="0 0 220 140" className="w-full max-w-56 mx-auto my-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M25 115H205M40 125V15M40 110L175 30" strokeLinecap="round" />
                        <circle cx="75" cy="89" r="4" /><circle cx="110" cy="69" r="4" /><circle cx="145" cy="48" r="4" />
                        <path d="M172 30h-18m21 0-3 18" strokeLinecap="round" />
                    </svg>
                    <p className="notebook-preview__note">A little structure.<br />A lot of possibility.</p>
                    <span className="notebook-preview__folio">01 / THE IDEA</span>
                </div>
                <div className="notebook-preview__binding" aria-hidden="true" />
                <div className="notebook-preview__page notebook-preview__page--right">
                    <span className="notebook-preview__eyebrow">NOTES WORTH KEEPING</span>
                    <p className="notebook-preview__title">Make it yours.</p>
                    <div className="notebook-preview__writing">
                        <p>Start with a thought.</p>
                        <p>Give it room to grow.</p>
                        <p>Choose your ink.</p>
                        <p>Find your rhythm.</p>
                        <p>And turn a blank page</p>
                        <p>into something lovely.</p>
                    </div>
                    <span className="notebook-preview__folio">02 / YOUR WORDS</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative">
            <div className="h-[390px] sm:h-[640px] lg:h-[760px] flex items-center"><div className="w-full">
            {show3D ? (
                <PreviewBoundary fallback={<>{paper}<p role="status" className="text-center text-sm text-stone-600">3D is unavailable in this browser. Your studio still works.</p></>}>
                    <Suspense fallback={paper}><NotebookHero3D activeInk={activeInk} /></Suspense>
                </PreviewBoundary>
            ) : paper}
            </div></div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4">
                <span className="text-xs text-stone-500">{manual3D === null ? (automatic3D ? 'Fast connection · 3D preview' : 'Lightweight preview · 3D on fast connections') : 'Your words. Your paper. Your ink.'}</span>
                <button type="button" onClick={() => setManual3D(!show3D)} aria-pressed={show3D}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 bg-white px-4 text-xs font-bold text-stone-800 hover:border-violet-400 hover:text-violet-700 transition-colors">
                    {show3D ? <RotateCcw size={14} /> : <ArrowUpRight size={14} />}
                    {show3D ? 'Back to still preview' : 'Explore the 3D notebook'}
                </button>
            </div>
        </div>
    );
}
