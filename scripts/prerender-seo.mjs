import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const dist = new URL('../dist/', import.meta.url);
const template = await readFile(new URL('index.html', dist), 'utf8');
const seoContent = JSON.parse(await readFile(new URL('../src/data/seo-content.json', import.meta.url), 'utf8'));
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

const homePage = {
  title: 'text2handwriting.me — Convert Text to Handwriting for Assignments',
  description: 'Turn your own text into print-ready handwriting with realistic styles, paper templates, live preview, and high-resolution PDF export.',
  heading: 'Turn typed text into handwriting',
  intro: 'Create and preview handwritten-style pages in your browser. Adjust the font, paper, ink, spacing and margins, then pay only when you choose to export.',
};

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
  privacy: {
    title: 'Privacy Policy | text2handwriting.me',
    description: 'Read how text2handwriting.me handles account, document, payment and privacy data.',
    heading: 'Privacy Policy',
    intro: 'Learn what information text2handwriting.me processes, what stays in your browser, and how payment and account records are handled.',
  },
  terms: {
    title: 'Terms of Service | text2handwriting.me',
    description: 'Review the terms for using text2handwriting.me, including exports, payments, permitted use and account responsibilities.',
    heading: 'Terms of Service',
    intro: 'Review the terms that apply when you use the editor, create exports, sign in, or purchase an export entitlement.',
  },
  refund: {
    title: 'Refund and Cancellation Policy | text2handwriting.me',
    description: 'Read the policy for paid digital exports, cancellations, duplicate charges and payment support.',
    heading: 'Refund and cancellation policy',
    intro: 'Review how paid digital exports, cancellations, duplicate charges and payment-support requests are handled.',
  },
  disclaimer: {
    title: 'Disclaimer and academic guidelines | text2handwriting.me',
    description: 'Understand the educational purpose, responsible use and academic-integrity guidelines for text2handwriting.me.',
    heading: 'Disclaimer and academic guidelines',
    intro: 'text2handwriting.me is a formatting and productivity tool. Review the responsible-use guidance before creating or sharing documents.',
  },
  cookies: {
    title: 'Cookie Policy | text2handwriting.me',
    description: 'Learn how text2handwriting.me uses browser storage and optional cookies to support the site and sign-in experience.',
    heading: 'Cookie Policy',
    intro: 'Learn how browser storage and optional cookies support authentication, preferences, security and a reliable editor experience.',
  },
  changelog: {
    title: 'Changelog | text2handwriting.me',
    description: 'See product updates, accessibility improvements, editor changes and payment reliability work in text2handwriting.me.',
    heading: 'Changelog',
    intro: 'Follow updates to the editor, accessibility, performance, exports, payments and privacy-focused product experience.',
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
  'typed-text-to-handwritten-notes': {
    title: 'How to turn typed text into handwritten notes | text2handwriting.me',
    description: 'A practical guide to turning your own typed text into clear handwritten notes with page layout, spacing and PDF export controls.',
    heading: 'How to turn typed text into handwritten notes',
    intro: 'Paste your own notes into the editor, choose a readable handwriting style, then adjust margins, line spacing and paper before exporting a PDF. Preview every page and proofread the result so diagrams, headings and citations remain accurate.',
  },
  'practical-record-formatting-guide': {
    title: 'Practical and lab record formatting guide | text2handwriting.me',
    description: 'Learn a clear structure for practical and lab records, then format your own draft as readable handwritten pages for review and printing.',
    heading: 'Practical and lab record formatting guide',
    intro: 'A strong practical record is easiest to review when each experiment follows the same structure: objective, materials, method, observations, calculations, result and precautions. Draft the content yourself, use consistent headings, and preview the handwritten layout before printing.',
  },
  'print-ready-handwritten-pdf-guide': {
    title: 'Print-ready handwritten PDF export guide | text2handwriting.me',
    description: 'Prepare handwritten pages for reliable printing with a quick checklist for margins, page breaks, contrast, paper size and PDF preview.',
    heading: 'Print-ready handwritten PDF export guide',
    intro: 'Before exporting, select the paper size your printer uses, keep safe margins, check page breaks and choose enough ink contrast for scanning. Open the PDF on both desktop and mobile, verify every page, and print one test sheet before a full batch.',
  },
};

