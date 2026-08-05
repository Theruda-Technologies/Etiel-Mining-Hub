"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/store";
import { savePlacedOrder, type PlacedOrder } from "@/lib/orders/local";

export function CheckoutPageClient() {
  const t = useTranslations("store");
  const router = useRouter();
  const { items, count, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;

    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const customerName = String(form.get("fullName") || "").trim();
    const company = String(form.get("company") || "").trim();
    const customerEmail = String(form.get("email") || "").trim();
    const customerPhone = String(form.get("phone") || "").trim();
    const siteAddress = String(form.get("siteAddress") || "").trim();
    const city = String(form.get("city") || "").trim();
    const region = String(form.get("region") || "").trim();
    const postal = String(form.get("postal") || "").trim();
    const notes = String(form.get("notes") || "").trim();

    const shippingAddress = [siteAddress, city, region, postal, company]
      .filter(Boolean)
      .join(", ");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          shippingAddress,
          notes,
          items: items.map((i) => ({
            itemType: i.itemType,
            itemId: i.id,
            sku: i.sku,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(
          data?.error === "catalog_not_seeded"
            ? t("checkout.errors.catalog")
            : t("checkout.errors.generic"),
        );
        setSubmitting(false);
        return;
      }

      const order: PlacedOrder = {
        id: data.id,
        orderNumber: data.order_number,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        notes,
        createdAt: new Date().toISOString(),
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          sku: i.sku,
          quantity: i.quantity,
          itemType: i.itemType,
          image: i.image,
        })),
      };

      savePlacedOrder(order);
      clear();
      router.push(`/order/confirmed?order=${encodeURIComponent(order.orderNumber)}`);
    } catch {
      setError(t("checkout.errors.generic"));
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-basalt-deep pt-24 md:pt-28">
        <div className="mx-auto max-w-3xl px-5 pb-20 text-center md:px-8">
          <h1 className="font-display text-3xl font-bold text-white">
            {t("checkout.emptyTitle")}
          </h1>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-sm bg-amber px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-basalt-deep"
          >
            {t("checkout.browse")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-basalt-deep pt-24 md:pt-28">
      <div className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <div className="mb-6 flex justify-end">
          <Link
            href="/cart"
            className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-white/60 transition-colors hover:text-amber"
          >
            ← {t("checkout.returnToCart")}
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.9fr]">
          <div>
            <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
              {t("checkout.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">
              {t("checkout.subtitle")}
            </p>

            <form id="checkout-form" onSubmit={onSubmit} className="mt-10 space-y-5">
              <FormSection title={t("checkout.contactTitle")} icon="contact">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field name="fullName" label={t("checkout.fullName")} placeholder="e.g. Jane Doe" required />
                  <Field name="company" label={t("checkout.company")} placeholder="e.g. Apex Minerals Corp" />
                  <Field name="email" label={t("checkout.email")} type="email" placeholder="jane@company.com" required />
                  <Field name="phone" label={t("checkout.phone")} placeholder="+251 ..." required />
                </div>
              </FormSection>

              <FormSection title={t("checkout.deliveryTitle")} icon="truck">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field
                      name="siteAddress"
                      label={t("checkout.siteAddress")}
                      placeholder="Site address / PO Box"
                      required
                    />
                  </div>
                  <Field name="city" label={t("checkout.city")} placeholder="e.g. Addis Ababa" required />
                  <Field name="region" label={t("checkout.region")} placeholder="e.g. Oromia" />
                  <Field name="postal" label={t("checkout.postal")} placeholder="e.g. 1000" />
                </div>
              </FormSection>

              <FormSection title={t("checkout.notesTitle")} icon="notes">
                <label className="block">
                  <span className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-text-secondary">
                    {t("checkout.notesLabel")}
                  </span>
                  <textarea
                    name="notes"
                    rows={4}
                    placeholder={t("checkout.notesPlaceholder")}
                    className="mt-2 w-full rounded-sm border border-white/15 bg-white px-3 py-2.5 text-sm text-basalt-deep placeholder:text-basalt/40 focus:outline-none focus:ring-2 focus:ring-amber"
                  />
                </label>
              </FormSection>

              {error ? (
                <p className="text-sm text-[#c45c4a]" role="alert">
                  {error}
                </p>
              ) : null}
            </form>
          </div>

          <aside className="h-fit rounded-sm border border-white/15 bg-basalt-elevated p-6">
            <h2 className="font-display text-lg font-bold text-white">
              {t("checkout.summaryTitle")}
            </h2>
            <p className="mt-1 font-mono-tech text-[11px] text-text-secondary">
              {t("checkout.summaryHint")}
            </p>

            <ul className="mt-5 space-y-3 border-t border-white/10 pt-5">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-sm border border-white/10 bg-basalt-deep/50 p-3"
                >
                  <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-sm bg-basalt-muted">
                    <Image
                      src={item.image || "/images/equipment-drill.jpg"}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{item.name}</p>
                    <p className="font-mono-tech text-[10px] text-text-secondary">
                      {item.sku}
                    </p>
                  </div>
                  <p className="font-mono-tech text-xs text-amber">
                    ×{item.quantity}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-white/10 pt-5 font-mono-tech text-[11px] uppercase tracking-[0.1em]">
              <div className="flex justify-between">
                <dt className="text-text-secondary">{t("checkout.subtotalItems")}</dt>
                <dd className="text-white">{count} {t("checkout.units")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">{t("checkout.fulfillment")}</dt>
                <dd className="text-white">{t("checkout.sla")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">{t("checkout.payment")}</dt>
                <dd className="text-amber">{t("checkout.pendingInvoice")}</dd>
              </div>
            </dl>

            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-amber px-5 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-basalt-deep transition-colors hover:bg-amber-bright disabled:opacity-60"
            >
              {submitting ? t("checkout.placing") : t("checkout.placeOrder")}
              <span aria-hidden>›</span>
            </button>
            <p className="mt-3 text-center text-[11px] text-text-secondary">
              {t("checkout.terms")}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: "contact" | "truck" | "notes";
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-sm border border-white/15 bg-basalt-elevated p-5 md:p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
        <span className="text-amber">
          {icon === "contact" ? "▣" : icon === "truck" ? "▸" : "✎"}
        </span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  name,
  label,
  placeholder,
  required,
  type = "text",
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-text-secondary">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-sm border border-white/15 bg-white px-3 py-2.5 text-sm text-basalt-deep placeholder:text-basalt/40 focus:outline-none focus:ring-2 focus:ring-amber"
      />
    </label>
  );
}
