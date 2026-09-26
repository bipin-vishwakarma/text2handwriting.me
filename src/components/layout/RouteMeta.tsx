import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://text2handwriting.me';
const SOCIAL_IMAGE_URL = `${SITE_URL}/brand/text2handwriting-og.png`;

const home = {
    title: 'text2handwriting.me — Convert Text to Handwriting for Assignments',
    description: 'Turn your own text into print-ready handwriting with realistic styles, paper templates, live preview, and high-resolution PDF export.',
};

const privateRoutes: Record<string, string> = {
    '/auth': 'Sign in | text2handwriting.me',
    '/onboarding': 'Set up your workspace | text2handwriting.me',
    '/account': 'Your account | text2handwriting.me',
};

/** Metadata for routes that do not render a page-level Helmet component. */
export default function RouteMeta() {
    const { pathname } = useLocation();
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const privateTitle = privateRoutes[normalizedPath];

    if (normalizedPath === '/') {
        return (
            <Helmet>
                <title>{home.title}</title>
                <meta name="description" content={home.description} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`${SITE_URL}/`} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="text2handwriting.me" />
                <meta property="og:url" content={`${SITE_URL}/`} />
                <meta property="og:title" content={home.title} />
                <meta property="og:description" content={home.description} />
                <meta property="og:image" content={SOCIAL_IMAGE_URL} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={`${SITE_URL}/`} />
                <meta name="twitter:title" content={home.title} />
                <meta name="twitter:description" content={home.description} />
                <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
            </Helmet>
        );
    }

    if (!privateTitle) return null;

    return (
        <Helmet>
            <title>{privateTitle}</title>
            <meta name="description" content="Sign in or manage your text2handwriting.me workspace." />
            <meta name="robots" content="noindex, nofollow" />
            <link rel="canonical" href={`${SITE_URL}${normalizedPath}/`} />
        </Helmet>
    );
}
