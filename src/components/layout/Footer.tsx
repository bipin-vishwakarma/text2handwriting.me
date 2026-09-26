import { Github, PenTool, Heart } from 'lucide-react';
import SiteLogo from '../common/SiteLogo';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';

export default function Footer() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    return (
        <motion.footer 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="pt-16 sm:pt-24 pb-8 border-t border-black/5 relative overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-10 lg:gap-8 mb-12 sm:mb-16">
                    {/* Brand Column */}
                    <motion.div variants={itemVariants} className="col-span-2 lg:col-span-4">
                        <Link to="/" className="flex min-w-0 items-center gap-3 mb-6 group">
                             <SiteLogo size={38} />
                             <span className="min-w-0 text-xl sm:text-2xl font-display font-bold tracking-tight text-neutral-900 break-words">text2handwriting.me</span>
                        </Link>
                        <p className="text-neutral-500 leading-relaxed max-w-sm text-sm font-medium">
                            A handwriting-style document editor with paper, ink, layout, and presentation controls.
                        </p>
                    </motion.div>

                    {/* Navigation Columns */}
                    <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2">
                        <h2 className="font-black text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6 focus:outline-none">Product</h2>
                        <ul className="space-y-4">
                            <li><Link to="/pricing/" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Export Pricing</Link></li>
                            <li><Link to="/#features" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Features</Link></li>
                            <li><Link to="/#how-it-works" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">How It Works</Link></li>
                            <li><Link to="/editor" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold text-left group flex items-center gap-2">Editor Studio <span className="w-1 h-1 rounded-full bg-neutral-200 group-hover:bg-indigo-500 transition-colors" /></Link></li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2">
                        <h2 className="font-black text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6">Support</h2>
                        <ul className="space-y-3">
                            <li><Link to="/about" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">About Us</Link></li>
                            <li><Link to="/support" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Support & Contact</Link></li>
                            <li><Link to="/faq" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">FAQ</Link></li>
                            <li><Link to="/changelog" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Changelog</Link></li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2">
                        <h2 className="font-black text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6">Legal</h2>
                        <ul className="space-y-3">
                            <li><Link to="/privacy" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Terms of Service</Link></li>
                            <li><Link to="/refund" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Refund & Cancellation</Link></li>
                            <li><Link to="/disclaimer" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Disclaimer</Link></li>
                            <li><Link to="/cookies" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Cookie Policy</Link></li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2">
                        <h2 className="font-black text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6 focus:outline-none">Links</h2>
                        <ul className="space-y-3">
                            <li><a href="https://github.com/bipin-vishwakarma" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-purple-600 transition-colors flex items-center gap-3 text-sm font-bold"><Github size={14} /> GitHub Profile</a></li>
                            <li><a href="https://github.com/bipin-vishwakarma/text2handwriting.me" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-3 text-sm font-bold"><PenTool size={14} /> Repository</a></li>
                        </ul>
                    </motion.div>
                </div>

                <nav aria-label="Handwriting guides" className="mb-10 border-t border-black/5 pt-6">
                    <h2 className="font-bold text-sm mb-4">Handwriting guides</h2>
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm text-neutral-600">
                        {[
                            ['text-to-cursive', 'Text to cursive'],
                            ['assignment-maker-online', 'Assignment formatting'],
                            ['realistic-handwriting-generator', 'Handwriting styling'],
                            ['typed-text-to-handwritten-notes', 'Typed text to handwritten notes'],
                            ['practical-record-formatting-guide', 'Practical record formatting'],
                            ['print-ready-handwritten-pdf-guide', 'Print-ready PDF checklist'],
                        ].map(([path, label]) => <li key={path}><Link className="underline underline-offset-4 hover:text-neutral-950" to={`/${path}/`}>{label}</Link></li>)}
                    </ul>
                </nav>
                {/* Bottom Bar */}
                <div className="border-t border-black/5 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-4 text-center sm:text-left">
                        <p className="text-xs text-neutral-400 font-bold">
                            &copy; {new Date().getFullYear()} text2handwriting.me. Open Source.
                        </p>
                        <a href="https://github.com/bipin-vishwakarma/text2handwriting.me" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-neutral-900 transition-colors" title="View Source on GitHub">
                            <Github size={14} />
                        </a>
                    </div>
                    <p className="text-xs text-neutral-400 font-bold flex flex-wrap items-center justify-center gap-2 text-center sm:text-left">
                        Crafted with <Heart size={12} className="text-rose-500 fill-current" /> by <a href="https://github.com/bipin-vishwakarma" target="_blank" rel="noopener noreferrer" className="text-neutral-900 hover:underline underline-offset-4 font-black">Bipin Vishwakarma</a>
                    </p>
                </div>
            </div>
        </motion.footer>
    );
}
