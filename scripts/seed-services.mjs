/**
 * Wipe stale services and seed from supabase/data/services.bilingual.json
 *
 * Usage:
 *   set -a && source .env.local && set +a && npm run seed:services
 *
 * Uses the service role key. Inserts English name/description/specs into the DB.
 * Amharic copy stays in the JSON for app i18n.
 *
 * Local image paths in the JSON are uploaded to the public `service-images`
 * Storage bucket; `image_paths` in the DB stores the resulting public URLs.
 *
 * Set `"is_advertisement": true` on at most one service for the homepage ad
 * (clears product ads when a service is advertised).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { uploadLocalImagesToBucket } from "./lib/upload-catalog-images.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const dataPath = join(root, "supabase/data/services.bilingual.json");
const data = JSON.parse(readFileSync(dataPath, "utf8"));

if (!Array.isArray(data.services) || data.services.length === 0) {
  console.error("No services found in", dataPath);
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const adSkus = data.services.filter((s) => s.is_advertisement).map((s) => s.sku);
if (adSkus.length > 1) {
  console.error("Only one service may have is_advertisement=true. Found:", adSkus.join(", "));
  process.exit(1);
}

console.log(`Uploading images + seeding ${data.services.length} services…`);

const rows = [];
for (const service of data.services) {
  const locale = service.en;
  if (!locale?.name || !locale?.description || !Array.isArray(locale.specs)) {
    throw new Error(`Service ${service.sku} is missing en.name/description/specs`);
  }
  if (!Array.isArray(service.image_paths) || service.image_paths.length === 0) {
    throw new Error(`Service ${service.sku} needs at least one local image_paths entry`);
  }

  console.log(`  images ${service.sku} (${service.image_paths.length})…`);
  const imageUrls = await uploadLocalImagesToBucket(supabase, {
    bucket: "service-images",
    publicDir,
    localPaths: service.image_paths,
    objectPrefix: service.sku.toLowerCase(),
  });

  rows.push({
    id: service.id,
    sku: service.sku,
    slug: service.slug,
    category: service.category,
    name: locale.name,
    description: locale.description,
    specs: locale.specs,
    image_paths: imageUrls,
    is_active: service.is_active !== false,
    is_advertisement: service.is_advertisement === true,
    sort_order: service.sort_order ?? 0,
  });
}

const { data: existing, error: listError } = await supabase
  .from("services")
  .select("id, sku");

if (listError) {
  console.error("Failed to list services:", listError.message);
  process.exit(1);
}

const keepSkus = new Set(rows.map((r) => r.sku));
const staleIds = (existing ?? [])
  .filter((row) => !keepSkus.has(row.sku))
  .map((row) => row.id);

if (staleIds.length > 0) {
  const { error: deleteStaleError, count: staleCount } = await supabase
    .from("services")
    .delete({ count: "exact" })
    .in("id", staleIds);

  if (deleteStaleError) {
    console.error("Failed to remove stale services:", deleteStaleError.message);
    process.exit(1);
  }
  console.log(`Removed ${staleCount ?? staleIds.length} stale service row(s).`);
}

const advertised = rows.find((r) => r.is_advertisement);
if (advertised) {
  const { error: clearProductAdError } = await supabase
    .from("products")
    .update({ is_advertisement: false })
    .eq("is_advertisement", true);

  if (clearProductAdError && !/is_advertisement/.test(clearProductAdError.message)) {
    console.error("Failed to clear product ads:", clearProductAdError.message);
    process.exit(1);
  }
}

const existingBySku = new Map((existing ?? []).map((row) => [row.sku, row.id]));

for (const row of rows) {
  const existingId = existingBySku.get(row.sku);
  if (existingId) {
    const { id: _id, ...fields } = row;
    const { error: updateError } = await supabase
      .from("services")
      .update(fields)
      .eq("id", existingId);
    if (updateError) {
      console.error(`Failed to update ${row.sku}:`, updateError.message);
      process.exit(1);
    }
  } else {
    const { error: insertError } = await supabase.from("services").insert(row);
    if (insertError) {
      console.error(`Failed to insert ${row.sku}:`, insertError.message);
      process.exit(1);
    }
  }
}

const { count: seededCount, error: countError } = await supabase
  .from("services")
  .select("*", { count: "exact", head: true })
  .eq("is_active", true);

if (countError) {
  console.error("Seeded, but count check failed:", countError.message);
  process.exit(1);
}

console.log(`Seeded ${seededCount} active services (images in Storage bucket service-images).`);
if (advertised) {
  console.log(`Homepage advertisement: ${advertised.sku}`);
}
for (const row of rows) {
  console.log(
    `  - ${row.sku}  ${row.slug}${row.is_advertisement ? "  [ad]" : ""}  (${row.image_paths.length} img)`,
  );
}
