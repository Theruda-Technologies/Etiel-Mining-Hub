import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  primaryImage,
  serviceCategories,
  type ProductSpec,
  type StoreService,
} from "@/lib/catalog/types";

export type { ProductSpec, StoreService };
export { primaryImage, serviceCategories };

type DbServiceRow = {
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

function mapRow(row: DbServiceRow): StoreService {
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

export async function fetchActiveServices(): Promise<StoreService[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("services")
    .select("id, sku, slug, name, description, category, specs, image_paths, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("fetchActiveServices:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapRow(row as DbServiceRow));
}

export const fetchServiceBySlug = cache(
  async (slug: string): Promise<StoreService | null> => {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("services")
      .select(
        "id, sku, slug, name, description, category, specs, image_paths, sort_order",
      )
      .eq("is_active", true)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("fetchServiceBySlug:", error.message);
      return null;
    }
    if (!data) return null;

    return mapRow(data as DbServiceRow);
  },
);
