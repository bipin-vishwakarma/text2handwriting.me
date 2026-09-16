import PageLayout from '../../components/layout/PageLayout';

export default function TermsOfService() {
    return (
        <PageLayout 
            title="Terms of Service" 
            subtitle="Please read these terms carefully before using our service."
        >
            <h3>1. Acceptance of Terms</h3>
            <p>
                By accessing and using Text2Handwriting (the "Service"), developed by Bipin Vishwakarma, you accept and agree to be bound by the terms and provisions of this agreement.
            </p>

            <h3>2. Use License</h3>
            <p>
                Permission is granted to use Text2Handwriting for lawful personal, academic, and document-creation purposes, subject to any rights that others may hold in the source content:
            </p>
            <ul>
                <li>Modify or copy the open-source code in accordance with the project repository license.</li>
                <li>You may use exports where that use is permitted by applicable law, your institution's rules, and the rights attached to your source material.</li>
                <li>Do not use the Service for impersonation, signature forgery, examination deception, or to misrepresent authorship.</li>
                <li>Do not employ automated scripts to abuse or degrade platform availability.</li>
            </ul>

            <h3>3. Disclaimer</h3>
            <p>
                The materials on Text2Handwriting's website are provided on an 'as is' basis. Text2Handwriting makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
            </p>

            <h3>4. Limitations</h3>
            <p>
                In no event shall Text2Handwriting or its contributors be liable for any damages arising out of the use or inability to use the platform.
            </p>

            <h3>5. Revisions & Updates</h3>
            <p>
                Text2Handwriting is continuously developed to provide students with the highest-fidelity handwriting simulations and lab tools. Features may be updated or refined over time.
            </p>

            <h3>6. Pricing</h3>
            <p>
                Creating and previewing a document does not require payment. Each completed export is priced at ₹10 plus ₹2 per page, with the total displayed before checkout. Pricing may change prospectively, but a confirmed order will not be repriced.
            </p>

            <h3>7. Delivery, Cancellations, and Refunds</h3>
            <p>
                Checkout occurs before the browser starts the paid export. A successful payment grants an export entitlement for the displayed page count; the file is then generated on your device. You may cancel before completing payment. Once a digital export has been successfully delivered, the purchase is generally non-refundable except where required by law.
            </p>
            <p>
                If you are charged but the entitlement or download is not delivered, or if you believe a duplicate charge occurred, contact us promptly through the Support Center. We will verify the Razorpay and entitlement records and, where appropriate, retry delivery or issue a refund to the original payment method. Bank or payment-provider processing times may apply. Do not publish card details, OTPs, or full payment identifiers in a public issue.
            </p>

            <h3>8. Account and Service Availability</h3>
            <p>
                Authentication, hosting, and payments rely on third-party providers and may occasionally be unavailable. We may suspend abusive access, but we will not intentionally revoke a valid paid entitlement without a legitimate security, fraud, legal, or refund reason.
            </p>

            <p className="text-sm text-neutral-400 mt-8">
                Last updated: September 16, 2026
            </p>
        </PageLayout>
    );
}
