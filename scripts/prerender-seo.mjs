import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const template = await readFile(new URL('index.html', dist), 'utf8');

const publicRoutes = {
  pricing: {
    title: 'Simple pay-per-export pricing | text2handwriting.me',
    description: 'See transparent INR pricing for print-ready handwritten exports. Preview your document first, then pay only when you export.',
    heading: 'Simple pricing for handwritten exports',
    intro: 'Design and preview your pages in the browser, then pay only for the export you need. Pricing is shown in Indian rupees before checkout.',
  },
  faq: {
    title: 'FAQ | text2handwriting.me',
    description: 'Answers about text-to-handwriting conversion, custom fonts, browser privacy, PDF exports, pricing and responsible use.',
    heading: 'Frequently asked questions',
    intro: 'Find clear answers about how text2handwriting.me converts your own text into printable handwritten pages and how exports work.',
  },
  about: {
    title: 'About text2handwriting.me',
    description: 'Learn why text2handwriting.me was built and how its browser-based handwriting editor combines realistic styling with privacy-conscious processing.',
    heading: 'About text2handwriting.me',
    intro: 'text2handwriting.me is a browser-based document styling tool for turning your own text into realistic, print-ready handwritten pages.',
  },
  support: {
    title: 'Support | text2handwriting.me',
    description: 'Get help with the text2handwriting.me editor, document imports, handwriting styles, exports, payments and account access.',
    heading: 'Support for text2handwriting.me',
    intro: 'Get help with the editor, imports, handwriting styles, PDF exports, payments and account access.',
  },
  'text-to-cursive': {
    title: 'Text to cursive converter | text2handwriting.me',
    description: 'Turn your own typed text into natural-looking cursive pages with adjustable spacing, paper, ink and printable PDF export.',
    heading: 'Text to cursive converter',
    intro: 'Paste your own text, choose a cursive style, adjust the page layout and preview the result before exporting printable pages.',
  },
  'assignment-maker-online': {
    title: 'Assignment handwriting maker | text2handwriting.me',
    description: 'Format your own assignment drafts as realistic handwritten pages with paper, margin, spacing and export controls.',
    heading: 'Assignment handwriting maker',
    intro: 'Prepare your own assignment drafts as readable handwritten pages while keeping control of paper, margins, spacing and export settings.',
  },
  'realistic-handwriting-generator': {
    title: 'Realistic handwriting generator | text2handwriting.me',
    description: 'Create natural-looking handwritten pages from your own text with varied styles, paper textures, ink controls and PDF export.',
    heading: 'Realistic handwriting generator',
    intro: 'Create natural-looking handwritten pages from your own text with adjustable styles, paper, ink, spacing and print-ready export.',
  },
};

const appRoutes = ['auth', 'onboarding', 'account', 'editor'];
const siteUrl = 'https://text2handwriting.me';

function jsonLd(route, page) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: `${siteUrl}/${route}`,
    isPartOf: { '@type': 'WebSite', name: 'text2handwriting.me', url: `${siteUrl}/` },
  });
}

function render(route, page, robots) {
  const canonical = `${siteUrl}/${route}`;
  const body = page
    ? `<main id="seo-prerender"><h1>${page.heading}</h1><p>${page.intro}</p><p><a href="${siteUrl}/editor">Open the editor</a> or review <a href="${siteUrl}/pricing">pricing</a> before exporting.</p></main>`
    : '';
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${page?.title || 'text2handwriting.me'}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${page?.description || 'Sign in to text2handwriting.me.'}" />`)
    .replace(/<meta name="robots" content="[^"]*"\s*\/>/, `<meta name="robots" content="${robots}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${page?.title || 'text2handwriting.me'}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${page?.description || 'Sign in to text2handwriting.me.'}" />`)
    .replace(/<meta name="twitter:url" content="[^"]*"\s*\/>/, `<meta name="twitter:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${page?.title || 'text2handwriting.me'}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${page?.description || 'Sign in to text2handwriting.me.'}" />`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, page ? `<script type="application/ld+json">${jsonLd(route, page)}</script>` : '')
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  return html;
}

for (const [route, page] of Object.entries(publicRoutes)) {
  const dir = new URL(`${route}/`, dist);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('index.html', dir), render(route, page, 'index, follow'), 'utf8');
}

for (const route of appRoutes) {
  const dir = new URL(`${route}/`, dist);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('index.html', dir), render(route, null, 'noindex, nofollow'), 'utf8');
}

console.log(`Prerendered ${Object.keys(publicRoutes).length} public SEO routes and ${appRoutes.length} app routes.`);
