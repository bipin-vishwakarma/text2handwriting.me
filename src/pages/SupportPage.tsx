import PageLayout from '../components/layout/PageLayout';
import { Github, MessageSquare, HelpCircle, FileText, Shield, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SupportPage() {
    const supportEmail = 'rv261457@gmail.com';
    return (
        <PageLayout 
            title="Support Center" 
            subtitle="Get support, submit issues, or contribute to text2handwriting.me."
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="p-8 bg-white border border-black/5 rounded-3xl hover:shadow-xl hover:shadow-neutral-900/5 transition-all">
                    <div className="w-12 h-12 bg-violet-600 text-white rounded-2xl flex items-center justify-center mb-6">
                        <Mail size={24} />
                    </div>
                    <h3 className="mt-0">Email Support</h3>
                    <p className="text-neutral-500 mb-6">Need help with an account, export, payment, duplicate charge, or refund request?</p>
                    <a href={`mailto:${supportEmail}?subject=text2handwriting.me%20support`} className="inline-flex items-center font-bold text-neutral-900 hover:gap-2 transition-all">{supportEmail} →</a>
                </div>
                <div className="p-8 bg-white border border-black/5 rounded-3xl hover:shadow-xl hover:shadow-neutral-900/5 transition-all">
                    <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center mb-6">
                        <Github size={24} />
                    </div>
                    <h3 className="mt-0">GitHub Issues</h3>
                    <p className="text-neutral-500 mb-6">Found a rendering glitch or have a feature request? Open a public issue on the repository.</p>
                    <a 
                        href="https://github.com/bipin-vishwakarma/text2handwriting.me/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center font-bold text-neutral-900 hover:gap-2 transition-all"
                    >
                        GitHub Issues Tracker →
                    </a>
                </div>

                <div className="p-8 bg-white border border-black/5 rounded-3xl hover:shadow-xl hover:shadow-neutral-900/5 transition-all">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6">
                        <MessageSquare size={24} />
                    </div>
                    <h3 className="mt-0">Community & Developer</h3>
                    <p className="text-neutral-500 mb-6">
                        Connect with Bipin Vishwakarma and explore the text2handwriting.me codebase.
                    </p>
                    <a 
                        href="https://github.com/bipin-vishwakarma" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center font-bold text-neutral-900 hover:gap-2 transition-all"
                    >
                        Bipin Vishwakarma (GitHub) →
                    </a>
                </div>
            </div>

            <h2 className="text-2xl font-display font-black mb-8 text-center sm:text-left">Quick Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to="/faq" className="p-6 bg-white border border-black/5 rounded-2xl hover:border-neutral-900/20 transition-colors flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center group-hover:bg-neutral-100 transition-colors">
                        <HelpCircle size={20} className="text-neutral-600" />
                    </div>
                    <span className="font-bold">Frequently Asked Questions</span>
                </Link>

                <Link to="/terms" className="p-6 bg-white border border-black/5 rounded-2xl hover:border-neutral-900/20 transition-colors flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center group-hover:bg-neutral-100 transition-colors">
                        <FileText size={20} className="text-neutral-600" />
                    </div>
                    <span className="font-bold">Terms of Service</span>
                </Link>

                <Link to="/privacy" className="p-6 bg-white border border-black/5 rounded-2xl hover:border-neutral-900/20 transition-colors flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center group-hover:bg-neutral-100 transition-colors">
                        <Shield size={20} className="text-neutral-600" />
                    </div>
                    <span className="font-bold">Privacy Policy</span>
                </Link>
            </div>

            <section className="mt-16 p-8 border border-neutral-200 border-dashed rounded-3xl text-center">
                <h3 className="mt-0">Need a feature?</h3>
                <p className="text-neutral-500 max-w-lg mx-auto mb-6">
                    We're always looking to improve. If you have an idea for a feature that would make text2handwriting.me better for you, let us know!
                </p>
                <a href="https://github.com/bipin-vishwakarma/text2handwriting.me/issues/new?labels=enhancement&template=feature_request.md" target="_blank" rel="noopener noreferrer" className="text-neutral-900 font-bold underline underline-offset-4 hover:text-neutral-600">Request a Feature →</a>
            </section>
        </PageLayout>
    );
}
