export type ServiceCategory =
  | "all"
  | "installation"
  | "maintenance"
  | "training"
  | "financing";

export type CatalogService = {
  id: string;
  slug: string;
  sku: string;
  category: Exclude<ServiceCategory, "all">;
  price: number;
  /** Detail row keys resolved via i18n */
  detailKeys: [string, string] | [string, string, string];
  icon: "wrench" | "headset" | "cap" | "pulse" | "building";
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "all",
  "installation",
  "maintenance",
  "training",
  "financing",
];

export const CATALOG_SERVICES: CatalogService[] = [
  {
    id: "onsite_assembly",
    slug: "on-site-assembly",
    sku: "SVC-INST-01",
    category: "installation",
    price: 4500,
    detailKeys: ["duration", "crew"],
    icon: "wrench",
  },
  {
    id: "field_support",
    slug: "field-support-24-7",
    sku: "SVC-MAIN-01",
    category: "maintenance",
    price: 2800,
    detailKeys: ["coverage", "response"],
    icon: "headset",
  },
  {
    id: "operator_cert",
    slug: "operator-certification",
    sku: "SVC-TRAIN-01",
    category: "training",
    price: 1200,
    detailKeys: ["duration", "cert"],
    icon: "cap",
  },
  {
    id: "predictive",
    slug: "predictive-diagnostics",
    sku: "SVC-MAIN-02",
    category: "maintenance",
    price: 1900,
    detailKeys: ["interval", "channels"],
    icon: "pulse",
  },
  {
    id: "leasing",
    slug: "capital-equipment-leasing",
    sku: "SVC-FIN-01",
    category: "financing",
    price: 0,
    detailKeys: ["term", "approval"],
    icon: "building",
  },
];

export function getServiceBySlug(slug: string) {
  return CATALOG_SERVICES.find((s) => s.slug === slug);
}
