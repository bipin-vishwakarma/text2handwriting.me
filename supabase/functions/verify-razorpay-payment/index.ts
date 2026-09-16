import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { bearer, cors, json, originAllowed, razorpayAuth, serviceClient, validId } from "../_shared/payment.ts";

async function validSignature(orderId: string, paymentId: string, signature: string, secret: string): Promise<boolean> {
  if (!/^[0-9a-f]{64}$/i.test(signature)) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const signatureBytes = new Uint8Array(signature.match(/.{2}/g)!.map((pair) => parseInt(pair, 16)));
  return crypto.subtle.verify("HMAC", key, signatureBytes,
    new TextEncoder().encode(`${orderId}|${paymentId}`));
}

async function providerGet(path: string, authorization: string): Promise<Record<string, unknown> | null> {
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    headers: { "Authorization": authorization },
  });
  if (!response.ok) return null;
  const value = await response.json().catch(() => null);
  return value && typeof value === "object" ? value : null;
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    if (!originAllowed(req)) return json(req, { error: "Origin not allowed" }, 403);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
    if (req.method !== "POST" && req.method !== "GET") return json(req, { error: "Method not allowed" }, 405);

    try {
      const token = bearer(req);
      if (!token) return json(req, { error: "Unauthorized" }, 401);
      const { data: { user }, error: authError } = await ctx.supabase.auth.getUser(token);
      if (authError || !user) return json(req, { error: "Unauthorized" }, 401);
      const admin = serviceClient();

      if (req.method === "GET") {
        const { data, error } = await admin.from("export_purchases")
          .select("id, razorpay_order_id, razorpay_payment_id, page_count, amount_paise, paid_at")
          .eq("user_id", user.id).eq("status", "paid")
          .order("paid_at", { ascending: false }).limit(100);
        if (error) return json(req, { error: "Unable to load purchase history" }, 503);
        return json(req, { purchases: (data ?? []).map((row) => ({
          purchase_id: row.id, order_id: row.razorpay_order_id,
          payment_id: row.razorpay_payment_id, page_count: row.page_count,
          amount_paise: row.amount_paise, paid_at: row.paid_at,
        })) });
      }

      let body: Record<string, unknown>;
      try { body = await req.json(); } catch { return json(req, { error: "Invalid JSON body" }, 400); }
      const orderId = body.razorpay_order_id;
      const paymentId = body.razorpay_payment_id;
      const signature = body.razorpay_signature;
      if (!validId(orderId, "order_") || !validId(paymentId, "pay_") || typeof signature !== "string") {
        return json(req, { error: "Invalid payment identifiers" }, 400);
      }
      const providerAuthorization = razorpayAuth();
      const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
      if (!providerAuthorization || !secret) return json(req, { error: "Payment provider is not configured" }, 503);
      if (!await validSignature(orderId, paymentId, signature, secret)) {
        return json(req, { error: "Invalid payment signature" }, 400);
      }

      const [order, payment] = await Promise.all([
        providerGet(`orders/${encodeURIComponent(orderId)}`, providerAuthorization),
        providerGet(`payments/${encodeURIComponent(paymentId)}`, providerAuthorization),
      ]);
      if (!order || !payment) return json(req, { error: "Unable to confirm captured payment" }, 502);
      const notes = order.notes && typeof order.notes === "object" ? order.notes as Record<string, unknown> : {};
      const pageCount = Number(notes.page_count);
      const purchaseId = notes.purchase_id;
      const receipt = typeof purchaseId === "string" ? `export_${purchaseId.replaceAll("-", "")}` : null;
      const expectedAmount = 1000 + pageCount * 200;
      if (order.id !== orderId || payment.id !== paymentId || payment.order_id !== orderId ||
        notes.user_id !== user.id || typeof purchaseId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(purchaseId) ||
        !Number.isInteger(pageCount) || pageCount < 1 || pageCount > 500 ||
        order.receipt !== receipt || order.currency !== "INR" || payment.currency !== "INR" ||
        order.amount !== expectedAmount || payment.amount !== expectedAmount ||
        order.status !== "paid" || order.amount_paid !== expectedAmount || order.amount_due !== 0 ||
        payment.status !== "captured" || payment.captured !== true) {
        return json(req, { error: "Payment does not match a captured export order for this account" }, 403);
      }

      const { data: granted, error: grantError } = await admin.rpc("grant_export_purchase", {
        p_purchase_id: purchaseId, p_user_id: user.id, p_receipt: receipt,
        p_order_id: orderId, p_payment_id: paymentId,
        p_page_count: pageCount, p_amount_paise: expectedAmount,
      });
      if (grantError || granted !== purchaseId) {
        // A paid order is recoverable: retry this signed verification payload.
        return json(req, { error: "Payment captured but entitlement could not be recorded; retry verification", order_id: orderId }, 503);
      }
      return json(req, { success: true, message: "Payment verified successfully",
        purchase_id: purchaseId, order_id: orderId, page_count: pageCount });
    } catch {
      return json(req, { error: "Payment service temporarily unavailable" }, 500);
    }
  }),
};
