import PageLayout from '../../components/layout/PageLayout';

export default function PrivacyPolicy() {
    return (
        <PageLayout 
            title="Privacy Policy" 
            subtitle="Your privacy is critically important to us. We believe in transparency and data minimalism."
        >
            <h3>1. Introduction</h3>
            <p>
                Welcome to text2handwriting.me ("we", "our", or "us"), created by Bipin Vishwakarma. This Privacy Policy explains what information is processed when you use the website, how it is used, and the choices available to you.
            </p>
            <p>
                By accessing or using our services, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy.
            </p>

            <h3>2. Information We Process</h3>
            <p>
                <strong>Important:</strong> document editing and rendering are designed to be local-first; account and payment features require network services.
            </p>
            <ul>
                <li><strong>Document content:</strong> Core rendering and file generation occur in your browser. Draft settings and export history may be stored locally in that browser; clearing browser data may remove them. Content you explicitly submit to a network-backed feature may be processed by the relevant provider.</li>
                <li><strong>Device data:</strong> Draft state, preferences, and recovery information may be stored in <code>localStorage</code>, <code>sessionStorage</code>, or <code>IndexedDB</code> on your device.</li>
                <li><strong>Account data:</strong> Supabase processes authentication identifiers, email address, profile fields, session data, and security logs needed to operate your account.</li>
                <li><strong>Payment data:</strong> Razorpay processes checkout and payment-instrument information. We and Supabase retain limited order and entitlement records such as user ID, order/payment identifiers, page count, amount, currency, status, and timestamps. We do not receive or store full card or UPI credentials.</li>
            </ul>

            <h3>3. How We Use Information</h3>
            <p>
                We use this information to authenticate users, create and verify payment orders, provide and recover paid-export entitlements, prevent abuse, troubleshoot failures, and comply with legal or accounting obligations.
            </p>

            <h3>4. Service Providers and Retention</h3>
            <p>
                Cloudflare provides website delivery and security, Supabase provides authentication and payment-ledger infrastructure, and Razorpay provides payment processing. Each provider processes data under its own terms and privacy policy. Account and payment records are retained only as long as reasonably needed for service operation, fraud prevention, dispute handling, and applicable tax, accounting, or legal requirements.
            </p>

            <h3>5. Cookies, Local Storage, and Analytics</h3>
            <p>
                We use browser storage and authentication cookies that are necessary for login, preferences, checkout recovery, and security. We do not currently claim to run behavioral advertising or analytics tracking. If analytics is introduced, this policy and any consent controls will be updated before use.
            </p>

            <h3>6. Your Choices</h3>
            <p>
                You can clear local drafts and preferences through your browser, sign out to clear the active session, and request assistance with account data or a payment record through the Support Center. Some payment records may need to be retained where required by law. Never post card details, authentication codes, or full payment identifiers in a public issue.
            </p>

            <h3>7. Contact Us</h3>
            <p>
                If you have questions about this policy, please open a discussion on our <a href="https://github.com/bipin-vishwakarma/text2handwriting.me" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
            </p>

            <p className="text-sm text-neutral-400 mt-8">
                Last updated: September 16, 2026
            </p>
        </PageLayout>
    );
}
