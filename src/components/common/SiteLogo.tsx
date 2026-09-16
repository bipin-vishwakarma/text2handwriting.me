import React from 'react';

interface SiteLogoProps {
    size?: number;
    className?: string;
    variant?: 'icon' | 'full';
    showBetaBadge?: boolean;
    animated?: boolean;
}

export const SiteLogo: React.FC<SiteLogoProps> = ({
    size = 36,
    className = '',
    variant = 'icon',
    showBetaBadge = false,
    animated = true,
}) => {
    // Unique ID prefix to avoid SVG filter/gradient collisions across instances
    const id = React.useId().replace(/:/g, '');

    const iconSvg = (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`shrink-0 overflow-visible transition-transform duration-300 ${
                animated ? 'hover:scale-110 active:scale-95' : ''
            }`}
            aria-label="text2handwriting.me Logo"
        >
            <style>{`
                @keyframes inkFlow_${id} {
                    0% { stroke-dashoffset: 260; }
                    100% { stroke-dashoffset: 0; }
                }
                @keyframes goldPulse_${id} {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                @keyframes auraPulse_${id} {
                    0%, 100% { opacity: 0.25; transform: scale(0.96); }
                    50% { opacity: 0.55; transform: scale(1.08); }
                }
                .logo-trail-anim-${id} {
                    stroke-dasharray: 130 45;
                    animation: inkFlow_${id} 4.5s linear infinite;
                }
                .logo-gold-nib-${id} {
                    transform-origin: 50px 22px;
                    animation: goldPulse_${id} 2.8s ease-in-out infinite;
                }
                .logo-glow-aura-${id} {
                    transform-origin: 50px 50px;
                    animation: auraPulse_${id} 3.2s ease-in-out infinite;
                }
            `}</style>

            <defs>
                {/* Vibrant gradient for a fluid pen stroke */}
                <linearGradient id={`trailGrad-${id}`} x1="14" y1="84" x2="88" y2="18" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="35%" stopColor="#3b82f6" />
                    <stop offset="70%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>

                {/* 24K Luxury Gold Nib Gradient */}
                <linearGradient id={`goldNibGrad-${id}`} x1="36" y1="10" x2="64" y2="46" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="25%" stopColor="#fde047" />
                    <stop offset="65%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                </linearGradient>

                {/* Platinum Nib Facet Gradient */}
                <linearGradient id={`platFacet-${id}`} x1="42" y1="14" x2="58" y2="44" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#64748b" />
                </linearGradient>

                {/* Ambient Halo Glow */}
                <filter id={`haloGlow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Ambient Back Glow */}
            <circle
                cx="50"
                cy="50"
                r="38"
                fill={`url(#trailGrad-${id})`}
                opacity="0.2"
                filter={`url(#haloGlow-${id})`}
                className={animated ? `logo-glow-aura-${id}` : ''}
            />

            {/* Background Ink Ribbon Shadow */}
            <path
                d="M 20 78 C 14 62, 28 44, 46 44 C 64 44, 82 56, 84 72 C 86 86, 68 90, 52 82 C 34 72, 38 48, 50 32"
                stroke="#0f172a"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.12"
            />

            {/* Main Fluid Ink Ribbon (Dynamic Infinity & Calligraphy Loop) */}
            <path
                d="M 18 76 C 12 58, 28 40, 48 40 C 66 40, 84 54, 84 70 C 84 84, 68 88, 52 80 C 34 70, 36 46, 50 28"
                stroke={`url(#trailGrad-${id})`}
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={animated ? `logo-trail-anim-${id}` : ''}
            />

            {/* Crisp Top Specular Highlight on Ribbon */}
            <path
                d="M 22 72 C 18 58, 30 43, 48 43 C 64 43, 79 54, 80 66"
                stroke="#ffffff"
                strokeWidth="2.4"
                strokeLinecap="round"
                opacity="0.8"
            />

            
        </svg>
    );

    if (variant === 'icon') {
        return (
            <div className={`inline-flex items-center justify-center ${className}`}>
                {iconSvg}
            </div>
        );
    }

    return (
        <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
            <div className="relative flex items-center justify-center">
                {iconSvg}
            </div>

            <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                    <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-neutral-900 leading-none">
                        Text<span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">2Handwriting</span>
                        <span className="text-violet-600 font-serif">.</span>
                    </span>

                    {showBetaBadge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-md shadow-xs">
                            Beta
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SiteLogo;
