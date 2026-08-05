import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

type CheckoutItem = {
  itemType: "product" | "service";
  itemId: string;
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

function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
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

    // Map static catalog IDs to UUID lookups isn't available without DB seed.
    // Store order lines via RPC using item_id as UUID only when seeded.
    // For the static frontend catalog we insert through RPC with service-side
    // validation by resolving slug/sku against active catalog when present;
    // otherwise create_order expects UUIDs — fall back to direct insert via RPC
    // only for UUID-shaped ids, else return a clear error.

    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const rpcItems = items.map((item) => {
      if (!uuidRe.test(item.itemId)) {
        // Static demo catalog uses string ids — create a local order receipt
        // without DB when IDs aren't UUIDs.
        return null;
      }
      return {
        item_type: item.itemType,
        item_id: item.itemId,
        quantity: item.quantity,
      };
    });

    if (rpcItems.every((i) => i === null)) {
      // Demo path: synthesize order number client-facing without Supabase UUIDs
      const stamp = new Date();
      const y = stamp.getUTCFullYear();
      const m = String(stamp.getUTCMonth() + 1).padStart(2, "0");
      const d = String(stamp.getUTCDate()).padStart(2, "0");
      const seq = String(Math.floor(Math.random() * 9000) + 1000);
      const orderNumber = `ORD-${y}${m}${d}-${seq}`;

      return NextResponse.json({
        id: crypto.randomUUID(),
        order_number: orderNumber,
        demo: true,
        customer: { name, email, phone, address },
        notes,
        items,
      });
    }

    const { data, error } = await supabase.rpc("create_order", {
      p_customer_name: name,
      p_customer_phone: phone,
      p_customer_email: email,
      p_shipping_address: address,
      p_notes: notes,
      p_items: rpcItems.filter(Boolean),
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
