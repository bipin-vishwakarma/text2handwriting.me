import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CookieConsent from '../common/CookieConsent';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingModal from '../modals/OnboardingModal';

export default function RootLayout() {
    const location = useLocation();
    // Treat the canonical and trailing-slash editor URLs as the same workspace.
    // Otherwise the marketing navbar overlays the studio on some deployments.
    const isStudioRoute = location.pathname.replace(/\/+$/, '') === '/editor';

    return (
        <>
            {isStudioRoute ? (
                <div className="w-full h-dvh overflow-hidden bg-[#F3F4F6]">
                    <Outlet />
                </div>
            ) : (
                <div className="min-h-screen flex flex-col relative isolate">
                    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-neutral-950 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white">
                        Skip to main content
                    </a>
                    {/* Global Atmospheric Background */}
                    <div className="mesh-gradient" />
                    <div className="ambient-bg-global" />
                    
                    <Navbar />
                    <main id="main-content" className="flex-1 relative" tabIndex={-1}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                className="w-full h-full origin-top"
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </main>
                    <Footer />
                    <CookieConsent />
                </div>
            )}

            {/* Global Interactive Student Onboarding Tour Modal */}
            <OnboardingModal />
        </>
    );
}
