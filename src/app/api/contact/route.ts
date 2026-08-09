import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

type ContactBody = {
  fullName?: string;
  phone?: string;
  email?: string;
  message?: string;
};

function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: Request) {
  try {
    const limited = rateLimit(`contact:${clientIp(req)}`, 8);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "rate_limited", retryAfterSec: limited.retryAfterSec },
        { status: 429 },
      );
    }

    const body = (await req.json()) as ContactBody;
    const fullName = body.fullName?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const message = body.message?.trim() ?? "";

    if (!fullName || !phone || !message) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase.rpc("create_contact_inquiry", {
      p_full_name: fullName,
      p_phone: phone,
      p_email: email || null,
      p_message: message,
    });

    if (error) {
      const rateLimited = /too many inquiries/i.test(error.message);
      return NextResponse.json(
        {
          error: rateLimited ? "rate_limited" : "create_failed",
          message: error.message,
        },
        { status: rateLimited ? 429 : 400 },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
