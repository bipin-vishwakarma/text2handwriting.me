import { Helmet } from 'react-helmet-async';
import { ArrowRight, PenTool, Sparkles, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const SITE_URL = 'https://text2handwriting.me';
const SOCIAL_IMAGE_URL = `${SITE_URL}/og-image.jpg`;

interface SeoLandingPageProps {
    seoTitle: string;
    seoDescription: string;
    h1: string;
    subtitle: string;
    keyword: string;
}

interface LandingContent {
    overview: string;
    steps: Array<{ title: string; description: string }>;
    note: string;
}

const pageContent: Record<string, LandingContent> = {
    '/text-to-cursive': {
        overview: 'Use the editor when you want to see how your own wording reads in a cursive style before you print or share it. You control the text, typeface, size, ink, margins, and paper layout rather than accepting a one-click result.',
        steps: [
            { title: 'Add your text', description: 'Start with a note, letter, invitation draft, or another document you are allowed to format.' },
            { title: 'Choose a cursive style', description: 'Compare the available fonts and adjust type size, spacing, and baseline placement in the live preview.' },
            { title: 'Review before exporting', description: 'Check pagination and paper settings, then export only when the layout is ready.' },
        ],
        note: 'Cursive styling changes presentation, not authorship. Use only text you have the right to use and follow any applicable submission rules.',
    },
    '/assignment-maker-online': {
        overview: 'This workspace is for preparing permitted handwritten-style study materials, drafts, and layouts from your own work. It gives you a preview so you can make deliberate decisions about the document before exporting it.',
        steps: [
            { title: 'Prepare your own draft', description: 'Write or import material you are allowed to use, then check its content independently.' },
            { title: 'Set the document layout', description: 'Select paper, margins, handwriting style, and other presentation controls for the intended format.' },
            { title: 'Confirm requirements', description: 'Review the pages and your institution or instructor requirements before exporting.' },
        ],
        note: 'Text2Handwriting does not make work original or guarantee compliance with academic policies. You are responsible for the content and for following your institution’s rules.',
    },
    '/realistic-handwriting-generator': {
        overview: 'The editor combines handwriting fonts with controls for spacing, baseline position, ink, and paper so you can create a handwritten-style presentation from your own text. The preview lets you inspect those choices before an export.',
        steps: [
            { title: 'Select a starting style', description: 'Choose a handwriting font or upload a compatible font you are permitted to use.' },
            { title: 'Adjust visual details', description: 'Tune paper, margins, ink, spacing, and baseline settings while watching the page preview.' },
            { title: 'Export a reviewed layout', description: 'Verify the page order and document appearance, then create a PDF or image export as needed.' },
        ],
        note: 'Visual variation is a formatting feature, not evidence of human authorship and not a way to bypass plagiarism or AI-detection systems.',
    },
};

const defaultContent: LandingContent = {
    overview: 'Create a handwritten-style document from your own text, adjust its visual presentation, and review the layout before exporting.',
    steps: [
        { title: 'Add text', description: 'Start with content you are permitted to use.' },
        { title: 'Adjust the layout', description: 'Choose a handwriting style, paper, and formatting settings.' },
        { title: 'Review and export', description: 'Inspect the result before creating your document.' },
    ],
    note: 'You are responsible for the content you create and for following applicable rules.',
};

export default function SeoLandingPage({ seoTitle, seoDescription, h1, subtitle, keyword }: SeoLandingPageProps) {
    const { pathname } = useLocation();
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const canonicalUrl = `${SITE_URL}${normalizedPath}`;
    const content = pageContent[normalizedPath] ?? defaultContent;
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: seoTitle,
        description: seoDescription,
        url: canonicalUrl,
        isPartOf: {
            '@type': 'WebSite',
            name: 'Text2Handwriting',
            url: `${SITE_URL}/`,
        },
    };

    return (
        <>
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Text2Handwriting" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:image" content={SOCIAL_IMAGE_URL} />
                <meta property="og:image:type" content="image/jpeg" />
                <meta property="og:image:width" content="1024" />
                <meta property="og:image:height" content="1024" />
                <meta property="og:image:alt" content="Text2Handwriting editor preview on ruled paper" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
                <meta name="twitter:image:alt" content="Text2Handwriting editor preview on ruled paper" />
                <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
            </Helmet>
            <main className="flex-1 px-4 py-20 sm:px-6 lg:px-8 text-center bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-white to-white -z-10" />

                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-medium text-sm mb-8 border border-indigo-100">
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        <span>{keyword} tool</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">{h1}</h1>
                    <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
                    <p className="text-base text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">{content.overview}</p>

                    <Link
                        to="/editor"
                        className="inline-flex px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-lg hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 active:scale-[0.98] transition-all duration-200 items-center justify-center gap-2 group"
                    >
                        <PenTool className="w-5 h-5" aria-hidden="true" />
                        Try the Editor
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </Link>

                    <section className="mt-20 text-left" aria-labelledby="how-it-works-heading">
                        <h2 id="how-it-works-heading" className="text-3xl font-bold text-slate-900 text-center mb-8">How to use the editor</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {content.steps.map(({ title, description }, index) => (
                                <article key={title} className="p-7 bg-slate-50 rounded-3xl border border-slate-100">
                                    <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold mb-5">{index + 1}</span>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{description}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="mt-10 p-6 text-left bg-amber-50 border border-amber-100 rounded-3xl" aria-labelledby="use-note-heading">
                        <div className="flex gap-4">
                            <FileText className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                            <div>
                                <h2 id="use-note-heading" className="text-lg font-bold text-amber-950 mb-2">Use it responsibly</h2>
                                <p className="text-amber-900 leading-relaxed">{content.note}</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
