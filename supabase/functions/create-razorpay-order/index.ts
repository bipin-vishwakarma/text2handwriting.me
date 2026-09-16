import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { bearer, cors, json, originAllowed, razorpayAuth, serviceClient } from "../_shared/payment.ts";

const amountFor = (pages: number) => 1000 + 200 * pages;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    if (!originAllowed(req)) return json(req, { error: "Origin not allowed" }, 403);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
    if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

    try {
      const token = bearer(req);
      if (!token) return json(req, { error: "Unauthorized" }, 401);
      const { data: { user }, error: authError } = await ctx.supabase.auth.getUser(token);
      if (authError || !user) return json(req, { error: "Unauthorized" }, 401);

      let body: { pageCount?: unknown; purchaseId?: unknown };
      try { body = await req.json(); } catch { return json(req, { error: "Invalid JSON body" }, 400); }
      const pageCount = body.pageCount;
      if (!Number.isInteger(pageCount) || (pageCount as number) < 1 || (pageCount as number) > 500) {
        return json(req, { error: "pageCount must be an integer between 1 and 500" }, 400);
      }
      if (body.purchaseId !== undefined && (typeof body.purchaseId !== "string" || !UUID.test(body.purchaseId))) {
        return json(req, { error: "purchaseId must be a UUID" }, 400);
      }

      const providerAuthorization = razorpayAuth();
      if (!providerAuthorization) return json(req, { error: "Payment provider is not configured" }, 503);

      const purchaseId = typeof body.purchaseId === "string" ? body.purchaseId.toLowerCase() : crypto.randomUUID();
      const amount = amountFor(pageCount as number);
      const receipt = `export_${purchaseId.replaceAll("-", "")}`;
      const admin = serviceClient();
      const row = { id: purchaseId, user_id: user.id, receipt, page_count: pageCount, amount_paise: amount, currency: "INR" };
      const inserted = await admin.from("export_purchases").insert(row).select("id").maybeSingle();

      if (inserted.error) {
        // A client-generated purchaseId makes order creation retryable. Never
        // reveal or reuse a purchase that belongs to another account/request.
        const existing = await admin.from("export_purchases")
          .select("id, user_id, razorpay_order_id, page_count, amount_paise, status")
          .eq("id", purchaseId).maybeSingle();
        if (existing.error || !existing.data || existing.data.user_id !== user.id ||
          existing.data.page_count !== pageCount || existing.data.amount_paise !== amount) {
          return json(req, { error: "Unable to reserve payment order" }, 409);
        }
        if (existing.data.status === "pending" && existing.data.razorpay_order_id) {
          return json(req, {
            id: existing.data.razorpay_order_id, amount, currency: "INR", receipt,
            purchase_id: purchaseId,
          });
        }
        return json(req, { error: "Payment order already exists or is in progress", purchase_id: purchaseId }, 409);
      }

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": providerAuthorization },
        body: JSON.stringify({
          amount, currency: "INR", receipt,
          notes: { user_id: user.id, purchase_id: purchaseId, page_count: String(pageCount) },
        }),
      });
      const order = await response.json().catch(() => null);
      if (!response.ok || typeof order?.id !== "string" || order.amount !== amount || order.currency !== "INR") {
        return json(req, { error: "Unable to create payment order", purchase_id: purchaseId }, 502);
      }

      const saved = await admin.from("export_purchases")
        .update({ razorpay_order_id: order.id }).eq("id", purchaseId).is("razorpay_order_id", null)
        .select("id").maybeSingle();
      if (saved.error || !saved.data) {
        return json(req, { error: "Payment order could not be recorded; do not pay it", purchase_id: purchaseId }, 503);
      }

      return json(req, { id: order.id, amount, currency: "INR", receipt, purchase_id: purchaseId });
    } catch {
      return json(req, { error: "Payment service temporarily unavailable" }, 500);
    }
  }),
};
