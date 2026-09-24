import { useState, useEffect, useId, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, ExternalLink } from 'lucide-react';
import SiteLogo from '../common/SiteLogo';
import { useStore } from '../../lib/store';
import UserMenu from '../UserMenu';

export default function Navbar() {
    const isNavbarVisible = useStore(state => state.isNavbarVisible);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('');
    const location = useLocation();
    const mobileMenuId = useId();
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const menuToggleRef = useRef<HTMLButtonElement>(null);

    // Scroll-spy targets on landing page — ordered to match DOM
    const scrollLinks: { name: string; sectionId: string }[] = [
        { name: 'How It Works', sectionId: 'how-it-works' },
        { name: 'Paper Vault', sectionId: 'paper-vault' },
        { name: 'Features', sectionId: 'features' },
        { name: 'FAQ', sectionId: 'faq' },
    ];

    // Always-route links (page navigation)
    const pageLinks: { name: string; path: string }[] = [
        { name: 'Pricing', path: '/pricing' },
        { name: 'About', path: '/about' },
    ];

    const isOnLanding = location.pathname === '/';

    useEffect(() => {
        if (!mobileMenuOpen) return;
        const menu = mobileMenuRef.current;
        const toggle = menuToggleRef.current;
        const desktop = window.matchMedia('(min-width: 768px)');
        const closeOnDesktop = () => {
            if (desktop.matches) setMobileMenuOpen(false);
        };
        const focusable = () => Array.from(menu?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]'
        ) ?? []).filter(element => element.getClientRects().length > 0);
        focusable()[0]?.focus();
        const handleKeys = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                setMobileMenuOpen(false);
            }
            if (event.key !== 'Tab') return;
            const items = focusable();
            const first = items[0];
            const last = items[items.length - 1];
            if (!first) { event.preventDefault(); return; }
            if (!menu?.contains(document.activeElement) ||
                (event.shiftKey && document.activeElement === first) ||
                (!event.shiftKey && document.activeElement === last)) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
            }
        };
        window.addEventListener('keydown', handleKeys);
        desktop.addEventListener('change', closeOnDesktop);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKeys);
            desktop.removeEventListener('change', closeOnDesktop);
            document.body.style.overflow = previousOverflow;
            toggle?.focus({ preventScroll: true });
        };
    }, [mobileMenuOpen]);

    // Scroll spy when on landing page
    useEffect(() => {
        if (!isOnLanding) return;

        const handleScroll = () => {
            const sectionIds = ['how-it-works', 'paper-vault', 'features', 'faq'];
            const scrollPos = window.scrollY + 220;
            for (const id of sectionIds) {
                const el = document.getElementById(id);
                if (el) {
                    const top = el.offsetTop;
                    const height = el.offsetHeight;
                    if (scrollPos >= top && scrollPos < top + height) {
                        setActiveSection(id);
                        return;
                    }
                }
            }
            if (window.scrollY < 350) {
                setActiveSection('');
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isOnLanding]);

    const handleScrollLinkClick = (e: React.MouseEvent, sectionId: string) => {
        if (isOnLanding) {
            e.preventDefault();
            const elem = document.getElementById(sectionId);
            if (elem) {
                elem.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
                window.history.pushState(null, '', `#${sectionId}`);
                setActiveSection(sectionId);
            }
        }
        // If not on landing, let React Router navigate to `/#sectionId` naturally
    };

    const isScrollLinkActive = (sectionId: string) =>
        isOnLanding && activeSection === sectionId;

    const isPageLinkActive = (path: string) =>
        location.pathname === path;

    return (
        <>
            <motion.nav
                initial={false}
                animate={{ 
                    y: isNavbarVisible ? 0 : -120,
                    opacity: isNavbarVisible ? 1 : 0,
                    scale: isNavbarVisible ? 1 : 0.95
                }}
                transition={{ 
                    duration: 0.5, 
                    ease: [0.16, 1, 0.3, 1],
                    opacity: { duration: 0.3 }
                }}
                className="fixed top-3 sm:top-6 left-0 right-0 z-50 px-3 sm:px-6 flex justify-center pointer-events-none"
            >
                <div className="w-full max-w-7xl glass rounded-full px-3 sm:px-6 py-2 sm:py-2.5 flex justify-between items-center pointer-events-auto ring-1 ring-black/5 shadow-lg shadow-black/5">
                    {/* Brand Logo */}
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} aria-label="text2handwriting.me home" className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2.5 group relative">
                        <SiteLogo size={32} />
                        <span className="hidden min-[340px]:block max-w-[116px] truncate whitespace-nowrap text-xs font-display font-black tracking-tight text-neutral-900 min-[430px]:max-w-none min-[430px]:text-base sm:text-xl">text2handwriting.me</span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-1 bg-neutral-100/70 p-1 rounded-full border border-neutral-200/50">
                        {/* Scroll links — scroll on landing, route to `/#section` elsewhere */}
                        {scrollLinks.map((link) => {
                            const isActive = isScrollLinkActive(link.sectionId);
                            return (
                                <Link
                                    key={link.name}
                                    to={isOnLanding ? `#${link.sectionId}` : `/#${link.sectionId}`}
                                    onClick={(e) => handleScrollLinkClick(e, link.sectionId)}
                                    className={`relative px-3 py-1 text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
                                        isActive ? 'text-neutral-950' : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-white rounded-full shadow-xs"
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">{link.name}</span>
                                </Link>
                            );
                        })}

                        {/* Separator */}
                        <span className="w-px h-4 bg-neutral-200/80 mx-0.5" />

                        {/* Page route links */}
                        {pageLinks.map((link) => {
                            const isActive = isPageLinkActive(link.path);
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`relative px-3 py-1 text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
                                        isActive ? 'text-neutral-950' : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-white rounded-full shadow-xs"
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">{link.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Actions & Account */}
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
                        <div className="hidden sm:block">
                            <UserMenu />
                        </div>

                        <Link
                            to="/editor"
                            aria-label="Open Studio"
                            className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 text-xs font-bold text-white shadow-md shadow-violet-600/20 transition-all hover:from-violet-500 hover:to-indigo-500 hover:scale-103 active:scale-97 min-[400px]:px-4 sm:h-auto sm:px-5 sm:py-2 sm:text-sm"
                        >
                            <Sparkles size={13} className="text-yellow-300" />
                            <span className="hidden min-[400px]:inline">Open Studio</span>
                        </Link>

                        {/* Mobile Hamburger Toggle */}
                        <button
                            type="button"
                            ref={menuToggleRef}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden grid h-11 w-11 place-items-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
                            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            aria-expanded={mobileMenuOpen}
                            aria-controls={mobileMenuId}
                        >
                            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                    <button
                        type="button"
                        aria-label="Close navigation menu"
                        className="fixed inset-0 z-30 cursor-default bg-neutral-950/15 backdrop-blur-[2px] md:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <motion.div
                        id={mobileMenuId}
                        ref={mobileMenuRef}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Site navigation"
                        className="fixed inset-x-3 top-18 z-40 max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain md:hidden bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                                Navigation
                            </span>
                            <div className="flex items-center gap-2">
                                <UserMenu />
                                <button type="button" onClick={() => setMobileMenuOpen(false)}
                                    className="grid min-h-11 min-w-11 place-items-center rounded-full hover:bg-neutral-100"
                                    aria-label="Close navigation menu"><X size={18} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {/* Scroll links */}
                            {scrollLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={isOnLanding ? `#${link.sectionId}` : `/#${link.sectionId}`}
                                    onClick={(e) => {
                                        setMobileMenuOpen(false);
                                        handleScrollLinkClick(e, link.sectionId);
                                    }}
                                    className={`flex min-h-11 items-center justify-between rounded-2xl border p-3 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 ${
                                        isScrollLinkActive(link.sectionId)
                                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                            : 'bg-neutral-50 border-neutral-200/70 text-neutral-700 hover:bg-neutral-100'
                                    }`}
                                >
                                    <span>{link.name}</span>
                                </Link>
                            ))}

                            {/* Page links */}
                            {pageLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex min-h-11 items-center justify-between rounded-2xl border p-3 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 ${
                                        isPageLinkActive(link.path)
                                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                            : 'bg-neutral-50 border-neutral-200/70 text-neutral-700 hover:bg-neutral-100'
                                    }`}
                                >
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                        </div>

                        <div className="pt-2 border-t border-neutral-100 grid grid-cols-2 gap-3 text-[11px] font-medium text-neutral-500 min-[430px]:flex min-[430px]:items-center min-[430px]:justify-between">
                            <Link to="/disclaimer" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center rounded-lg hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-violet-700">
                                Disclaimer
                            </Link>
                            <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center rounded-lg hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-violet-700">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center rounded-lg hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-violet-700">
                                Terms
                            </Link>
                            <a
                                href="https://github.com/bipin-vishwakarma/text2handwriting.me"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex min-h-11 items-center gap-1 rounded-lg hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-violet-700"
                            >
                                <span>GitHub</span>
                                <ExternalLink size={10} />
                            </a>
                        </div>
                    </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
