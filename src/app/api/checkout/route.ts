import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { CATALOG_PRODUCTS } from "@/lib/catalog/products";
import { CATALOG_SERVICES } from "@/lib/catalog/services";
import { rateLimit } from "@/lib/rate-limit";

type CheckoutItem = {
  itemType: "product" | "service";
  itemId: string;
  sku?: string;
  quantity: number;
};

type CheckoutBody = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  notes?: string;
  items: CheckoutItem[];
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function resolveSku(item: CheckoutItem): string | null {
  if (item.sku?.trim()) return item.sku.trim();
  if (UUID_RE.test(item.itemId)) return null;
  if (item.itemType === "product") {
    return CATALOG_PRODUCTS.find((p) => p.id === item.itemId)?.sku ?? null;
  }
  return CATALOG_SERVICES.find((s) => s.id === item.itemId)?.sku ?? null;
}

export async function POST(req: Request) {
  try {
    const limited = rateLimit(`checkout:${clientIp(req)}`, 5);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "rate_limited", retryAfterSec: limited.retryAfterSec },
        { status: 429 },
      );
    }

    const body = (await req.json()) as CheckoutBody;
    const name = body.customerName?.trim() ?? "";
    const phone = body.customerPhone?.trim() ?? "";
    const email = body.customerEmail?.trim().toLowerCase() ?? "";
    const address = body.shippingAddress?.trim() ?? "";
    const notes = body.notes?.trim() ?? "";
    const items = Array.isArray(body.items) ? body.items : [];

    if (!name || !phone || !email || !address || items.length < 1) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const productSkus = new Set<string>();
    const serviceSkus = new Set<string>();
    const uuidProducts = new Set<string>();
    const uuidServices = new Set<string>();

    for (const item of items) {
      if (!item.itemType || !item.itemId || !item.quantity) {
        return NextResponse.json({ error: "invalid_item" }, { status: 400 });
      }
      if (UUID_RE.test(item.itemId)) {
        if (item.itemType === "product") uuidProducts.add(item.itemId);
        else uuidServices.add(item.itemId);
        continue;
      }
      const sku = resolveSku(item);
      if (!sku) {
        return NextResponse.json(
          { error: "unknown_item", itemId: item.itemId },
          { status: 400 },
        );
      }
      if (item.itemType === "product") productSkus.add(sku);
      else serviceSkus.add(sku);
    }

    const skuToProductId = new Map<string, string>();
    const skuToServiceId = new Map<string, string>();

    if (productSkus.size > 0) {
      const { data, error } = await supabase
        .from("products")
        .select("id, sku")
        .in("sku", [...productSkus])
        .eq("is_active", true);
      if (error) {
        return NextResponse.json(
          { error: "catalog_lookup_failed", message: error.message },
          { status: 500 },
        );
      }
      for (const row of data ?? []) {
        skuToProductId.set(row.sku, row.id);
      }
    }

    if (serviceSkus.size > 0) {
      const { data, error } = await supabase
        .from("services")
        .select("id, sku")
        .in("sku", [...serviceSkus])
        .eq("is_active", true);
      if (error) {
        return NextResponse.json(
          { error: "catalog_lookup_failed", message: error.message },
          { status: 500 },
        );
      }
      for (const row of data ?? []) {
        skuToServiceId.set(row.sku, row.id);
      }
    }

    const rpcItems: {
      item_type: "product" | "service";
      item_id: string;
      quantity: number;
    }[] = [];

    for (const item of items) {
      let itemId = item.itemId;
      if (!UUID_RE.test(itemId)) {
        const sku = resolveSku(item)!;
        const resolved =
          item.itemType === "product"
            ? skuToProductId.get(sku)
            : skuToServiceId.get(sku);
        if (!resolved) {
          return NextResponse.json(
            {
              error: "catalog_not_seeded",
              message: `No active ${item.itemType} with SKU ${sku}. Seed the storefront catalog.`,
              sku,
            },
            { status: 400 },
          );
        }
        itemId = resolved;
      }

      rpcItems.push({
        item_type: item.itemType,
        item_id: itemId,
        quantity: item.quantity,
      });
    }

    const { data, error } = await supabase.rpc("create_order", {
      p_customer_name: name,
      p_customer_phone: phone,
      p_customer_email: email,
      p_shipping_address: address,
      p_notes: notes,
      p_items: rpcItems,
    });

    if (error) {
      return NextResponse.json(
        { error: "create_failed", message: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
