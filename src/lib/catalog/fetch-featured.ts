import { createServerSupabase } from "@/lib/supabase/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ProductSpec } from "@/lib/catalog/types";

export type FeaturedKind = "product" | "service";

export type FeaturedAdItem = {
  kind: FeaturedKind;
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  specs: ProductSpec[];
  image_paths: string[];
  href: string;
};

type BilingualEntry = {
  sku: string;
  am?: {
    name?: string;
    description?: string;
    specs?: ProductSpec[];
  };
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

function localize(
  item: FeaturedAdItem,
  locale: string,
): FeaturedAdItem {
  if (locale !== "am" || item.kind !== "product") return item;
  const am = loadAmharicBySku().get(item.sku);
  if (!am) return item;
  return {
    ...item,
    name: am.name || item.name,
    description: am.description || item.description,
    specs: Array.isArray(am.specs) && am.specs.length > 0 ? am.specs : item.specs,
  };
}

export async function fetchFeaturedAdItem(
  locale = "am",
): Promise<FeaturedAdItem | null> {
  const supabase = createServerSupabase();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, sku, slug, name, description, specs, image_paths")
    .eq("is_active", true)
    .eq("is_advertisement", true)
    .maybeSingle();

  if (productError) {
    console.error("fetchFeaturedAdItem products:", productError.message);
  }

  if (product) {
    return localize(
      {
        kind: "product",
        id: product.id,
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        description: product.description ?? "",
        specs: normalizeSpecs(product.specs),
        image_paths: Array.isArray(product.image_paths) ? product.image_paths : [],
        href: `/products/${product.slug}`,
      },
      locale,
    );
  }

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, sku, slug, name, description, specs, image_paths")
    .eq("is_active", true)
    .eq("is_advertisement", true)
    .maybeSingle();

  if (serviceError) {
    console.error("fetchFeaturedAdItem services:", serviceError.message);
  }

  if (!service) return null;

  return {
    kind: "service",
    id: service.id,
    sku: service.sku,
    slug: service.slug,
    name: service.name,
    description: service.description ?? "",
    specs: normalizeSpecs(service.specs),
    image_paths: Array.isArray(service.image_paths) ? service.image_paths : [],
    href: `/services/${service.slug}`,
  };
}
