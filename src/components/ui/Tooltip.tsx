
import React, { useId, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    delay?: number;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, delay = 0.3, position = 'bottom' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tooltipId = useId();

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => setIsVisible(true), delay * 1000);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    return (
        <div
            aria-describedby={isVisible ? tooltipId : undefined}
            className="relative flex items-center justify-center group/tooltip"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        id={tooltipId}
                        role="tooltip"
                        initial={{ opacity: 0, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={ "absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-lg shadow-xl whitespace-nowrap pointer-events-none " +
                        (position === 'top' ? 'bottom-full mb-2 ' : '') + 
                        (position === 'bottom' ? 'top-full mt-2 ' : '') + 
                        (position === 'left' ? 'right-full mr-2 ' : '') + 
                        (position === 'right' ? 'left-full ml-2 ' : '')
                        }
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

