import PageLayout from '../components/layout/PageLayout';
import { ArrowUpRight, Github, HelpCircle, FileText, Shield, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const supportEmail = 'rv261457@gmail.com';

const supportChannels = [
    { title: 'Email support', description: 'Need help with an account, export, payment, duplicate charge, or refund request?', label: 'Email support', href: `mailto:${supportEmail}?subject=text2handwriting.me%20support`, detail: supportEmail, external: false, icon: Mail, tone: 'bg-violet-600 text-white' },
    { title: 'GitHub issues', description: 'Found a rendering problem or have a feature request? Open a public issue in the repository.', label: 'Open issue tracker', href: 'https://github.com/bipin-vishwakarma/text2handwriting.me/issues', detail: undefined, icon: Github, tone: 'bg-stone-900 text-white', external: true },
    { title: 'Community & developer', description: 'Connect with Bipin Vishwakarma and explore the text2handwriting.me codebase.', label: 'View GitHub profile', href: 'https://github.com/bipin-vishwakarma', detail: undefined, icon: MessageSquare, tone: 'bg-indigo-600 text-white', external: true },
] as const;

export default function SupportPage() {
    return (
        <PageLayout maxWidth="max-w-6xl" title="How can we help?"
            subtitle="Get help with your editor, account, exports, payments, or the text2handwriting.me project."
            seoTitle="Support | text2handwriting.me"
            description="Get help with the text2handwriting.me editor, accounts, exports, payments, and refund requests.">
            <section aria-labelledby="support-options">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                    <div><p className="mb-1 text-xs font-black uppercase tracking-[0.14em] text-violet-700">Support options</p><h2 id="support-options" className="m-0 text-2xl font-display font-black text-stone-950">Choose the quickest route</h2></div>
                    <p className="m-0 text-sm text-stone-500">We’ll point you to the right place.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {supportChannels.map(({ title, description, label, href, detail, icon: Icon, tone, external }) => (
                        <article key={title} className="group flex min-w-0 flex-col rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-950/5 sm:p-6">
                            <div className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl ${tone}`}><Icon size={22} aria-hidden="true" /></div>
                            <h3 className="m-0 text-lg font-bold text-stone-950">{title}</h3>
                            <p className="mt-2 mb-6 flex-1 text-sm leading-6 text-stone-600">{description}</p>
                            <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
                                className="inline-flex min-h-11 min-w-0 items-center gap-2 self-start rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm font-bold text-stone-900 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
                                <span className={detail ? 'sr-only' : ''}>{label}</span>
                                {detail && <span className="min-w-0 break-all text-left leading-5">{detail}</span>}
                                <ArrowUpRight size={16} className="shrink-0" aria-hidden="true" />
                            </a>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mt-12" aria-labelledby="quick-resources">
                <div className="mb-5 flex items-center gap-3"><span className="h-px flex-1 bg-stone-200" /><h2 id="quick-resources" className="m-0 shrink-0 text-2xl font-display font-black text-stone-950">Quick resources</h2><span className="h-px flex-1 bg-stone-200" /></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                        { to: '/faq', label: 'FAQs', description: 'Common editor and export answers', icon: HelpCircle },
                        { to: '/terms', label: 'Terms of service', description: 'Rules for using the product', icon: FileText },
                        { to: '/privacy', label: 'Privacy policy', description: 'How data is handled', icon: Shield },
                    ].map(({ to, label, description, icon: Icon }) => (
                        <Link key={to} to={to} className="group flex min-h-24 items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 no-underline transition hover:border-violet-300 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-stone-100 text-stone-700 transition group-hover:bg-white group-hover:text-violet-700"><Icon size={19} /></span>
                            <span className="min-w-0"><span className="block font-bold text-stone-950">{label}</span><span className="mt-0.5 block text-xs leading-5 text-stone-500">{description}</span></span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="mt-12 rounded-3xl border border-dashed border-violet-300 bg-violet-50/70 p-6 text-center sm:p-8">
                <h2 className="m-0 text-xl font-display font-black text-stone-950">Have an idea for the editor?</h2>
                <p className="mx-auto mt-2 mb-5 max-w-xl text-sm leading-6 text-stone-600">Feature requests and reproducible bug reports help us improve the tool for everyone.</p>
                <a href="https://github.com/bipin-vishwakarma/text2handwriting.me/issues/new?labels=enhancement&template=feature_request.md" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-bold text-white no-underline transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">Request a feature <ArrowUpRight size={16} /></a>
            </section>
        </PageLayout>
    );
}
