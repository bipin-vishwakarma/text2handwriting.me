import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://text2handwriting.me';
const SOCIAL_IMAGE_URL = `${SITE_URL}/brand/text2handwriting-og.png`;

interface PageLayoutProps {
    title: string;
    subtitle?: string;
    description?: string;
    seoTitle?: string;
    structuredData?: Record<string, unknown>;
    maxWidth?: string;
    children: ReactNode;
}

/** Shared public-page shell with one canonical URL and route-specific metadata. */
export default function PageLayout({
    title,
    subtitle,
    description,
    seoTitle,
    structuredData,
    maxWidth = 'max-w-3xl',
    children,
}: PageLayoutProps) {
    const { pathname } = useLocation();
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const canonicalUrl = normalizedPath === '/' ? `${SITE_URL}/` : `${SITE_URL}${normalizedPath}/`;
    const documentTitle = seoTitle ?? `${title} | text2handwriting.me`;
    const metaDescription = description ?? subtitle ?? 'Create and format print-ready handwritten-style documents from your own text.';

    return (
        <>
            <Helmet>
                <title>{documentTitle}</title>
                <meta name="description" content={metaDescription} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="text2handwriting.me" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={documentTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:image" content={SOCIAL_IMAGE_URL} />
                <meta property="og:image:secure_url" content={SOCIAL_IMAGE_URL} />
                <meta property="og:image:type" content="image/png" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="text2handwriting.me — turn your text into print-ready handwritten pages" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={documentTitle} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
                <meta name="twitter:image:alt" content="text2handwriting.me — turn your text into print-ready handwritten pages" />
                {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
            </Helmet>
            <div className="min-h-screen pt-28 sm:pt-32 pb-16 sm:pb-20 relative overflow-hidden bg-[#FAF8F5] text-stone-900 selection:bg-violet-200 selection:text-violet-900">
                <div className="pointer-events-none -z-10 absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" />
                </div>

                <div className={`${maxWidth} mx-auto px-5 sm:px-6 relative z-10`}>
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="text-center mb-8 sm:mb-12"
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-stone-950 mb-4 tracking-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-base sm:text-lg text-stone-600 font-serif italic max-w-xl mx-auto leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                        className="bg-white/80 backdrop-blur-2xl rounded-3xl sm:rounded-[2rem] p-5 sm:p-10 shadow-xl shadow-stone-900/5 ring-1 ring-stone-900/5 prose prose-stone prose-base max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-stone-900 prose-headings:tracking-tight prose-p:text-stone-600 prose-p:leading-relaxed prose-a:text-violet-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-li:text-stone-600"
                    >
                        {children}
                    </motion.div>
                </div>
            </div>
        </>
    );
}
