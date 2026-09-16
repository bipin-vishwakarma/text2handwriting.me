import { createClient } from "@supabase/supabase-js";

const originList = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",").map((origin) => origin.trim()).filter(Boolean);

export function cors(req: Request): HeadersInit {
  const origin = req.headers.get("origin");
  // No cookies are used. An explicit allowlist is strongly recommended in production.
  const allowedOrigin = originList.length
    ? (origin && originList.includes(origin) ? origin : "null")
    : "*";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function originAllowed(req: Request): boolean {
  const origin = req.headers.get("origin");
  return !origin || originList.length === 0 || originList.includes(origin);
}

export function json(req: Request, body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: cors(req) });
}

export function bearer(req: Request): string | null {
  const match = /^Bearer ([^\s]+)$/i.exec(req.headers.get("Authorization") ?? "");
  return match?.[1] ?? null;
}

export function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Payment storage is not configured");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function razorpayAuth(): string | null {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keyId || !secret) return null;
  return `Basic ${btoa(`${keyId}:${secret}`)}`;
}

export function validId(id: unknown, prefix: string): id is string {
  return typeof id === "string" && id.startsWith(prefix) &&
    /^[a-zA-Z0-9_-]{5,100}$/.test(id);
}
