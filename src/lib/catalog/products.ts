export type CatalogCategory =
  | "all"
  | "excavators"
  | "drilling"
  | "material_handling"
  | "drones"
  | "safety_gear";

export type CatalogProduct = {
  id: string;
  slug: string;
  sku: string;
  category: Exclude<CatalogCategory, "all">;
  image: string;
  gallery: [string, string, string];
  price: number;
  /** Spec keys for catalog cards (2) */
  specKeys: [string, string];
  /** Spec keys for detail technical grid (4) */
  detailSpecKeys: [string, string, string, string];
  /** Capability keys for detail page (3) */
  capabilityKeys: [string, string, string];
};

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  "all",
  "excavators",
  "drilling",
  "material_handling",
  "drones",
  "safety_gear",
];

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: "magnetar",
    slug: "magnetar-drill-x9",
    sku: "DR-9800-X",
    category: "drilling",
    image: "/images/equipment-drill.jpg",
    gallery: [
      "/images/equipment-drill.jpg",
      "/images/field-tunnel.jpg",
      "/images/hero-mine.jpg",
    ],
    price: 185000,
    specKeys: ["power", "depth"],
    detailSpecKeys: ["torque", "bitLoad", "depthCap", "powerSource"],
    capabilityKeys: ["nav", "mapping", "chassis"],
  },
  {
    id: "titan",
    slug: "titan-conveyor-c400",
    sku: "CV-400-T",
    category: "material_handling",
    image: "/images/equipment-conveyor.jpg",
    gallery: [
      "/images/equipment-conveyor.jpg",
      "/images/equipment-drill.jpg",
      "/images/field-tunnel.jpg",
    ],
    price: 42000,
    specKeys: ["capacity", "belt"],
    detailSpecKeys: ["capacity", "belt", "drive", "seal"],
    capabilityKeys: ["modular", "throughput", "service"],
  },
  {
    id: "aeroscout",
    slug: "aeroscout-pro-v",
    sku: "DRN-AS-V",
    category: "drones",
    image: "/images/equipment-drone.jpg",
    gallery: [
      "/images/equipment-drone.jpg",
      "/images/hero-mine.jpg",
      "/images/field-tunnel.jpg",
    ],
    price: 12500,
    specKeys: ["flight", "scan"],
    detailSpecKeys: ["flight", "scan", "range", "payload"],
    capabilityKeys: ["lidar", "weather", "fleet"],
  },
  {
    id: "goliath",
    slug: "goliath-exca-bucket-5t",
    sku: "EX-5T-G",
    category: "excavators",
    image: "/images/equipment-bucket.jpg",
    gallery: [
      "/images/equipment-bucket.jpg",
      "/images/hero-mine.jpg",
      "/images/equipment-conveyor.jpg",
    ],
    price: 9800,
    specKeys: ["capacity", "material"],
    detailSpecKeys: ["capacity", "material", "weight", "fitment"],
    capabilityKeys: ["abrasion", "cycle", "swap"],
  },
  {
    id: "sentinel",
    slug: "sentinel-smart-helm",
    sku: "SF-HELM-S",
    category: "safety_gear",
    image: "/images/equipment-helmet.jpg",
    gallery: [
      "/images/equipment-helmet.jpg",
      "/images/field-tunnel.jpg",
      "/images/equipment-drill.jpg",
    ],
    price: 890,
    specKeys: ["rating", "comms"],
    detailSpecKeys: ["rating", "comms", "battery", "weight"],
    capabilityKeys: ["alert", "audio", "comfort"],
  },
];

export function getProductBySlug(slug: string) {
  return CATALOG_PRODUCTS.find((p) => p.slug === slug);
}
