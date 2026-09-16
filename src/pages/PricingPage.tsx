import { motion } from 'framer-motion';
import { Check, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import MagneticButton from '../components/ui/MagneticButton';

export default function PricingPage() {
    return (
        <PageLayout
            maxWidth="max-w-5xl"
            title="Fair pricing for students." 
            subtitle="Stop paying for expensive monthly subscriptions you only use once a semester. Our editor is 100% free to use—you only pay when you export the final PDF."
            seoTitle="Simple Pay-Per-Export Pricing | Text2Handwriting"
            description="Create and preview for free, then export for ₹10 plus ₹2 per page. No subscription or recurring charge."
        >
            <div className="relative max-w-4xl mx-auto mt-8">
                {/* Decorative background glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-[2.5rem] blur-xl opacity-20" />
                
                <div className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-stone-100/50 overflow-hidden flex flex-col lg:flex-row">
                    
                    {/* Left: Value Proposition */}
                    <div className="flex-1 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-stone-100">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-bold mb-6">
                            <Zap className="w-4 h-4" />
                            <span>Pay-As-You-Go</span>
                        </div>
                        
                        <h3 className="text-3xl font-display font-black text-stone-900 mb-4 leading-tight">
                            Create polished, print-ready documents.
                        </h3>
                        
                        <p className="text-stone-600 mb-8 leading-relaxed">
                            Explore the editor and preview your document before paying. When you are ready, pay once for that export—without a subscription or recurring charge.
                        </p>

                        <ul className="space-y-4 mb-8">
                            {[
                                'Handwriting styles and custom font uploads',
                                'Natural spacing and baseline variation controls',
                                'Custom ink colors and paper templates',
                                'Live preview before you export',
                                'High-resolution PDF document export'
                            ].map((feature, i) => (
                                <motion.li 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={i} 
                                    className="flex items-start gap-3"
                                >
                                    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-emerald-600" />
                                    </div>
                                    <span className="text-stone-700 font-medium">{feature}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: The Pricing */}
                    <div className="w-full lg:w-[26rem] bg-stone-50/50 p-8 lg:p-12 flex flex-col justify-center">
                        <div className="mb-2 text-stone-500 font-semibold uppercase tracking-wider text-sm">
                            Per Document Export
                        </div>
                        
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-5xl font-display font-black text-stone-900">₹10</span>
                            <span className="text-stone-500 font-medium">base fee</span>
                        </div>
                        <div className="flex items-center gap-2 text-xl font-bold text-stone-700 mb-8">
                            <span>+</span>
                            <span className="text-3xl font-black text-violet-600">₹2</span>
                            <span className="text-stone-500 text-base font-medium">per page</span>
                        </div>

                        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm mb-8">
                            <div className="flex items-center justify-between text-sm font-semibold mb-2">
                                <span className="text-stone-500">Example: 5-page assignment</span>
                                <span className="text-stone-900">₹20</span>
                            </div>
                            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 w-full" />
                            </div>
                        </div>

                        <Link to="/editor" className="w-full block">
                            <MagneticButton className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-stone-900/20 transition-all flex items-center justify-center gap-2 group">
                                Create Your Document
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </MagneticButton>
                        </Link>
                        
                        <p className="text-center text-xs text-stone-400 mt-4 font-medium flex items-center justify-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" />
                            No credit card required to start
                        </p>
                    </div>
                </div>
            </div>

            {/* Social Proof / Trust */}
            <div className="mt-16 text-center pb-8">
                <p className="text-stone-900 font-bold text-lg">
                    Preview first. Pay only when your document is ready.
                </p>
                <p className="text-stone-500 mt-1">
                    Pricing is shown before checkout: ₹10 base fee + ₹2 per page.
                </p>
            </div>
        </PageLayout>
    );
}

