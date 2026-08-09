/**
 * Upserts legacy demo storefront catalog into Supabase using the service role.
 * Prefer `npm run seed:products` for the live Etiel catalog.
 *
 * Run: set -a && source .env.local && set +a && node scripts/seed-catalog.mjs
 *
 * Local image paths are uploaded to Storage; DB rows store public URLs.
 */
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

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const products = [
  {
    id: "a1000001-0001-4000-8000-000000000001",
    sku: "DR-9800-X",
    name: "MAGNETAR Drill X-9",
    slug: "magnetar-drill-x9",
    description:
      "High-torque rotary drill engineered for continuous subterranean operations.",
    category: "drilling",
    price: 185000,
    image_paths: ["/images/equipment-drill.jpg"],
    is_active: true,
    sort_order: 10,
  },
  {
    id: "a1000001-0001-4000-8000-000000000002",
    sku: "CV-400-T",
    name: "Titan Conveyor C-400",
    slug: "titan-conveyor-c400",
    description: "Heavy-duty modular conveyor for high-throughput material transfer.",
    category: "mining_supplies",
    price: 42000,
    image_paths: ["/images/equipment-conveyor.jpg"],
    is_active: true,
    sort_order: 20,
  },
  {
    id: "a1000001-0001-4000-8000-000000000003",
    sku: "DRN-AS-V",
    name: "AeroScout Pro-V",
    slug: "aeroscout-pro-v",
    description: "Survey drone platform for site mapping and inspection.",
    category: "ground_scanners",
    price: 12500,
    image_paths: ["/images/equipment-drone.jpg"],
    is_active: true,
    sort_order: 30,
  },
  {
    id: "a1000001-0001-4000-8000-000000000004",
    sku: "EX-5T-G",
    name: "Goliath Exca-Bucket 5T",
    slug: "goliath-exca-bucket-5t",
    description: "Abrasion-resistant excavator bucket for high-cycle digging.",
    category: "excavators",
    price: 9800,
    image_paths: ["/images/equipment-bucket.jpg"],
    is_active: true,
    sort_order: 40,
  },
  {
    id: "a1000001-0001-4000-8000-000000000005",
    sku: "SF-HELM-S",
    name: "Sentinel Smart Helm",
    slug: "sentinel-smart-helm",
    description: "Connected safety helmet with crew communications.",
    category: "mining_supplies",
    price: 890,
    image_paths: ["/images/equipment-helmet.jpg"],
    is_active: true,
    sort_order: 50,
  },
];

const services = [
  {
    id: "b1000001-0001-4000-8000-000000000001",
    sku: "SVC-INST-01",
    name: "On-Site Assembly",
    slug: "on-site-assembly",
    description: "Commissioning and assembly for heavy equipment deployments.",
    category: "on_site_assembly",
    price: 4500,
    image_paths: ["/images/field-tunnel.jpg"],
    is_active: true,
    sort_order: 10,
  },
  {
    id: "b1000001-0001-4000-8000-000000000002",
    sku: "SVC-MAIN-01",
    name: "24/7 Field Support",
    slug: "field-support-24-7",
    description: "Round-the-clock field maintenance and emergency response.",
    category: "field_support",
    price: 2800,
    image_paths: ["/images/field-tunnel.jpg"],
    is_active: true,
    sort_order: 20,
  },
  {
    id: "b1000001-0001-4000-8000-000000000003",
    sku: "SVC-TRAIN-01",
    name: "Operator Certification",
    slug: "operator-certification",
    description: "Classroom and field certification for equipment operators.",
    category: "training",
    price: 1200,
    image_paths: ["/images/field-tunnel.jpg"],
    is_active: true,
    sort_order: 30,
  },
  {
    id: "b1000001-0001-4000-8000-000000000004",
    sku: "SVC-MAIN-02",
    name: "Predictive Diagnostics",
    slug: "predictive-diagnostics",
    description: "Sensor-driven diagnostics and maintenance forecasting.",
    category: "field_support",
    price: 1900,
    image_paths: ["/images/field-tunnel.jpg"],
    is_active: true,
    sort_order: 40,
  },
  {
    id: "b1000001-0001-4000-8000-000000000005",
    sku: "SVC-FIN-01",
    name: "Capital Equipment Leasing",
    slug: "capital-equipment-leasing",
    description: "Flexible financing for capital equipment programs.",
    category: "financing",
    price: 0,
    image_paths: ["/images/field-tunnel.jpg"],
    is_active: true,
    sort_order: 50,
  },
];

async function withUploadedImages(row, bucket) {
  const image_paths = await uploadLocalImagesToBucket(supabase, {
    bucket,
    publicDir,
    localPaths: row.image_paths,
    objectPrefix: row.sku.toLowerCase(),
  });
  return { ...row, image_paths };
}

async function upsertBySkuOrSlug(table, row) {
  const { id, ...fields } = row;

  const { data: bySku } = await supabase
    .from(table)
    .select("id")
    .eq("sku", row.sku)
    .maybeSingle();

  if (bySku) {
    const { error } = await supabase.from(table).update(fields).eq("id", bySku.id);
    if (error) throw new Error(`${table} update by sku ${row.sku}: ${error.message}`);
    return;
  }

  const { data: bySlug } = await supabase
    .from(table)
    .select("id")
    .eq("slug", row.slug)
    .maybeSingle();

  if (bySlug) {
    const { error } = await supabase.from(table).update(fields).eq("id", bySlug.id);
    if (error) throw new Error(`${table} update by slug ${row.slug}: ${error.message}`);
    return;
  }

  const { error } = await supabase.from(table).insert(row);
  if (error) throw new Error(`${table} insert ${row.sku}: ${error.message}`);
}

try {
  for (const product of products) {
    const row = await withUploadedImages(product, "product-images");
    await upsertBySkuOrSlug("products", row);
  }
  for (const service of services) {
    const row = await withUploadedImages(service, "service-images");
    await upsertBySkuOrSlug("services", row);
  }
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}

const productSkus = products.map((p) => p.sku);
const serviceSkus = services.map((s) => s.sku);

const { count: pCount } = await supabase
  .from("products")
  .select("*", { count: "exact", head: true })
  .in("sku", productSkus);

const { count: sCount } = await supabase
  .from("services")
  .select("*", { count: "exact", head: true })
  .in("sku", serviceSkus);

console.log(`Catalog ready — products: ${pCount}, services: ${sCount}`);
