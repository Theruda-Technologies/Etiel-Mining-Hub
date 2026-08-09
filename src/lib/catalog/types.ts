export type ProductSpec = {
  label: string;
  value: string;
};

export type StoreProduct = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  specs: ProductSpec[];
  image_paths: string[];
  sort_order: number;
};

export type StoreService = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  specs: ProductSpec[];
  image_paths: string[];
  sort_order: number;
};

export type LineupItem = {
  id: string;
  kind: "product" | "service";
  name: string;
  category: string;
  summary: string;
  image: string;
  href: string;
};

const PRODUCT_CATEGORY_ORDER = [
  "all",
  "metal_detectors",
  "mining_supplies",
  "ground_scanners",
  "excavators",
  "drilling",
  "material_handling",
  "drones",
  "safety_gear",
] as const;

const SERVICE_CATEGORY_ORDER = [
  "all",
  "consulting",
  "on_site_assembly",
  "installation",
  "field_support",
  "maintenance",
  "training",
  "financing",
] as const;

export function primaryImage(product: StoreProduct | StoreService): string {
  return product.image_paths[0] || "/images/etiel-site-images/Nokta-9000.png";
}

export function productCategories(products: StoreProduct[]): string[] {
  const present = new Set(products.map((p) => p.category));
  return PRODUCT_CATEGORY_ORDER.filter((key) => key === "all" || present.has(key));
}

export function serviceCategories(services: StoreService[]): string[] {
  const present = new Set(services.map((s) => s.category));
  return SERVICE_CATEGORY_ORDER.filter((key) => key === "all" || present.has(key));
}
