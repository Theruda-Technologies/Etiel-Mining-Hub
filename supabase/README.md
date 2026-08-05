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

- Disable public sign-ups (invite-only).
- Only `super_admin` should invite staff (via a future server route using the service role key).

## Bootstrap the first `super_admin`

Migrations cannot create Auth users. After creating your first user in **Authentication → Users** (or accepting an invite):

```sql
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'YOUR_EMAIL@example.com';
```

New Auth users get `admin` via the `handle_new_user` trigger. Only `super_admin` can change roles or delete other `admin` profiles (via RLS).

## Public RPCs

| Function | Caller | Purpose |
|----------|--------|---------|
| `create_order(...)` | anon | Place order + items; returns `{ id, order_number }` |
| `lookup_order(order_number, contact)` | anon | Status lookup by order number + email/phone |
| `update_order_status(order_id, status, note)` | staff | Enforced status transitions |

## Order status transitions

- `pending` → `confirmed` \| `cancelled`
- `confirmed` → `processing` \| `cancelled`
- `processing` → `shipped`
- `shipped` → `delivered`
- Terminal: `delivered`, `cancelled`
