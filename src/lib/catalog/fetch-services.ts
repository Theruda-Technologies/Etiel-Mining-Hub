import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  primaryImage,
  serviceCategories,
  type ProductSpec,
  type StoreService,
} from "@/lib/catalog/types";

export type { ProductSpec, StoreService };
export { primaryImage, serviceCategories };

type BilingualEntry = {
  sku: string;
  am?: {
    name?: string;
    description?: string;
    specs?: ProductSpec[];
  };
};

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

function loadAmharicBySku(): Map<string, BilingualEntry["am"]> {
  try {
    const path = join(process.cwd(), "supabase/data/services.bilingual.json");
    const data = JSON.parse(readFileSync(path, "utf8")) as {
      services?: BilingualEntry[];
    };
    const map = new Map<string, BilingualEntry["am"]>();
    for (const service of data.services ?? []) {
      if (service.sku && service.am) map.set(service.sku, service.am);
    }
    return map;
  } catch {
    return new Map();
  }
}

function applyLocale(services: StoreService[], locale: string): StoreService[] {
  if (locale !== "am") return services;
  const amBySku = loadAmharicBySku();
  return services.map((service) => {
    const am = amBySku.get(service.sku);
    if (!am) return service;
    return {
      ...service,
      name: am.name || service.name,
      description: am.description || service.description,
      specs: Array.isArray(am.specs) && am.specs.length > 0 ? am.specs : service.specs,
    };
  });
}

export async function fetchActiveServices(locale = "am"): Promise<StoreService[]> {
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

  return applyLocale((data ?? []).map((row) => mapRow(row as DbServiceRow)), locale);
}

export async function fetchServiceBySlug(
  slug: string,
  locale = "am",
): Promise<StoreService | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("services")
    .select("id, sku, slug, name, description, category, specs, image_paths, sort_order")
    .eq("is_active", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("fetchServiceBySlug:", error.message);
    return null;
  }
  if (!data) return null;

  const [localized] = applyLocale([mapRow(data as DbServiceRow)], locale);
  return localized ?? null;
}
