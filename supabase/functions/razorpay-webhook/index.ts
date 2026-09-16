import "@supabase/functions-js/edge-runtime.d.ts";
import { razorpayAuth, serviceClient, validId } from "../_shared/payment.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BODY_BYTES = 1024 * 1024;

function response(status: number): Response {
  // Webhook responses intentionally contain no account, order, or payment data.
  return Response.json({ received: status >= 200 && status < 300 }, { status });
}

function hexBytes(value: string): ArrayBuffer | null {
  if (!/^[0-9a-f]{64}$/i.test(value)) return null;
  return Uint8Array.from(value.match(/.{2}/g)!.map((pair) => Number.parseInt(pair, 16))).buffer;
}

async function validWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const bytes = hexBytes(signature);
  if (!bytes) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify("HMAC", key, bytes, new TextEncoder().encode(body));
}

async function providerGet(path: string, authorization: string): Promise<Record<string, unknown> | null> {
  const providerResponse = await fetch(`https://api.razorpay.com/v1/${path}`, {
    headers: { Authorization: authorization },
  });
  if (!providerResponse.ok) return null;
  const body = await providerResponse.json().catch(() => null);
  return body && typeof body === "object" ? body as Record<string, unknown> : null;
}

function entity(payload: Record<string, unknown>, name: string): Record<string, unknown> | null {
  const wrapper = payload[name];
  if (!wrapper || typeof wrapper !== "object") return null;
  const value = (wrapper as Record<string, unknown>).entity;
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

async function reconcile(event: Record<string, unknown>, authorization: string): Promise<200 | 400 | 503> {
  const eventName = event.event;
  if (eventName !== "payment.captured" && eventName !== "order.paid") return 200;
  const payload = event.payload;
  if (!payload || typeof payload !== "object") return 400;
  const eventPayload = payload as Record<string, unknown>;
  const webhookOrder = entity(eventPayload, "order");
  const webhookPayment = entity(eventPayload, "payment");
  const orderId = eventName === "payment.captured" ? webhookPayment?.order_id : webhookOrder?.id;
  if (!validId(orderId, "order_")) return 400;

  // Never grant from webhook fields alone. Fetch the canonical provider state.
  const order = await providerGet(`orders/${encodeURIComponent(orderId)}`, authorization);
  if (!order) return 503;

  let paymentId = webhookPayment?.id;
  if (!validId(paymentId, "pay_")) {
    const collection = await providerGet(`orders/${encodeURIComponent(orderId)}/payments`, authorization);
    if (!collection || !Array.isArray(collection.items)) return 503;
    const captured = collection.items.find((item: unknown) => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Record<string, unknown>;
      return candidate.order_id === orderId && candidate.status === "captured" && candidate.captured === true;
    }) as Record<string, unknown> | undefined;
    paymentId = captured?.id;
  }
  if (!validId(paymentId, "pay_")) return 400;
  const payment = await providerGet(`payments/${encodeURIComponent(paymentId)}`, authorization);
  if (!payment) return 503;

  const notes = order.notes && typeof order.notes === "object"
    ? order.notes as Record<string, unknown>
    : {};
  const userId = notes.user_id;
  const purchaseId = notes.purchase_id;
  const pageCount = Number(notes.page_count);
  const receipt = typeof purchaseId === "string" ? `export_${purchaseId.replaceAll("-", "")}` : null;
  const expectedAmount = 1000 + pageCount * 200;
  if (order.id !== orderId || payment.id !== paymentId || payment.order_id !== orderId ||
    typeof userId !== "string" || !UUID.test(userId) || typeof purchaseId !== "string" || !UUID.test(purchaseId) ||
    !Number.isInteger(pageCount) || pageCount < 1 || pageCount > 500 ||
    order.receipt !== receipt || order.currency !== "INR" || payment.currency !== "INR" ||
    order.amount !== expectedAmount || payment.amount !== expectedAmount ||
    order.status !== "paid" || order.amount_paid !== expectedAmount || order.amount_due !== 0 ||
    payment.status !== "captured" || payment.captured !== true) {
    return 400;
  }

  const admin = serviceClient();
  const { data: granted, error } = await admin.rpc("grant_export_purchase", {
    p_purchase_id: purchaseId,
    p_user_id: userId,
    p_receipt: receipt,
    p_order_id: orderId,
    p_payment_id: paymentId,
    p_page_count: pageCount,
    p_amount_paise: expectedAmount,
  });
  return error || granted !== purchaseId ? 503 : 200;
}

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method !== "POST") return response(405);
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    const authorization = razorpayAuth();
    if (!webhookSecret || !authorization) return response(503);
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return response(413);

    // Razorpay signs the exact raw bytes. Never JSON-parse before verification.
    const rawBody = await req.text().catch(() => null);
    if (rawBody === null) return response(400);
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) return response(413);
    const signature = req.headers.get("x-razorpay-signature") ?? "";
    if (!await validWebhookSignature(rawBody, signature, webhookSecret)) return response(401);
    let event: unknown;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return response(400);
    }
    if (!event || typeof event !== "object" || Array.isArray(event)) return response(400);
    try {
      return response(await reconcile(event as Record<string, unknown>, authorization));
    } catch {
      // A transient provider/database failure must be retried by Razorpay.
      return response(503);
    }
  },
};
