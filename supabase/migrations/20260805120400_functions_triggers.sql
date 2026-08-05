-- Order number generation, create/lookup/status RPCs

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_date date := (timezone('utc', now()))::date;
  v_seq integer;
BEGIN
  IF NEW.order_number IS NOT NULL AND length(trim(NEW.order_number)) > 0 THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.order_number_counters (order_date, last_seq)
  VALUES (v_date, 1)
  ON CONFLICT (order_date)
  DO UPDATE SET last_seq = public.order_number_counters.last_seq + 1
  RETURNING last_seq INTO v_seq;

  NEW.order_number :=
    'ORD-' || to_char(v_date, 'YYYYMMDD') || '-' || lpad(v_seq::text, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_generate_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_number();

-- Seed initial pending history row when an order is created
CREATE OR REPLACE FUNCTION public.orders_insert_initial_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.order_status_history (order_id, from_status, to_status, note, changed_by)
  VALUES (NEW.id, NULL, NEW.status, 'Order created', NULL);
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_initial_status_history
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.orders_insert_initial_history();

-- Prevent direct status changes on orders (must use update_order_status RPC)
CREATE OR REPLACE FUNCTION public.orders_block_direct_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF current_setting('etiel.allow_status_update', true) IS DISTINCT FROM 'on' THEN
      RAISE EXCEPTION 'Order status can only be changed via update_order_status()';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_block_direct_status_change
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.orders_block_direct_status_change();

-- Line item input type for create_order
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'order_item_input' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.order_item_input AS (
      item_type text,
      item_id uuid,
      quantity integer
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_shipping_address text,
  p_notes text DEFAULT '',
  p_items public.order_item_input[] DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text := trim(p_customer_name);
  v_phone text := trim(p_customer_phone);
  v_email text := lower(trim(p_customer_email));
  v_address text := trim(p_shipping_address);
  v_notes text := coalesce(p_notes, '');
  v_item public.order_item_input;
  v_order_id uuid;
  v_order_number text;
  v_product public.products%ROWTYPE;
  v_service public.services%ROWTYPE;
  v_recent_count integer;
  v_item_count integer;
BEGIN
  IF v_name IS NULL OR char_length(v_name) < 1 OR char_length(v_name) > 200 THEN
    RAISE EXCEPTION 'Invalid customer name';
  END IF;
  IF v_phone IS NULL OR char_length(v_phone) < 5 OR char_length(v_phone) > 40 THEN
    RAISE EXCEPTION 'Invalid customer phone';
  END IF;
  IF v_email IS NULL
     OR v_email !~ '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
     OR char_length(v_email) > 254 THEN
    RAISE EXCEPTION 'Invalid customer email';
  END IF;
  IF v_address IS NULL OR char_length(v_address) < 5 OR char_length(v_address) > 1000 THEN
    RAISE EXCEPTION 'Invalid shipping address';
  END IF;
  IF char_length(v_notes) > 2000 THEN
    RAISE EXCEPTION 'Notes too long';
  END IF;

  v_item_count := coalesce(array_length(p_items, 1), 0);
  IF v_item_count < 1 OR v_item_count > 50 THEN
    RAISE EXCEPTION 'Order must contain between 1 and 50 line items';
  END IF;

  -- Simple rate limit: max 5 orders per email or phone per hour
  SELECT count(*) INTO v_recent_count
  FROM public.orders o
  WHERE o.created_at > now() - interval '1 hour'
    AND (lower(o.customer_email) = v_email OR o.customer_phone = v_phone);

  IF v_recent_count >= 5 THEN
    RAISE EXCEPTION 'Too many orders recently; please try again later';
  END IF;

  INSERT INTO public.orders (
    customer_name,
    customer_phone,
    customer_email,
    shipping_address,
    notes,
    status
  )
  VALUES (v_name, v_phone, v_email, v_address, v_notes, 'pending')
  RETURNING id, order_number INTO v_order_id, v_order_number;

  FOREACH v_item IN ARRAY p_items
  LOOP
    IF v_item.quantity IS NULL OR v_item.quantity < 1 OR v_item.quantity > 999 THEN
      RAISE EXCEPTION 'Invalid quantity for item %', v_item.item_id;
    END IF;

    IF v_item.item_type = 'product' THEN
      SELECT * INTO v_product
      FROM public.products
      WHERE id = v_item.item_id AND is_active = true;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Product not found or inactive: %', v_item.item_id;
      END IF;

      INSERT INTO public.order_items (
        order_id, item_type, product_id, service_id,
        name_snapshot, sku_snapshot, unit_price_snapshot, quantity
      ) VALUES (
        v_order_id, 'product', v_product.id, NULL,
        v_product.name, v_product.sku, v_product.price, v_item.quantity
      );

    ELSIF v_item.item_type = 'service' THEN
      SELECT * INTO v_service
      FROM public.services
      WHERE id = v_item.item_id AND is_active = true;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Service not found or inactive: %', v_item.item_id;
      END IF;

      INSERT INTO public.order_items (
        order_id, item_type, product_id, service_id,
        name_snapshot, sku_snapshot, unit_price_snapshot, quantity
      ) VALUES (
        v_order_id, 'service', NULL, v_service.id,
        v_service.name, v_service.sku, v_service.price, v_item.quantity
      );

    ELSE
      RAISE EXCEPTION 'Invalid item_type: %', v_item.item_type;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.lookup_order(
  p_order_number text,
  p_contact text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_contact text := lower(trim(p_contact));
  v_order_number text := upper(trim(p_order_number));
  v_items jsonb;
  v_history jsonb;
BEGIN
  IF v_order_number IS NULL OR char_length(v_order_number) < 5 THEN
    RAISE EXCEPTION 'Invalid order number';
  END IF;
  IF v_contact IS NULL OR char_length(v_contact) < 3 THEN
    RAISE EXCEPTION 'Invalid contact';
  END IF;

  SELECT * INTO v_order
  FROM public.orders o
  WHERE o.order_number = v_order_number
    AND (
      lower(o.customer_email) = v_contact
      OR o.customer_phone = trim(p_contact)
    );

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', i.id,
      'item_type', i.item_type,
      'name', i.name_snapshot,
      'sku', i.sku_snapshot,
      'unit_price', i.unit_price_snapshot,
      'quantity', i.quantity
    ) ORDER BY i.created_at
  ), '[]'::jsonb)
  INTO v_items
  FROM public.order_items i
  WHERE i.order_id = v_order.id;

  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', h.id,
      'from_status', h.from_status,
      'to_status', h.to_status,
      'note', h.note,
      'created_at', h.created_at
    ) ORDER BY h.created_at
  ), '[]'::jsonb)
  INTO v_history
  FROM public.order_status_history h
  WHERE h.order_id = v_order.id;

  RETURN jsonb_build_object(
    'id', v_order.id,
    'order_number', v_order.order_number,
    'customer_name', v_order.customer_name,
    'customer_phone', v_order.customer_phone,
    'customer_email', v_order.customer_email,
    'shipping_address', v_order.shipping_address,
    'notes', v_order.notes,
    'status', v_order.status,
    'created_at', v_order.created_at,
    'updated_at', v_order.updated_at,
    'items', v_items,
    'status_history', v_history
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id uuid,
  p_new_status text,
  p_note text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_old_status text;
  v_note text := coalesce(p_note, '');
  v_allowed boolean := false;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF char_length(v_note) > 2000 THEN
    RAISE EXCEPTION 'Note too long';
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  v_old_status := v_order.status;

  IF v_old_status = p_new_status THEN
    RAISE EXCEPTION 'Order is already in status %', p_new_status;
  END IF;

  v_allowed := CASE v_old_status
    WHEN 'pending' THEN p_new_status IN ('confirmed', 'cancelled')
    WHEN 'confirmed' THEN p_new_status IN ('processing', 'cancelled')
    WHEN 'processing' THEN p_new_status = 'shipped'
    WHEN 'shipped' THEN p_new_status = 'delivered'
    ELSE false
  END;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', v_old_status, p_new_status;
  END IF;

  PERFORM set_config('etiel.allow_status_update', 'on', true);

  UPDATE public.orders
  SET status = p_new_status
  WHERE id = p_order_id;

  INSERT INTO public.order_status_history (
    order_id, from_status, to_status, note, changed_by
  ) VALUES (
    p_order_id, v_old_status, p_new_status, v_note, auth.uid()
  );

  RETURN jsonb_build_object(
    'id', p_order_id,
    'order_number', v_order.order_number,
    'from_status', v_old_status,
    'to_status', p_new_status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_order(text, text, text, text, text, public.order_item_input[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lookup_order(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_order_status(uuid, text, text) FROM PUBLIC;

GRANT USAGE ON TYPE public.order_item_input TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order(text, text, text, text, text, public.order_item_input[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_order(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_order_status(uuid, text, text) TO authenticated;
