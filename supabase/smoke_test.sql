-- Smoke tests for Etiel Mining Hub (run in SQL editor as postgres after migrations).
-- Expected: no exceptions; final SELECT shows ok markers.

BEGIN;

-- 1) Insert inactive + active product (as table owner / bypass RLS)
INSERT INTO public.products (sku, name, slug, description, category, price, is_active)
VALUES
  ('TEST-ACTIVE', 'Test Active Detector', 'test-active-detector', 'Smoke test', 'metal_detectors', 100, true),
  ('TEST-INACTIVE', 'Test Inactive', 'test-inactive', 'Hidden', 'metal_detectors', 50, false);

INSERT INTO public.services (sku, name, slug, description, category, price, is_active)
VALUES
  ('SVC-TRAIN', 'Field Training', 'field-training', 'Smoke test service', 'training', 200, true);

COMMIT;

-- 2) create_order via RPC
DO $$
DECLARE
  v_product_id uuid;
  v_result jsonb;
BEGIN
  SELECT id INTO v_product_id FROM public.products WHERE sku = 'TEST-ACTIVE';
  v_result := public.create_order(
    'Smoke Tester',
    '+251911000000',
    'smoke@example.com',
    'Addis Ababa Test Site',
    'Smoke test notes',
    ARRAY[
      ROW('product', v_product_id, 2)::public.order_item_input
    ]
  );
  RAISE NOTICE 'create_order result: %', v_result;
  IF v_result->>'order_number' IS NULL OR v_result->>'order_number' NOT LIKE 'ORD-%' THEN
    RAISE EXCEPTION 'order_number missing or malformed';
  END IF;
END;
$$;

-- 3) lookup_order
DO $$
DECLARE
  v_num text;
  v_found jsonb;
  v_miss jsonb;
BEGIN
  SELECT order_number INTO v_num
  FROM public.orders
  WHERE customer_email = 'smoke@example.com'
  ORDER BY created_at DESC
  LIMIT 1;

  v_found := public.lookup_order(v_num, 'smoke@example.com');
  IF v_found IS NULL THEN
    RAISE EXCEPTION 'lookup_order should find order';
  END IF;

  v_miss := public.lookup_order(v_num, 'wrong@example.com');
  IF v_miss IS NOT NULL THEN
    RAISE EXCEPTION 'lookup_order should miss with wrong contact';
  END IF;

  RAISE NOTICE 'lookup ok: %', v_found->>'status';
END;
$$;

-- 4) Cleanup smoke catalog rows (orders may remain for inspection)
DELETE FROM public.products WHERE sku IN ('TEST-ACTIVE', 'TEST-INACTIVE');
DELETE FROM public.services WHERE sku = 'SVC-TRAIN';

SELECT 'smoke_tests_completed' AS status;
