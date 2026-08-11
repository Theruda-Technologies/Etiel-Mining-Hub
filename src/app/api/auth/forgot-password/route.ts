import { NextResponse } from "next/server";
import { sendAuthEmail } from "@/lib/email/auth-mail";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/seo";
import { createAdminSupabase } from "@/lib/supabase/admin";

type ForgotBody = {
  email?: string;
  redirectTo?: string;
};

function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isAllowedRedirect(url: string | undefined): string {
  const fallback = `${SITE_URL}/reset-password`;
  if (!url) return fallback;
  try {
    const parsed = new URL(url);
    const originOk =
      parsed.origin === SITE_URL ||
      parsed.hostname === "etielmininghub.com" ||
      parsed.hostname.endsWith(".etielmininghub.com") ||
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1";
    if (!originOk) return fallback;
    if (!parsed.pathname.includes("/reset-password")) return fallback;
    return parsed.toString();
  } catch {
    return fallback;
  }
}

export async function POST(req: Request) {
  try {
    const limited = rateLimit(`auth-forgot:${clientIp(req)}`, 5);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "rate_limited", retryAfterSec: limited.retryAfterSec },
        { status: 429 },
      );
    }

    const body = (await req.json()) as ForgotBody;
    const email = body.email?.trim().toLowerCase() ?? "";
    const redirectTo = isAllowedRedirect(body.redirectTo);

    // Always return ok to avoid account enumeration.
    if (!email) {
      return NextResponse.json({ ok: true });
    }

    const admin = createAdminSupabase();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    if (!error) {
      const actionUrl = data.properties?.action_link;
      if (actionUrl) {
        await sendAuthEmail({
          to: email,
          kind: "recovery",
          actionUrl,
        });
      }
    } else {
      // Do not leak whether the email exists.
      console.error("forgot-password generateLink:", error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("forgot-password route failed:", err);
    return NextResponse.json({ ok: true });
  }
}
