-- Orders, line items, status history, order-number counters

CREATE TABLE public.order_number_counters (
  order_date date PRIMARY KEY,
  last_seq integer NOT NULL DEFAULT 0 CHECK (last_seq >= 0)
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  shipping_address text NOT NULL,
  notes text NOT NULL DEFAULT '',
  internal_notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    )),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_order_number_unique UNIQUE (order_number),
  CONSTRAINT orders_customer_name_len CHECK (char_length(trim(customer_name)) BETWEEN 1 AND 200),
  CONSTRAINT orders_customer_phone_len CHECK (char_length(trim(customer_phone)) BETWEEN 5 AND 40),
  CONSTRAINT orders_customer_email_len CHECK (char_length(trim(customer_email)) BETWEEN 3 AND 254),
  CONSTRAINT orders_shipping_address_len CHECK (char_length(trim(shipping_address)) BETWEEN 5 AND 1000),
  CONSTRAINT orders_notes_len CHECK (char_length(notes) <= 2000),
  CONSTRAINT orders_internal_notes_len CHECK (char_length(internal_notes) <= 5000)
);

CREATE INDEX orders_status_idx ON public.orders (status);
CREATE INDEX orders_created_at_idx ON public.orders (created_at DESC);
CREATE INDEX orders_customer_email_idx ON public.orders (lower(customer_email));
CREATE INDEX orders_customer_phone_idx ON public.orders (customer_phone);

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('product', 'service')),
  product_id uuid REFERENCES public.products (id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.services (id) ON DELETE SET NULL,
  name_snapshot text NOT NULL,
  sku_snapshot text NOT NULL,
  unit_price_snapshot numeric(12, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 999),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_items_type_consistency CHECK (
    (item_type = 'product' AND service_id IS NULL)
    OR (item_type = 'service' AND product_id IS NULL)
  )
);

CREATE INDEX order_items_order_id_idx ON public.order_items (order_id);

CREATE TABLE public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL
    CHECK (to_status IN (
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    )),
  note text NOT NULL DEFAULT '',
  changed_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX order_status_history_order_id_idx ON public.order_status_history (order_id);
CREATE INDEX order_status_history_created_at_idx ON public.order_status_history (created_at);
