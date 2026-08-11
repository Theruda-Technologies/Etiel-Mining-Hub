import { Resend } from "resend";

export type AuthEmailKind = "signup" | "recovery";

function parseFrom(raw: string | undefined): string {
  const fallback = "Etiel Mining Hub <noreply@mail.etielmininghub.com>";
  if (!raw?.trim()) return fallback;
  return raw.trim().replace(/^["']|["']$/g, "");
}

function resendApiKey(): string {
  const key =
    process.env.RESEND_API_KEY?.trim() || process.env.SMTP_PASS?.trim();
  if (!key) throw new Error("Missing RESEND_API_KEY or SMTP_PASS");
  return key;
}

function copyFor(kind: AuthEmailKind) {
  if (kind === "recovery") {
    return {
      subject: "Reset your Etiel Mining Hub password",
      heading: "Reset your password",
      body: "We received a request to reset your password. Click the button below to choose a new one. If you did not request this, you can ignore this email.",
      cta: "Reset password",
    };
  }
  return {
    subject: "Confirm your Etiel Mining Hub account",
    heading: "Confirm your email",
    body: "Thanks for creating an account. Confirm your email to finish signing up.",
    cta: "Confirm email",
  };
}

function renderEmailHtml(input: {
  name?: string;
  heading: string;
  body: string;
  cta: string;
  actionUrl: string;
}) {
  const greeting = input.name ? `Hi ${input.name},` : "Hi,";
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#12100e;color:#f5f2eb;font-family:Georgia,serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <p style="font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c9a227;">Etiel Mining Hub</p>
      <h1 style="font-size:28px;line-height:1.2;margin:16px 0 12px;">${input.heading}</h1>
      <p style="margin:0 0 12px;color:#d8d2c4;">${greeting}</p>
      <p style="margin:0 0 24px;color:#d8d2c4;line-height:1.55;">${input.body}</p>
      <a href="${input.actionUrl}" style="display:inline-block;background:#c9a227;color:#12100e;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:2px;">${input.cta}</a>
      <p style="margin:28px 0 0;font-size:12px;color:#9a9284;line-height:1.5;">If the button does not work, open this link:<br /><a href="${input.actionUrl}" style="color:#c9a227;word-break:break-all;">${input.actionUrl}</a></p>
    </div>
  </body>
</html>`;
}

export async function sendAuthEmail(input: {
  to: string;
  kind: AuthEmailKind;
  actionUrl: string;
  name?: string;
}) {
  const copy = copyFor(input.kind);
  const resend = new Resend(resendApiKey());
  const { error } = await resend.emails.send({
    from: parseFrom(process.env.SMTP_FROM || process.env.RESEND_FROM),
    to: [input.to],
    subject: copy.subject,
    html: renderEmailHtml({
      name: input.name,
      heading: copy.heading,
      body: copy.body,
      cta: copy.cta,
      actionUrl: input.actionUrl,
    }),
  });
  if (error) throw new Error(error.message);
}
