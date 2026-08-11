import { NextResponse } from "next/server";
import { sendAuthEmail } from "@/lib/email/auth-mail";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/seo";
import { createAdminSupabase } from "@/lib/supabase/admin";

type SignupBody = {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  emailRedirectTo?: string;
};

function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isAllowedRedirect(url: string | undefined): string {
  const fallback = `${SITE_URL}/auth/callback`;
  if (!url) return fallback;
  try {
    const parsed = new URL(url);
    const allowed = new Set([
      SITE_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]);
    const originOk =
      allowed.has(parsed.origin) ||
      parsed.hostname === "etielmininghub.com" ||
      parsed.hostname.endsWith(".etielmininghub.com") ||
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1";
    if (!originOk) return fallback;
    if (!parsed.pathname.includes("/auth/callback")) return fallback;
    return parsed.toString();
  } catch {
    return fallback;
  }
}

export async function POST(req: Request) {
  try {
    const limited = rateLimit(`auth-signup:${clientIp(req)}`, 8);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "rate_limited", retryAfterSec: limited.retryAfterSec },
        { status: 429 },
      );
    }

    const body = (await req.json()) as SignupBody;
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const fullName = body.fullName?.trim() ?? "";
    const phone = body.phone?.trim() || null;
    const emailRedirectTo = isAllowedRedirect(body.emailRedirectTo);

    if (!email || !password || password.length < 6 || !fullName) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const admin = createAdminSupabase();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
        redirectTo: emailRedirectTo,
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        return NextResponse.json({ error: "email_taken" }, { status: 409 });
      }
      console.error("signup generateLink failed:", error.message);
      return NextResponse.json({ error: "signup_failed" }, { status: 500 });
    }

    const actionUrl = data.properties?.action_link;
    if (!actionUrl) {
      return NextResponse.json({ error: "signup_failed" }, { status: 500 });
    }

    await sendAuthEmail({
      to: email,
      kind: "signup",
      actionUrl,
      name: fullName,
    });

    return NextResponse.json({ ok: true, needsConfirmation: true });
  } catch (err) {
    console.error("signup route failed:", err);
    return NextResponse.json({ error: "signup_failed" }, { status: 500 });
  }
}
