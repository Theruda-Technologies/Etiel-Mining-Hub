# Product seed data

Source file: [`products.bilingual.json`](./products.bilingual.json)

## Seed (wipe + insert)

```bash
export $(grep -v '^#' .env.local | xargs) && npm run seed:products
```

This deletes all rows in `public.products`, then inserts the bilingual catalog (English fields written to the DB).

## Schema mapping (`public.products`)

| JSON field | DB column | Notes |
|---|---|---|
| `id` | `id` | Stable UUID for upserts |
| `sku` | `sku` | Unique |
| `slug` | `slug` | Unique |
| `category` | `category` | Must match CHECK constraint |
| `image_paths` | `image_paths` | `text[]` of public paths |
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
