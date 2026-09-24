import { useLayoutEffect, useRef } from 'react';

/** Anchor ruling to the browser's actual font baseline, not the card's padding. */
export default function RuledPreviewText({ text, font, ink, variation }: {
    text: string; font: string; ink: string; variation: boolean;
}) {
    const textRef = useRef<HTMLDivElement>(null);
    const baselineRef = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        let disposed = false;
        const align = () => {
            const element = textRef.current;
            const marker = baselineRef.current;
            if (disposed || !element || !marker) return;
            const baseline = marker.getBoundingClientRect().top - element.getBoundingClientRect().top;
            element.style.backgroundPositionY = `${baseline - 31}px`;
        };
        align();
        void document.fonts.ready.then(align);
        document.fonts.addEventListener('loadingdone', align);
        const observer = new ResizeObserver(align);
        if (textRef.current) observer.observe(textRef.current);
        return () => {
            disposed = true;
            observer.disconnect();
            document.fonts.removeEventListener('loadingdone', align);
        };
    }, [font]);

    return (
        <div ref={textRef} className="relative z-10 pl-8 text-lg sm:text-xl font-normal whitespace-pre-wrap select-none break-words"
            style={{ fontFamily: font, color: ink, lineHeight: '32px',
                backgroundImage: 'linear-gradient(to bottom, transparent 31px, rgb(147 197 253 / .4) 31px)',
                backgroundSize: '100% 32px', letterSpacing: variation ? '0.15px' : 'normal' }}>
            <span ref={baselineRef} aria-hidden="true" style={{ display: 'inline-block', width: 0, height: 0, verticalAlign: 'baseline' }} />{text}
        </div>
    );
}
