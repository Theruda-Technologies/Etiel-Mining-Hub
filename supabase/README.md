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

## Production email (Resend SMTP)

Supabase’s built-in mailer is rate-limited and often fails in production. Point Auth SMTP at Resend:

1. Verify your domain in [Resend](https://resend.com) (e.g. `mail.etielmininghub.com`).
2. Create an API key in Resend.
3. Supabase Dashboard → **Project Settings → Authentication → SMTP Settings** (or Auth → Emails → SMTP):
   - Host: `smtp.resend.com`
   - Port: `465` (SSL) or `587` (STARTTLS)
   - Username: `resend`
   - Password: your Resend API key (`re_...`)
   - Sender email: `noreply@mail.etielmininghub.com` (must be on a verified Resend domain)
   - Sender name: `Etiel Mining Hub`
4. Supabase Dashboard → **Authentication → URL Configuration**:
   - **Site URL:** `https://etielmininghub.com`
   - **Redirect URLs** (add all):
     - `https://etielmininghub.com/auth/callback`
     - `https://etielmininghub.com/reset-password`
     - `https://etielmininghub.com/am/auth/callback`
     - `https://etielmininghub.com/am/reset-password`
     - Local (optional): `http://localhost:3000/auth/callback`, `http://localhost:3000/reset-password`, and the `/am/...` variants
5. Deploy `NEXT_PUBLIC_SITE_URL=https://etielmininghub.com` with your host env vars.

App routes:

| Path | Purpose |
|------|---------|
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
