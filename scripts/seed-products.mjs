/**
 * Wipe public.products and seed from supabase/data/products.bilingual.json
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs) && node scripts/seed-products.mjs
 *
 * Uses the service role key. Inserts English name/description/specs into the DB.
 * Amharic copy stays in the JSON for app i18n.
 * Set `"is_advertisement": true` on at most one product for the homepage ad.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = join(root, "supabase/data/products.bilingual.json");
const data = JSON.parse(readFileSync(dataPath, "utf8"));

if (!Array.isArray(data.products) || data.products.length === 0) {
  console.error("No products found in", dataPath);
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const adSkus = data.products.filter((p) => p.is_advertisement).map((p) => p.sku);
if (adSkus.length > 1) {
  console.error("Only one product may have is_advertisement=true. Found:", adSkus.join(", "));
  process.exit(1);
}

const rows = data.products.map((product) => {
  const locale = product.en;
  if (!locale?.name || !locale?.description || !Array.isArray(locale.specs)) {
    throw new Error(`Product ${product.sku} is missing en.name/description/specs`);
  }

  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    category: product.category,
    name: locale.name,
    description: locale.description,
    specs: locale.specs,
    image_paths: product.image_paths,
    is_active: product.is_active !== false,
    is_advertisement: product.is_advertisement === true,
    sort_order: product.sort_order ?? 0,
  };
});

console.log(`Cleaning products table (${rows.length} to seed)…`);

const { data: existing, error: listError } = await supabase
  .from("products")
  .select("id, sku");

if (listError) {
  console.error("Failed to list products:", listError.message);
  process.exit(1);
}

const keepSkus = new Set(rows.map((r) => r.sku));
const staleIds = (existing ?? [])
  .filter((row) => !keepSkus.has(row.sku))
  .map((row) => row.id);

if (staleIds.length > 0) {
  const { error: deleteStaleError, count: staleCount } = await supabase
    .from("products")
    .delete({ count: "exact" })
    .in("id", staleIds);

  if (deleteStaleError) {
    console.error("Failed to remove stale products:", deleteStaleError.message);
    process.exit(1);
  }
  console.log(`Removed ${staleCount ?? staleIds.length} stale product row(s).`);
}

const { error: clearServiceAdError } = await supabase
  .from("services")
  .update({ is_advertisement: false })
  .eq("is_advertisement", true);

if (clearServiceAdError && !/is_advertisement/.test(clearServiceAdError.message)) {
  console.error("Failed to clear service ads:", clearServiceAdError.message);
  process.exit(1);
}

const { error: upsertError } = await supabase
  .from("products")
  .upsert(rows, { onConflict: "sku" });

if (upsertError) {
  console.error("Failed to seed products:", upsertError.message);
  process.exit(1);
}

const advertised = rows.find((r) => r.is_advertisement);
const { count: seededCount, error: countError } = await supabase
  .from("products")
  .select("*", { count: "exact", head: true })
  .eq("is_active", true);

if (countError) {
  console.error("Seeded, but count check failed:", countError.message);
  process.exit(1);
}

console.log(`Seeded ${seededCount} active products.`);
if (advertised) {
  console.log(`Homepage advertisement: ${advertised.sku}`);
}
for (const row of rows) {
  console.log(`  - ${row.sku}  ${row.slug}${row.is_advertisement ? "  [ad]" : ""}`);
}
