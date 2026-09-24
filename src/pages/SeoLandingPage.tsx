import seoContent from '../data/seo-content.json';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, PenTool, Sparkles, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const SITE_URL = 'https://text2handwriting.me';
const SOCIAL_IMAGE_URL = `${SITE_URL}/brand/text2handwriting-og.png`;

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
    sections?: Array<{ title: string; text: string }>;
}

const pageContent: Record<string, LandingContent> = seoContent;

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
    const canonicalUrl = normalizedPath === '/' ? `${SITE_URL}/` : `${SITE_URL}${normalizedPath}/`;
    const content = pageContent[normalizedPath] ?? defaultContent;
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: seoTitle,
        description: seoDescription,
        url: canonicalUrl,
        isPartOf: {
            '@type': 'WebSite',
            name: 'text2handwriting.me',
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
                <meta property="og:site_name" content="text2handwriting.me" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:image" content={SOCIAL_IMAGE_URL} />
                <meta property="og:image:secure_url" content={SOCIAL_IMAGE_URL} />
                <meta property="og:image:type" content="image/png" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="text2handwriting.me — turn your text into print-ready handwritten pages" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
                <meta name="twitter:image:alt" content="text2handwriting.me — turn your text into print-ready handwritten pages" />
                <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
            </Helmet>
            <main className="relative flex-1 overflow-hidden bg-[#FAF8F5] px-4 py-20 text-center sm:px-6 lg:px-8">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-100/60 via-[#FAF8F5] to-[#FAF8F5]" />

                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm backdrop-blur">
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        <span>{keyword} tool</span>
                    </div>

                    <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-stone-950 md:text-6xl">{h1}</h1>
                    <p className="mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-stone-600 md:text-2xl">{subtitle}</p>
                    <p className="mx-auto mb-10 max-w-3xl text-base leading-relaxed text-stone-600">{content.overview}</p>

                    <Link
                        to="/editor"
                        className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-stone-900/15 transition-all duration-200 hover:bg-violet-700 hover:shadow-violet-300 active:scale-[0.98]"
                    >
                        <PenTool className="w-5 h-5" aria-hidden="true" />
                        Open the Studio
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </Link>

                    <section className="mt-20 text-left" aria-labelledby="how-it-works-heading">
                        <h2 id="how-it-works-heading" className="mb-8 text-center text-3xl font-bold text-stone-950">How to use the editor</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {content.steps.map(({ title, description }, index) => (
                                <article key={title} className="rounded-3xl border border-stone-200/80 bg-white/75 p-7 shadow-sm">
                                    <span className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">{index + 1}</span>
                                    <h3 className="mb-3 text-xl font-bold text-stone-950">{title}</h3>
                                    <p className="leading-relaxed text-stone-600">{description}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    {content.sections?.map(section => (
                        <section key={section.title} className="mt-10 text-left rounded-3xl border border-stone-200 bg-white p-7">
                            <h2 className="text-2xl font-bold text-stone-950 mb-4">{section.title}</h2>
                            <p className="leading-relaxed text-stone-600">{section.text}</p>
                        </section>
                    ))}
                    <nav aria-label="Handwriting guides" className="mt-10 text-left">
                        <h2 className="text-2xl font-bold mb-4">Related handwriting guides</h2>
                        <ul className="space-y-3">
                            {Object.entries(pageContent).filter(([path]) => path !== normalizedPath).map(([path, entry]) => (
                                <li key={path}><Link className="text-violet-700 underline" to={`${path}/`}>{entry.steps[0].title} — {path.slice(1).replaceAll('-', ' ')}</Link></li>
                            ))}
                        </ul>
                    </nav>
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
