import { createServerSupabase } from "@/lib/supabase/server";
import {
  productCategories,
  primaryImage,
  type ProductSpec,
  type StoreProduct,
} from "@/lib/catalog/types";

export type { ProductSpec, StoreProduct };
export { productCategories, primaryImage };

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

export async function fetchActiveProducts(): Promise<StoreProduct[]> {
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

  return (data ?? []).map((row) => mapRow(row as DbProductRow));
}

export async function fetchProductBySlug(slug: string): Promise<StoreProduct | null> {
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

  return mapRow(data as DbProductRow);
}
