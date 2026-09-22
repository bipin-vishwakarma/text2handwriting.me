import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export interface StyleOption { name: string; label: string }
interface StyleSliderProps { options: readonly StyleOption[]; value: string; onChange: (font: string) => void }

export function StyleSlider({ options, value, onChange }: StyleSliderProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const scroll = (direction: number) => railRef.current?.scrollBy({ left: direction * 220, behavior: reduceMotion ? 'auto' : 'smooth' });

  useEffect(() => {
    const selected = railRef.current?.querySelector<HTMLElement>('[aria-current="true"]');
    selected?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [value, reduceMotion]);

  return (
    <div className="style-slider">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Handwriting Style</span>
        <div className="flex gap-1">
          <button type="button" onClick={() => scroll(-1)} className="style-slider__arrow" aria-label="Previous handwriting styles"><ChevronLeft size={15} /></button>
          <button type="button" onClick={() => scroll(1)} className="style-slider__arrow" aria-label="Next handwriting styles"><ChevronRight size={15} /></button>
        </div>
      </div>
      <div ref={railRef} className="style-slider__rail" aria-label="Choose handwriting style">
        {options.map((option) => {
          const selected = option.name === value;
          return (
            <motion.button
              type="button" key={option.name} onClick={() => onChange(option.name)} aria-current={selected || undefined}
              whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              className={`style-slider__card ${selected ? 'style-slider__card--selected' : ''}`}
            >
              {selected && <motion.span layoutId="style-slider-selected" className="style-slider__outline" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              <span className="relative z-10 text-[11px] font-bold text-stone-800 truncate w-full">{option.name}</span>
              <span className="relative z-10 text-xl leading-tight text-stone-700 truncate w-full" style={{ fontFamily: `'${option.name}', cursive` }}>The quick brown fox</span>
              <span className="relative z-10 text-[10px] text-stone-500 truncate w-full">{option.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
