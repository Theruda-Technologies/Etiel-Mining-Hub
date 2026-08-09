import { fetchActiveProducts } from "@/lib/catalog/fetch-products";
import { fetchActiveServices } from "@/lib/catalog/fetch-services";
import { primaryImage, type LineupItem } from "@/lib/catalog/types";

export type { LineupItem };

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function summaryFromSpecs(
  specs: { label: string; value: string }[],
  description: string,
): string {
  if (specs.length > 0) {
    return specs
      .slice(0, 2)
      .map((s) => `${s.label}: ${s.value}`)
      .join(" · ");
  }
  const trimmed = description.trim();
  if (trimmed.length <= 110) return trimmed;
  return `${trimmed.slice(0, 107).trimEnd()}…`;
}

/** Four active products + four active services, shuffled together. */
export async function fetchLineupMix(locale = "am"): Promise<LineupItem[]> {
  const [products, services] = await Promise.all([
    fetchActiveProducts(locale),
    fetchActiveServices(locale),
  ]);

  const productItems = shuffle(products)
    .slice(0, 4)
    .map(
      (product): LineupItem => ({
        id: product.id,
        kind: "product",
        name: product.name,
        category: product.category,
        summary: summaryFromSpecs(product.specs, product.description),
        image: primaryImage(product),
        href: `/products/${product.slug}`,
      }),
    );

  const serviceItems = shuffle(services)
    .slice(0, 4)
    .map(
      (service): LineupItem => ({
        id: service.id,
        kind: "service",
        name: service.name,
        category: service.category,
        summary: summaryFromSpecs(service.specs, service.description),
        image: primaryImage(service),
        href: `/services/${service.slug}`,
      }),
    );

  return shuffle([...productItems, ...serviceItems]);
}
