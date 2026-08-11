# Supabase (Etiel Mining Hub)

## Project

- Cloud URL: `https://ccompobtyzjanpcfmhxi.supabase.co`
- Project ref: `ccompobtyzjanpcfmhxi`

## Setup

1. Copy `.env.example` → `.env.local` and fill `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` plus `SUPABASE_SERVICE_ROLE_KEY` (Dashboard → Project Settings → API).
2. Log in with the **account that owns** project `ccompobtyzjanpcfmhxi`:

```bash
supabase login
```

3. Link and push (you will be prompted for the database password from Dashboard → Project Settings → Database):

```bash
./scripts/push_db.sh
# or:
# supabase link --project-ref ccompobtyzjanpcfmhxi
# supabase db push
```

4. Optional smoke test: paste [`smoke_test.sql`](./smoke_test.sql) into the SQL Editor and run it.

**Note:** The CLI must be authenticated to an org that can access this project. If `supabase link` returns an access-control error, re-run `supabase login` with the owning account.

## Auth hardening

In the Supabase Dashboard → Authentication → Providers / Settings:

- **Storefront customers:** enable Email provider + allow public sign-ups (signup page uses `auth.signUp`; new users get `customer` via `handle_new_user`).
- **Confirm email:** enable if you want verification before sign-in. Confirmation and password-reset emails are sent by Supabase Auth (not by the Next.js app).
- **Staff:** invite-only is still recommended for `admin` / `super_admin`. Promote staff with:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'staff@example.com';
```

Only `super_admin` can change roles or delete other `admin` profiles (via RLS).

## Production email (Resend)

Signup and password-reset emails are sent by **this Next.js app** via Resend’s HTTP API (`/api/auth/signup`, `/api/auth/forgot-password`). That bypasses Supabase’s SMTP mailer, which was returning `Error sending confirmation email` even when Resend credentials were valid.

Required env vars on the host (and locally):

- `SUPABASE_SERVICE_ROLE_KEY` — used only on the server to call `auth.admin.generateLink`
- `RESEND_API_KEY` or `SMTP_PASS` — Resend API key
- `SMTP_FROM` — e.g. `Etiel Mining Hub <noreply@mail.etielmininghub.com>`
- `NEXT_PUBLIC_SITE_URL` — `https://etielmininghub.com`

Optional: Supabase Custom SMTP can stay configured, but the app no longer depends on it for signup/reset.

### URL Configuration

Supabase Dashboard → **Authentication → URL Configuration**:

- **Site URL:** `https://etielmininghub.com`
- **Redirect URLs:**
  - `https://etielmininghub.com/auth/callback`
  - `https://etielmininghub.com/reset-password`
  - `https://etielmininghub.com/am/auth/callback`
  - `https://etielmininghub.com/am/reset-password`
  - Local (optional): `http://localhost:3000/auth/callback`, `http://localhost:3000/reset-password`, and `/am/...` variants

App routes:

| Path | Purpose |
|------|---------|
| `/api/auth/signup` | Create user + send confirmation via Resend |
| `/api/auth/forgot-password` | Send password reset via Resend |
| `/api/auth/send-email` | Optional Supabase Send Email Hook endpoint |
| `/auth/callback` | Completes email confirmation links |
| `/forgot-password` | Request a password reset email |
| `/reset-password` | Set a new password after opening the reset link |

## Bootstrap the first `super_admin`

Migrations cannot create Auth users. After creating your first user in **Authentication → Users** (or accepting an invite):

```sql
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'YOUR_EMAIL@example.com';
```

## Public RPCs

| Function | Caller | Purpose |
|----------|--------|---------|
| `create_order(...)` | anon | Place order + items; returns `{ id, order_number }` |
| `lookup_order(order_number, contact)` | anon | Status lookup by order number + email/phone |
| `update_order_status(order_id, status, note)` | staff | Enforced status transitions |
| `create_contact_inquiry(...)` | anon | Contact form submit; returns `{ id, status }` |
| `update_contact_inquiry_status(id, status, notes)` | staff | Update inquiry status / internal notes |

## Contact inquiry statuses

- `new` (default on submit)
- `in_progress`
- `resolved`
- `closed`

Staff can `SELECT` / `UPDATE` `contact_inquiries` via RLS (`is_staff()`), or call `update_contact_inquiry_status`.

## Order status transitions

- `pending` → `confirmed` \| `cancelled`
- `confirmed` → `processing` \| `cancelled`
- `processing` → `shipped`
- `shipped` → `delivered`
- Terminal: `delivered`, `cancelled`
