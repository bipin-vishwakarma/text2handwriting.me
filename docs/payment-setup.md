# Export payment setup (no paid Supabase features required)

The server charges **INR 10 + INR 2 per page**, between 1 and 500 pages. The
charge in paise is exactly `1000 + 200 * pageCount`. Never trust a browser
amount or currency. `export_purchases` is a durable, per-purchase ledger; it
does **not** set `profiles.is_pro` or confer a lifetime subscription.

## Manual setup before accepting real payments

1. In Razorpay, create/activate an account and decide whether to use test or
   live credentials. Configure automatic capture, and check actual account
   status and payment method availability. A Razorpay order/payment must be
   fully **paid/captured** before the server grants an export purchase.
2. In the linked Supabase project, apply
   `20260915010000_export_purchases.sql` using the normal migration review/push
   workflow. Do **not** run an unreviewed remote DB push. Deploy both Edge
   Functions afterward; functions require the new ledger/RPC to work.
3. Configure Edge Function secret names `RAZORPAY_KEY_ID`,
   `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `SUPABASE_URL`, and
   `SUPABASE_SERVICE_ROLE_KEY` in
   the same project. Set `ALLOWED_ORIGINS` to comma-separated **exact**
   production/development origins before a production release; without it the
   Functions use wildcard non-credentialed CORS for compatibility. Configure
   the public frontend `VITE_RAZORPAY_KEY_ID` to the same *test/live mode* as
   the server ID.
   **Never** put the Razorpay secret or service-role key in the frontend.
4. Deploy `razorpay-webhook`, then create a Razorpay webhook pointing to
   `https://<project-ref>.supabase.co/functions/v1/razorpay-webhook`. Subscribe
   only to `payment.captured` and `order.paid`, and set the same strong random
   signing secret as `RAZORPAY_WEBHOOK_SECRET`. This is a webhook-specific
   secret, not the Razorpay API key secret. Keep Supabase JWT verification off
   for this endpoint because Razorpay authenticates with the raw-body HMAC.
5. Perform a test-mode payment end-to-end, confirm a `paid` ledger row, retry
   verification of the same payment (returns the same purchase), and check
   another signed-in account cannot redeem or read the order. Then test a
   failed/uncaptured payment does not grant an entitlement. Switch to live mode
   only after reviewing the dashboard and completing payment-policy/legal checks.

## Production release blockers

Do not activate live checkout on a hosting plan that disallows commercial use
(Vercel Hobby is personal/non-commercial). Select and verify an eligible plan,
then test the custom-domain alias and production build before switching keys.
The current browser-rendered export cannot enforce one paid purchase per
document: a paid purchase can be reused for another document with the same
page count, and modified client code can bypass the gate. If enforceable
per-export billing is required, move artifact creation/claim to a trusted
server, bind an immutable export identity, and consume or scope the grant
atomically. The signed webhook and time-limited browser recovery now provide a
durable captured-payment reconciliation path, but they do not solve client-side
paywall bypass or immutable document binding. Test recovery, duplicate webhook,
bad-signature webhook, and provider-outage cases before live billing.

## API and recovery

`POST create-razorpay-order` accepts `{ "pageCount": 3 }`, optionally with a
client-generated UUIDv4 `purchaseId` for order-creation retries. The response
includes Razorpay `id`, `amount`, `currency` and `purchase_id`. The order is
created with server notes/receipt bound to the authenticated user and a pending
ledger entry. When a pending order is already bound to the same purchaseId,
repeating the request returns the existing order rather than creating a new one.

`POST verify-razorpay-payment` accepts checkout's
`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`. It verifies
the HMAC, fetches both payment and order from Razorpay, checks order-user,
ledger, page count, exact amount, currency, and captured/paid status, then
atomically grants or replays the purchase. Success is
`{ "success": true, "purchase_id": "...", "order_id": "...", "page_count": 3 }`.
Keep the signed checkout payload until verification succeeds so a captured
payment can be retried following a transient outage. The browser stores this
signed checkout result (never the Razorpay API secret or webhook secret) for at
most 24 hours, attempts three bounded automatic retries, and then offers a
manual retry that starts another bounded cycle without creating a new charge.
Support can reconcile a
captured payment using the provider order and ledger receipt, never by granting
an entitlement solely on a browser claim.

`POST razorpay-webhook` is unauthenticated by Supabase JWT by design, but rejects
requests unless `x-razorpay-signature` is a valid SHA-256 HMAC of the **exact raw
request body** using `RAZORPAY_WEBHOOK_SECRET`. For `payment.captured` and
`order.paid`, it fetches the canonical order/payment from Razorpay, repeats the
user, receipt, amount, currency and captured-state checks, and calls the same
idempotent `grant_export_purchase` RPC. Its responses never expose user, order,
payment, or ledger data. Do not place the webhook secret in frontend variables,
logs, source control, or the Razorpay API credential fields.

`GET verify-razorpay-payment` returns `{ "purchases": [{ "purchase_id": "...",
"order_id": "...", "payment_id": "...", "page_count": 3,
"amount_paise": 1600, "paid_at": "..." }] }` for the authenticated
account's most recent 100 paid purchases. The browser may show this history
after refresh. The ledger preserves entitlement, not the actual document
content: pages/file names are not sent to Razorpay/Supabase. **Browser-only
generation cannot cryptographically limit reuse to one export, guarantee a
paid document's regeneration after local content is lost, or prevent users
from bypassing client-side export code.** A truly enforced one-time export
would require server-rendering plus a persisted export identifier and atomic
consumption. This tradeoff avoids uploading private document text and does
not claim stronger enforcement than exists.

Deployment status (2026-09-16): the payment ledger migrations and both Edge
Functions are deployed to the linked Supabase project. A Razorpay Test Mode
checkout was captured successfully and produced the requested browser export;
the failed international-card path was also rejected as expected. Keep the
frontend and server in Test Mode until the recovery/webhook changes are deployed,
configured, tested, and the live-account review is complete. Local Supabase runtime verification still
requires Docker Desktop or Podman; the CLI alone cannot start local Edge
Functions without one.
