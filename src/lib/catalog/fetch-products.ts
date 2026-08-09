import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  productCategories,
  primaryImage,
  type ProductSpec,
  type StoreProduct,
} from "@/lib/catalog/types";

export type { ProductSpec, StoreProduct };
export { productCategories, primaryImage };

type BilingualEntry = {
  sku: string;
  am?: {
    name?: string;
    description?: string;
    specs?: ProductSpec[];
  };
};

type DbProductRow = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  specs: unknown;
  image_paths: string[] | null;
  sort_order: number | null;
};

function normalizeSpecs(raw: unknown): ProductSpec[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const label = typeof row.label === "string" ? row.label : "";
      const value = typeof row.value === "string" ? row.value : "";
      if (!label || !value) return null;
      return { label, value };
    })
    .filter((s): s is ProductSpec => s !== null);
}

function mapRow(row: DbProductRow): StoreProduct {
  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    category: row.category,
    specs: normalizeSpecs(row.specs),
    image_paths: Array.isArray(row.image_paths) ? row.image_paths : [],
    sort_order: row.sort_order ?? 0,
  };
}

function loadAmharicBySku(): Map<string, BilingualEntry["am"]> {
  try {
    const path = join(process.cwd(), "supabase/data/products.bilingual.json");
    const data = JSON.parse(readFileSync(path, "utf8")) as {
      products?: BilingualEntry[];
    };
    const map = new Map<string, BilingualEntry["am"]>();
    for (const product of data.products ?? []) {
      if (product.sku && product.am) map.set(product.sku, product.am);
    }
    return map;
  } catch {
    return new Map();
  }
}

function applyLocale(products: StoreProduct[], locale: string): StoreProduct[] {
  if (locale !== "am") return products;
  const amBySku = loadAmharicBySku();
  return products.map((product) => {
    const am = amBySku.get(product.sku);
    if (!am) return product;
    return {
      ...product,
      name: am.name || product.name,
      description: am.description || product.description,
      specs: Array.isArray(am.specs) && am.specs.length > 0 ? am.specs : product.specs,
    };
  });
}

export async function fetchActiveProducts(locale = "am"): Promise<StoreProduct[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("id, sku, slug, name, description, category, specs, image_paths, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("fetchActiveProducts:", error.message);
    return [];
  }

  return applyLocale((data ?? []).map((row) => mapRow(row as DbProductRow)), locale);
}

export async function fetchProductBySlug(
  slug: string,
  locale = "am",
): Promise<StoreProduct | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("id, sku, slug, name, description, category, specs, image_paths, sort_order")
    .eq("is_active", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("fetchProductBySlug:", error.message);
    return null;
  }
  if (!data) return null;

  const [localized] = applyLocale([mapRow(data as DbProductRow)], locale);
  return localized ?? null;
}
