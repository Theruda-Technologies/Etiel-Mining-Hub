# Product seed data

Source file: [`products.bilingual.json`](./products.bilingual.json)

## Seed (upsert + Storage uploads)

```bash
set -a && source .env.local && set +a && npm run seed:products
```

This:

1. Uploads each product’s local `image_paths` files from `public/` into the public Supabase Storage bucket `product-images`
2. Upserts English catalog fields into `public.products`
3. Removes active rows whose SKU is not in the JSON
4. Writes **Storage public URLs** into `products.image_paths` (not repo paths, not base64)

Amharic copy stays in the JSON for app i18n.

## Why Storage (not base64 / bytea)

Supabase is built for object storage for binary assets. Putting images as base64 or `bytea` in Postgres bloats rows, slows queries, and is harder to cache. The existing `product-images` / `service-images` buckets are the efficient path: binary blobs in Storage, URL strings in the table.

## Schema mapping (`public.products`)

| JSON field | DB column | Notes |
|---|---|---|
| `id` | `id` | Stable UUID for upserts |
| `sku` | `sku` | Unique; also Storage folder prefix |
| `slug` | `slug` | Unique |
| `category` | `category` | Must match CHECK constraint |
| `image_paths` | `image_paths` | Seed input: local `/images/...` paths. DB value: Storage public URLs |
| `is_active` | `is_active` | |
| `is_advertisement` | `is_advertisement` | Homepage ad when true |
| `sort_order` | `sort_order` | |
| `en.name` | `name` | Primary DB language |
| `en.description` | `description` | Primary DB language |
| `en.specs` | `specs` | `jsonb` array of `{label,value}` |
| `am.*` | (app i18n) | Keep for Amharic storefront |

Price is not seeded. The DB column may still exist with default `0`; the storefront does not use it.

## Homepage ad

The homepage ad section loads the first active product or service with `is_advertisement = true` (product preferred if both exist).

## Services

Use the same pattern with bucket `service-images` when seeding services (`scripts/seed-catalog.mjs` uploads local files the same way when present).
