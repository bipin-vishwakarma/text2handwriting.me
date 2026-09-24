import PageLayout from '../components/layout/PageLayout';
import { Rocket, Bug, Star, Clock } from 'lucide-react';

const updates = [
    {
        version: "v2.1.0",
        date: "September 24, 2026",
        type: "Feature Update",
        title: "SEO guides, clearer exports, and product polish",
        description: "Added practical handwriting and print guides, improved static search metadata and link previews, automated SEO regression checks, and refined mobile navigation, account, onboarding, support, and notebook-preview experiences.",
        icon: Star,
        color: "bg-indigo-100 text-indigo-600"
    },
    {
        version: "v2.0.0",
        date: "January 29, 2026",
        type: "Major Release",
        title: "The Atmospheric Update",
        description: "A complete visual overhaul introducing a premium atmospheric background with dot grid and mesh gradients, a new high-end 3D depth system, and global animation orchestration.",
        icon: Star,
        color: "bg-indigo-100 text-indigo-600"
    },
    {
        version: "v1.2.0",
        date: "January 25, 2026",
        type: "Feature",
        title: "Handwriting-style controls",
        description: "Improved spacing, baseline, ink, paper, and variation controls so documents can be formatted and reviewed more precisely before export.",
        icon: Rocket,
        color: "bg-purple-100 text-purple-600"
    },
    {
        version: "v1.1.5",
        date: "January 20, 2026",
        type: "Improvement",
        title: "Performance Optimization",
        description: "Reduced load times by 40% and improved canvas rendering performance for smoother export experience.",
        icon: Star,
        color: "bg-amber-100 text-amber-600"
    },
    {
        version: "v1.1.0",
        date: "January 15, 2026",
        type: "New Feature",
        title: "Local PDF Export",
        description: "You can now export your handwritten documents directly as multi-page PDF files, processed entirely in your browser.",
        icon: Rocket,
        color: "bg-blue-100 text-blue-600"
    },
    {
        version: "v1.0.2",
        date: "January 10, 2026",
        type: "Bug Fix",
        title: "Safari Rendering Fix",
        description: "Fixed a layout issue where text would sometimes overflow on Safari browsers.",
        icon: Bug,
        color: "bg-rose-100 text-rose-600"
    }
];

export default function ChangelogPage() {
    return (
        <PageLayout 
            title="What's New" 
            subtitle="Updates, improvements, and everything new in text2handwriting.me."
        >
            <div className="relative border-l-2 border-neutral-100 ml-4 pl-8 space-y-12 py-4">
                {updates.map((update, index) => (
                    <div key={index} className="relative">
                        {/* Dot */}
                        <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-white border-4 border-neutral-900 ring-4 ring-white" />
                        
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                                <Clock size={12} />
                                {update.date}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${update.color}`}>
                                {update.type}
                            </span>
                            <span className="text-xs font-bold text-neutral-500">{update.version}</span>
                        </div>

                        <div className="bg-white border border-black/5 p-6 rounded-3xl hover:shadow-xl hover:shadow-neutral-900/5 transition-all">
                            <h3 className="mt-0 mb-3 flex items-center gap-2">
                                <update.icon size={20} className="text-neutral-900" />
                                {update.title}
                            </h3>
                            <p className="text-neutral-600 leading-relaxed m-0">
                                {update.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-16 text-center">
                <p className="text-neutral-400 text-sm font-medium">
                    Want to stay updated? Star and watch the project on <a href="https://github.com/bipin-vishwakarma/text2handwriting.me" className="text-neutral-900 font-bold hover:underline">GitHub</a>.
                </p>
            </div>
        </PageLayout>
    );
}
