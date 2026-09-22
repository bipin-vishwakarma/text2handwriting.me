import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export type DockItem<T extends string> = { id: T; label: string; icon: LucideIcon };

interface GlassDockProps<T extends string> {
  items: readonly DockItem<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  compact?: boolean;
}

/** A controlled, accessible dock with one animated active indicator. */
export function GlassDock<T extends string>({ items, value, onChange, ariaLabel, compact = false }: GlassDockProps<T>) {
  const reduceMotion = useReducedMotion();

  return (
    <nav aria-label={ariaLabel} className={`glass-dock ${compact ? 'glass-dock--compact' : ''}`}>
      {items.map((item) => {
        const selected = item.id === value;
        const Icon = item.icon;
        return (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            aria-current={selected ? 'page' : undefined}
            aria-label={`${item.label} controls`}
            whileHover={reduceMotion ? undefined : { y: -2, scale: 1.035 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className={`glass-dock__item ${selected ? 'glass-dock__item--active' : ''}`}
          >
            {selected && <motion.span layoutId={`dock-pill-${ariaLabel}`} className="glass-dock__pill" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
            <Icon size={compact ? 16 : 15} aria-hidden="true" className="relative z-10 shrink-0" />
            <span className="relative z-10 truncate">{item.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
