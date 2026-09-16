import { useState, useEffect, useId } from 'react';
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
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setMobileMenuOpen(false);
        };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
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
                elem.scrollIntoView({ behavior: 'smooth' });
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
                initial={{ y: -100, opacity: 0 }}
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
                <div className="w-full max-w-5xl glass rounded-full px-4 sm:px-6 py-2 sm:py-2.5 flex justify-between items-center pointer-events-auto ring-1 ring-black/5 shadow-lg shadow-black/5">
                    {/* Brand Logo */}
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} aria-label="text2handwriting.me home" className="flex min-w-0 items-center gap-2 sm:gap-2.5 group relative shrink">
                        <SiteLogo size={32} />
                        <span className="hidden min-[430px]:block truncate text-base sm:text-xl font-display font-black text-neutral-900 tracking-tight">text2handwriting.me</span>
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
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="hidden sm:block">
                            <UserMenu />
                        </div>

                        <Link
                            to="/editor"
                            className="px-3.5 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-violet-600/20 hover:from-violet-500 hover:to-indigo-500 hover:scale-103 active:scale-97 transition-all flex items-center gap-1.5 whitespace-nowrap"
                        >
                            <Sparkles size={13} className="text-yellow-300" />
                            <span className="hidden min-[360px]:inline">Open Studio</span>
                            <span className="min-[360px]:hidden">Studio</span>
                        </Link>

                        {/* Mobile Hamburger Toggle */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-1.5 text-neutral-700 hover:text-neutral-950 rounded-full hover:bg-neutral-100 transition-colors"
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
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-3 top-18 z-40 max-h-[calc(100dvh-5.5rem)] overflow-y-auto md:hidden bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                                Navigation
                            </span>
                            <UserMenu />
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
                                    className={`p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
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
                                    className={`p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
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
                            <Link to="/disclaimer" onClick={() => setMobileMenuOpen(false)} className="hover:text-neutral-900">
                                Disclaimer
                            </Link>
                            <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="hover:text-neutral-900">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="hover:text-neutral-900">
                                Terms
                            </Link>
                            <a
                                href="https://github.com/bipin-vishwakarma/text2handwriting.me"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-neutral-900"
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
