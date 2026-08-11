import { Resend } from "resend";
import { Webhook } from "standardwebhooks";

type EmailActionType =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "email_change_new"
  | string;

type SendEmailHookPayload = {
  user: {
    email?: string;
    new_email?: string;
    user_metadata?: { full_name?: string };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: EmailActionType;
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
};

function parseFrom(raw: string | undefined): string {
  const fallback = "Etiel Mining Hub <noreply@mail.etielmininghub.com>";
  if (!raw?.trim()) return fallback;
  return raw.trim().replace(/^["']|["']$/g, "");
}

function resendApiKey(): string | null {
  return (
    process.env.RESEND_API_KEY?.trim() ||
    process.env.SMTP_PASS?.trim() ||
    null
  );
}

function hookSecret(): string | null {
  const raw = process.env.SEND_EMAIL_HOOK_SECRET?.trim();
  if (!raw) return null;
  return raw.replace(/^v1,whsec_/, "");
}

function actionCopy(action: EmailActionType): {
  subject: string;
  heading: string;
  body: string;
  cta: string;
} {
  switch (action) {
    case "recovery":
      return {
        subject: "Reset your Etiel Mining Hub password",
        heading: "Reset your password",
        body: "We received a request to reset your password. Click the button below to choose a new one. If you did not request this, you can ignore this email.",
        cta: "Reset password",
      };
    case "invite":
      return {
        subject: "You're invited to Etiel Mining Hub",
        heading: "Accept your invite",
        body: "You have been invited to Etiel Mining Hub. Click below to continue.",
        cta: "Accept invite",
      };
    case "magiclink":
      return {
        subject: "Your Etiel Mining Hub sign-in link",
        heading: "Sign in",
        body: "Use the button below to sign in to your Etiel Mining Hub account.",
        cta: "Sign in",
      };
    case "email_change":
    case "email_change_new":
      return {
        subject: "Confirm your email change",
        heading: "Confirm email change",
        body: "Confirm this email change for your Etiel Mining Hub account.",
        cta: "Confirm email",
      };
    case "signup":
    default:
      return {
        subject: "Confirm your Etiel Mining Hub account",
        heading: "Confirm your email",
        body: "Thanks for creating an account. Confirm your email to finish signing up.",
        cta: "Confirm email",
      };
  }
}

function buildVerifyUrl(
  supabaseUrl: string,
  tokenHash: string,
  type: string,
  redirectTo: string,
) {
  const url = new URL(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/verify`);
  url.searchParams.set("token", tokenHash);
  url.searchParams.set("type", type);
  if (redirectTo) url.searchParams.set("redirect_to", redirectTo);
  return url.toString();
}

function renderEmailHtml(input: {
  name?: string;
  heading: string;
  body: string;
  cta: string;
  actionUrl: string;
  otp?: string;
}) {
  const greeting = input.name ? `Hi ${input.name},` : "Hi,";
  const otpBlock = input.otp
    ? `<p style="margin:24px 0;font-family:ui-monospace,monospace;font-size:28px;letter-spacing:0.2em;color:#c9a227;">${input.otp}</p>`
    : "";

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#12100e;color:#f5f2eb;font-family:Georgia,serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <p style="font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c9a227;">Etiel Mining Hub</p>
      <h1 style="font-size:28px;line-height:1.2;margin:16px 0 12px;">${input.heading}</h1>
      <p style="margin:0 0 12px;color:#d8d2c4;">${greeting}</p>
      <p style="margin:0 0 24px;color:#d8d2c4;line-height:1.55;">${input.body}</p>
      ${otpBlock}
      <a href="${input.actionUrl}" style="display:inline-block;background:#c9a227;color:#12100e;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:2px;">${input.cta}</a>
      <p style="margin:28px 0 0;font-size:12px;color:#9a9284;line-height:1.5;">If the button does not work, open this link:<br /><a href="${input.actionUrl}" style="color:#c9a227;word-break:break-all;">${input.actionUrl}</a></p>
    </div>
  </body>
</html>`;
}

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return Response.json({ error: "method_not_allowed" }, { status: 405 });
  }

  const apiKey = resendApiKey();
  const secret = hookSecret();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!apiKey || !secret || !supabaseUrl) {
    console.error("send-email hook misconfigured: missing env");
    return Response.json(
      {
        error: {
          http_code: 500,
          message: "Email hook is not configured",
        },
      },
      { status: 500 },
    );
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  try {
    const wh = new Webhook(secret);
    const verified = wh.verify(payload, headers) as SendEmailHookPayload;
    const { user, email_data } = verified;
    const to = user.email?.trim();
    if (!to) {
      throw new Error("Missing recipient email");
    }

    const copy = actionCopy(email_data.email_action_type);
    const actionUrl = buildVerifyUrl(
      supabaseUrl,
      email_data.token_hash,
      email_data.email_action_type,
      email_data.redirect_to,
    );

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: parseFrom(process.env.SMTP_FROM || process.env.RESEND_FROM),
      to: [to],
      subject: copy.subject,
      html: renderEmailHtml({
        name: user.user_metadata?.full_name,
        heading: copy.heading,
        body: copy.body,
        cta: copy.cta,
        actionUrl,
        otp: email_data.token,
      }),
    });

    if (error) {
      throw error;
    }

    return Response.json({}, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send auth email";
    console.error("send-email hook failed:", message);
    return Response.json(
      {
        error: {
          http_code: 500,
          message,
        },
      },
      { status: 500 },
    );
  }
}
