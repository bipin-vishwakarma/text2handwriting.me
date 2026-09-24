import React, { useState, useRef, type MouseEvent } from 'react';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    maxTilt?: number;
    glare?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
    children,
    className = '',
    maxTilt = 12,
    glare = true,
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || window.matchMedia('(prefers-reduced-motion: reduce), (hover: none)').matches) return;
        const rect = cardRef.current.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        const xPct = (clientX / rect.width - 0.5) * 2; // -1 to 1
        const yPct = (clientY / rect.height - 0.5) * 2; // -1 to 1

        setTilt({
            x: -yPct * maxTilt,
            y: xPct * maxTilt,
        });

        if (glare) {
            setGlarePos({
                x: (clientX / rect.width) * 100,
                y: (clientY / rect.height) * 100,
                opacity: 0.25,
            });
        }
    };

    const handleMouseEnter = () => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce), (hover: none)').matches) setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0 });
        setGlarePos(prev => ({ ...prev, opacity: 0 }));
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d',
            }}
            className={`transition-transform duration-200 ease-out ${className}`}
        >
            <div
                style={{
                    transform: isHovered
                        ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(10px)`
                        : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
                    transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
                    transformStyle: 'preserve-3d',
                }}
                className="relative w-full h-full rounded-3xl overflow-hidden"
            >
                {children}

                {/* Specular glare overlay */}
                {glare && (
                    <div
                        className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-3xl mix-blend-overlay"
                        style={{
                            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 65%)`,
                            opacity: glarePos.opacity,
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default TiltCard;
