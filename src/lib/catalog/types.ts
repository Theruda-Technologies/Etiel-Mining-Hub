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

const CATEGORY_ORDER = [
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

export function primaryImage(product: StoreProduct): string {
  return product.image_paths[0] || "/images/etiel-site-images/Nokta-9000.png";
}

export function productCategories(products: StoreProduct[]): string[] {
  const present = new Set(products.map((p) => p.category));
  return CATEGORY_ORDER.filter((key) => key === "all" || present.has(key));
}
