import PageLayout from '../../components/layout/PageLayout';

const supportEmail = 'rv261457@gmail.com';

export default function RefundPolicy() {
    return (
        <PageLayout
            title="Refund & Cancellation Policy"
            subtitle="Clear information about paid digital exports, cancellations, and support."
            description="Read the text2handwriting.me policy for paid digital exports, cancellations, duplicate charges, and refund support."
        >
            <h3>1. Digital export delivery</h3>
            <p>
                text2handwriting.me lets you create and preview documents without charge. Payment is requested only when you choose to export a PDF or ZIP. After a successful payment, the export is generated in your browser for download.
            </p>

            <h3>2. Cancellations</h3>
            <p>
                You may close or cancel the Razorpay checkout before completing payment. No payment is collected until Razorpay confirms a successful payment.
            </p>

            <h3>3. Refunds and failed delivery</h3>
            <p>
                A successfully delivered digital export is generally non-refundable, except where required by applicable law. If you were charged but did not receive the paid export, see a duplicate charge, or believe payment was taken in error, contact us so we can verify the Razorpay payment and export-entitlement records.
            </p>
            <p>
                Where a refund is appropriate, it is issued to the original payment method. Your bank or payment provider may take additional time to reflect the refund.
            </p>

            <h3>4. How to request help</h3>
            <p>
                Email <a href={`mailto:${supportEmail}?subject=text2handwriting.me%20payment%20support`}>{supportEmail}</a> with the email used to sign in and the Razorpay payment or order reference. Do not send card details, UPI PINs, passwords, or OTPs.
            </p>

            <p className="text-sm text-neutral-400 mt-8">Last updated: September 22, 2026</p>
        </PageLayout>
    );
}
