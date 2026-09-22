import PageLayout from '../components/layout/PageLayout';

const faqItems = [
    {
        question: 'How much does text2handwriting.me cost?',
        answer: 'You can create, customize, and preview your document without paying. A finished export costs ₹10 plus ₹2 per page. There is no monthly subscription or recurring charge.',
    },
    {
        question: 'How do natural handwriting variations work?',
        answer: 'The editor can vary letter spacing, baseline alignment, and other layout details so the result feels less mechanically repeated. These are visual formatting controls, not a guarantee against plagiarism or AI-detection systems.',
    },
    {
        question: 'Is my data secure and private?',
        answer: 'Document rendering and file generation are designed to run in your browser. Drafts and preferences may be saved in browser storage on your device. Sign-in and payment use service providers (including Supabase and Razorpay), which process account and transaction data; see our Privacy Policy for details.',
    },
    {
        question: 'Can I use my own handwriting font?',
        answer: 'text2handwriting.me supports custom font uploads (.ttf/.otf/.woff) directly in the Editor. Upload your own handwriting font for a more personal result, or choose from the included handwriting fonts.',
    },
    {
        question: 'What file formats are supported for export?',
        answer: 'You can export a multi-page PDF or a ZIP containing page images. Available page sizes include A4 and Letter.',
    },
];

const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
            '@type': 'Answer',
            text: answer,
        },
    })),
};

export default function FAQPage() {
    return (
        <PageLayout
            title="Help Center"
            subtitle="Frequently asked questions about text2handwriting.me."
            seoTitle="text2handwriting.me FAQ | Pricing, Privacy & Exports"
            description="Answers about text2handwriting.me pricing, browser-based document processing, custom fonts, responsible use, and PDF or ZIP exports."
            structuredData={faqStructuredData}
        >
            <section className="space-y-10" aria-label="Frequently asked questions">
                {faqItems.map(({ question, answer }) => (
                    <div key={question}>
                        <h2 className="text-xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
                            {question}
                        </h2>
                        <p className="text-neutral-600 leading-relaxed">{answer}</p>
                    </div>
                ))}
            </section>
        </PageLayout>
    );
}
