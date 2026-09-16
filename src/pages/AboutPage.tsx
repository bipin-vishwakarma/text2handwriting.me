import { motion } from 'framer-motion';
import { Sparkles, Shield, FlaskConical, GraduationCap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MagneticButton from '../components/ui/MagneticButton';
import { Helmet } from 'react-helmet-async';

export default function AboutPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 relative overflow-hidden bg-[#FAF8F5] text-stone-900 selection:bg-violet-200 selection:text-violet-900">
            <Helmet>
                <title>About Us | Text2Handwriting</title>
                <meta name="description" content="The story behind Text2Handwriting. Built for students, by a student, to bring organic realism back to digital documents." />
                <link rel="canonical" href="https://text2handwriting.me/about" />
            </Helmet>

            {/* Decorative Background */}
            <div className="pointer-events-none -z-10 absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" />
            </div>

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                {/* Hero Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm text-stone-600 font-medium text-sm mb-6">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Our Story</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black text-stone-900 mb-6 tracking-tight leading-[1.1]">
                        Bringing the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">soul of ink</span><br/> back to digital.
                    </h1>
                    <p className="text-lg sm:text-xl text-stone-500 font-serif italic max-w-2xl mx-auto leading-relaxed">
                        Built to make handwritten-style documents easier to format, personalize, preview, and print.
                    </p>
                </motion.div>

                {/* The Mission (Split Layout) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl font-display font-black text-stone-900">
                            The analog era isn't dead. It just needed an upgrade.
                        </h2>
                        <div className="prose prose-stone prose-lg text-stone-600 leading-relaxed">
                            <p>
                                Digital tools are efficient, but they often lose the warmth and character of handwritten work. We saw an opportunity to make study notes, drafts, and permitted document layouts easier to prepare.
                            </p>
                            <p>
                                <strong>Text2Handwriting</strong> was created by <strong>Bipin Vishwakarma</strong> to bridge analog aesthetics and digital speed. Its controls reproduce variations in spacing, margins, and ink presentation while keeping the author responsible for the content and its permitted use.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-violet-200 to-fuchsia-200 rounded-[2.5rem] blur-3xl opacity-40 transform rotate-6" />
                        <div className="relative bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white">
                            <div className="w-12 h-12 bg-stone-100 rounded-full mb-6 flex items-center justify-center text-xl">✍️</div>
                            <blockquote className="text-2xl font-serif italic text-stone-800 leading-snug mb-6">
                                "The goal wasn't just to make a font look like handwriting. The goal was to make the paper look like it was lived in."
                            </blockquote>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                                    BV
                                </div>
                                <div>
                                    <div className="font-bold text-stone-900">Bipin Vishwakarma</div>
                                    <div className="text-sm text-stone-500">Creator & Developer</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Core Values (Bento Grid) */}
                <div className="mb-32">
                    <h2 className="text-3xl font-display font-black text-center text-stone-900 mb-12">Our Core Principles</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Shield,
                                color: "text-blue-500",
                                bg: "bg-blue-50",
                                title: "Local-First Privacy",
                                desc: "Your assignments are your intellectual property. All rendering happens directly in your browser. We never store your text."
                            },
                            {
                                icon: FlaskConical,
                                color: "text-emerald-500",
                                bg: "bg-emerald-50",
                                title: "Imperfection Engine",
                                desc: "Perfection is a dead giveaway. Our proprietary algorithm injects micro-variations into spacing, rotation, and baseline shifts."
                            },
                            {
                                icon: GraduationCap,
                                color: "text-amber-500",
                                bg: "bg-amber-50",
                                title: "Student-First",
                                desc: "Designed for responsible study, drafting, and presentation. Always follow your institution's rules when preparing work for submission."
                            }
                        ].map((value, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                key={i}
                                className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 hover:shadow-xl hover:border-violet-100 transition-all group"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${value.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <value.icon className={value.color} size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-stone-900 mb-3">{value.title}</h3>
                                <p className="text-stone-600 leading-relaxed">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative bg-stone-900 rounded-[3rem] p-12 sm:p-20 text-center overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.3),transparent_70%)]" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-5xl font-display font-black text-white mb-6">
                            Ready to craft your masterpiece?
                        </h2>
                        <p className="text-stone-400 text-lg mb-10">
                            Open the editor to explore styles and preview your document. Pay only when you choose to export.
                        </p>
                        <Link to="/editor" className="inline-block">
                            <MagneticButton className="px-8 py-4 bg-white hover:bg-stone-100 text-stone-900 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center gap-2 group">
                                Open the Studio
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </MagneticButton>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
