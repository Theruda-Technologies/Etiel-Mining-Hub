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
  /** Catalog card detail rows */
  detailKeys: [string, string] | [string, string, string];
  /** Detail page metric bar (3) */
  metricKeys: [string, string, string];
  /** Detail page capability cards (3) */
  capabilityKeys: [string, string, string];
  /** Tier comparison row keys */
  tierKeys: [string, string, string];
  /** Sidebar trust badges */
  sidebarBadges: [string, string];
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
    metricKeys: ["duration", "crew", "handover"],
    capabilityKeys: ["commission", "integration", "training"],
    tierKeys: ["leadTime", "crew", "warranty"],
    sidebarBadges: ["certified", "logistics"],
    icon: "wrench",
  },
  {
    id: "field_support",
    slug: "field-support-24-7",
    sku: "SVC-MAIN-01",
    category: "maintenance",
    price: 2800,
    detailKeys: ["coverage", "response"],
    metricKeys: ["sla", "coverage", "parts"],
    capabilityKeys: ["repairs", "remote", "scheduled"],
    tierKeys: ["response", "parts", "engineer"],
    sidebarBadges: ["certified", "logistics"],
    icon: "headset",
  },
  {
    id: "operator_cert",
    slug: "operator-certification",
    sku: "SVC-TRAIN-01",
    category: "training",
    price: 1200,
    detailKeys: ["duration", "cert"],
    metricKeys: ["duration", "classSize", "credential"],
    capabilityKeys: ["classroom", "field", "assessment"],
    tierKeys: ["hours", "ratio", "credential"],
    sidebarBadges: ["certified", "logistics"],
    icon: "cap",
  },
  {
    id: "predictive",
    slug: "predictive-diagnostics",
    sku: "SVC-MAIN-02",
    category: "maintenance",
    price: 1900,
    detailKeys: ["interval", "channels"],
    metricKeys: ["interval", "channels", "alerts"],
    capabilityKeys: ["sensors", "analytics", "dispatch"],
    tierKeys: ["sampling", "channels", "escalation"],
    sidebarBadges: ["certified", "logistics"],
    icon: "pulse",
  },
  {
    id: "leasing",
    slug: "capital-equipment-leasing",
    sku: "SVC-FIN-01",
    category: "financing",
    price: 0,
    detailKeys: ["term", "approval"],
    metricKeys: ["term", "approval", "down"],
    capabilityKeys: ["flexible", "upgrade", "support"],
    tierKeys: ["term", "rate", "buyout"],
    sidebarBadges: ["certified", "logistics"],
    icon: "building",
  },
];

export function getServiceBySlug(slug: string) {
  return CATALOG_SERVICES.find((s) => s.slug === slug);
}