const appRoutes = ['auth', 'onboarding', 'account', 'editor'];
const siteUrl = 'https://text2handwriting.me';

function routeUrl(route) {
  return route ? `${siteUrl}/${route}/` : `${siteUrl}/`;
}

function jsonLd(route, page) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: routeUrl(route),
    isPartOf: { '@type': 'WebSite', name: 'text2handwriting.me', url: `${siteUrl}/` },
  });
}

function render(route, page, robots) {
  const canonical = routeUrl(route);
  const content = seoContent[`/${route}`];
  const detail = content ? `<p>${escapeHtml(content.overview)}</p><section><h2>How to use the editor</h2>${content.steps.map(step => `<h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.description)}</p>`).join('')}</section>${(content.sections || []).map(section => `<section><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.text)}</p></section>`).join('')}<section><h2>Use it responsibly</h2><p>${escapeHtml(content.note)}</p></section>` : '';
  const links = page ? `<nav aria-label="Handwriting guides"><h2>Handwriting guides</h2><ul>${Object.keys(seoContent).filter(path => path !== `/${route}`).map(path => `<li><a href="${path}/">${escapeHtml(publicRoutes[path.slice(1)].heading)}</a></li>`).join('')}</ul></nav>` : '';
  const body = page
    ? `<main id="seo-prerender" style="box-sizing:border-box;max-width:72rem;margin:0 auto;padding:5rem 1.5rem;color:#1c1917;background:#faf8f5"><h1>${page.heading}</h1><p>${page.intro}</p><p><a href="${siteUrl}/editor">Open the editor</a> or review <a href="${siteUrl}/pricing">pricing</a> before exporting.</p></main>`
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
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, (original) => !route && page ? original : page ? `<script type="application/ld+json">${jsonLd(route, page)}</script>` : '')
    .replace('<div id="root"></div>', `<div id="root">${body.replace('</main>', `${detail}${links}</main>`)}</div>`);
  return html;
}

function assertSeoShell(route, html, { indexable }) {
  const canonical = routeUrl(route);
  assert.match(html, new RegExp(`<link rel="canonical" href="${canonical}"`));
  assert.match(html, new RegExp(`<meta property="og:url" content="${canonical}"`));
  assert.match(html, /<meta property="og:image" content="https:\/\/text2handwriting\.me\/brand\/text2handwriting-og\.png"/);
  assert.match(html, /<meta property="og:image:width" content="1200"/);
  assert.match(html, /<meta property="og:image:height" content="630"/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
  assert.match(html, new RegExp(`<meta name="robots" content="${indexable ? 'index, follow' : 'noindex, nofollow'}"`));
  if (indexable) {
    assert.match(html, /<main id="seo-prerender"[^>]*><h1>[^<]+<\/h1>/);
    assert.match(html, /<script type="application\/ld\+json">/);
  }
}

const homeHtml = render('', homePage, 'index, follow');
assertSeoShell('', homeHtml, { indexable: true });
await writeFile(new URL('index.html', dist), homeHtml, 'utf8');

for (const [route, page] of Object.entries(publicRoutes)) {
  const dir = new URL(`${route}/`, dist);
  const html = render(route, page, 'index, follow');
  assertSeoShell(route, html, { indexable: true });
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('index.html', dir), html, 'utf8');
}

for (const route of appRoutes) {
  const dir = new URL(`${route}/`, dist);
  const html = render(route, null, 'noindex, nofollow');
  assertSeoShell(route, html, { indexable: false });
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('index.html', dir), html, 'utf8');
}

console.log(`Prerendered the homepage, ${Object.keys(publicRoutes).length} public SEO routes and ${appRoutes.length} app routes.`);
