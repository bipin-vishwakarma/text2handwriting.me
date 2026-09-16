import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Instagram, Linkedin, Mail, ExternalLink, Sparkles, Heart, Code2 } from 'lucide-react';

interface CreatorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreatorModal: React.FC<CreatorModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                {/* Modal Window */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden z-10 flex flex-col"
                >
                    {/* Header bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 bg-neutral-50/50">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest text-neutral-400">About the Creator</span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-all cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 sm:p-8 flex flex-col items-center text-center">
                        {/* Avatar Image with verified ring */}
                        <div className="relative mb-5 group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-rose-500 rounded-full blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                            <img
                                src="https://avatars.githubusercontent.com/u/151464007?v=4"
                                alt="Bipin Vishwakarma"
                                onError={(e) => {
                                    // Fallback to GitHub direct avatar
                                    (e.target as HTMLImageElement).src = 'https://github.com/bipin-vishwakarma.png';
                                }}
                                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-xl"
                            />
                            <div className="absolute bottom-1 right-1 bg-amber-400 text-neutral-900 p-1.5 rounded-full shadow-md border-2 border-white">
                                <Sparkles size={14} />
                            </div>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-display font-black text-neutral-900 tracking-tight mb-1">
                            Bipin Vishwakarma
                        </h2>
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-4 flex items-center gap-1.5">
                            <Code2 size={13} /> Creator & Developer · text2handwriting.me
                        </p>

                        <p className="text-sm text-neutral-600 max-w-md leading-relaxed mb-6 font-medium">
                            Biomedical Engineering student at <strong>UPES Dehradun</strong> with a minor in <strong>Artificial Intelligence</strong>. Passionate about creative tech, analog document realism, and building free, privacy-first tools for students and creators.
                        </p>

                        {/* Social Links Grid */}
                        <div className="grid grid-cols-2 gap-2.5 w-full max-w-md mb-6">
                            <a
                                href="https://github.com/bipin-vishwakarma"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2.5 px-4 py-3 bg-neutral-900 hover:bg-black text-white rounded-2xl text-xs font-bold transition-all shadow-sm hover:shadow-md group"
                            >
                                <Github size={16} />
                                <span>GitHub Profile</span>
                                <ExternalLink size={12} className="opacity-40 group-hover:opacity-100 transition-opacity ml-auto" />
                            </a>

                            <a
                                href="https://instagram.com/bipin_vishwakarma"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2.5 px-4 py-3 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white rounded-2xl text-xs font-bold transition-all shadow-sm hover:shadow-md group"
                            >
                                <Instagram size={16} />
                                <span>Instagram</span>
                                <ExternalLink size={12} className="opacity-40 group-hover:opacity-100 transition-opacity ml-auto" />
                            </a>

                            <a
                                href="https://www.linkedin.com/in/bipin-vishwakarma-b407313b8"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2.5 px-4 py-3 bg-[#0A66C2] hover:bg-[#084e96] text-white rounded-2xl text-xs font-bold transition-all shadow-sm hover:shadow-md group"
                            >
                                <Linkedin size={16} />
                                <span>LinkedIn</span>
                                <ExternalLink size={12} className="opacity-40 group-hover:opacity-100 transition-opacity ml-auto" />
                            </a>

                            <a
                                href="mailto:Bipinvishwakarma145@gmail.com"
                                className="flex items-center justify-center gap-2.5 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-2xl text-xs font-bold transition-all shadow-2xs group"
                            >
                                <Mail size={16} className="text-neutral-600" />
                                <span>Email Me</span>
                                <ExternalLink size={12} className="opacity-40 group-hover:opacity-100 transition-opacity ml-auto" />
                            </a>
                        </div>

                        {/* Project Repo Link */}
                        <div className="w-full max-w-md pt-4 border-t border-black/5 flex items-center justify-between text-xs text-neutral-400">
                            <span className="flex items-center gap-1 font-medium">
                                Crafted with <Heart size={12} className="text-rose-500 fill-current" /> in India
                            </span>
                            <a
                                href="https://github.com/bipin-vishwakarma/text2handwriting.me"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-neutral-800 hover:text-indigo-600 transition-colors flex items-center gap-1"
                            >
                                Star on GitHub ⭐
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
