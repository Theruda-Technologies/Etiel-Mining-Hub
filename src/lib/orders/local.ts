export type PlacedOrderItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  itemType: "product" | "service";
  image?: string;
};

export type PlacedOrder = {
  orderNumber: string;
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  notes: string;
  items: PlacedOrderItem[];
  createdAt: string;
};

const LAST_ORDER_KEY = "etiel-last-order-v1";
const ORDERS_KEY = "etiel-orders-v1";

export function savePlacedOrder(order: PlacedOrder) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  try {
    const prev = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]") as PlacedOrder[];
    const next = [order, ...prev.filter((o) => o.orderNumber !== order.orderNumber)].slice(
      0,
      50,
    );
    localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getLastPlacedOrder(): PlacedOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_KEY);
    return raw ? (JSON.parse(raw) as PlacedOrder) : null;
  } catch {
    return null;
  }
}

export function getStoredOrders(): PlacedOrder[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]") as PlacedOrder[];
  } catch {
    return [];
  }
}

export function lookupStoredOrder(
  orderNumber: string,
  contact: string,
): PlacedOrder | null {
  const needle = orderNumber.trim().toUpperCase();
  const contactNeedle = contact.trim().toLowerCase();
  return (
    getStoredOrders().find(
      (o) =>
        o.orderNumber.toUpperCase() === needle &&
        (o.customerEmail.toLowerCase() === contactNeedle ||
          o.customerPhone.replace(/\s/g, "") === contact.replace(/\s/g, "")),
    ) ?? null
  );
}
