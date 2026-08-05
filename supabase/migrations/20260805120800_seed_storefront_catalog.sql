-- Align catalog categories with the storefront and seed matching products/services.

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_category_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_category_check
  CHECK (category IN (
    'metal_detectors',
    'excavators',
    'drilling',
    'mining_supplies',
    'ground_scanners',
    'material_handling',
    'drones',
    'safety_gear'
  ));

ALTER TABLE public.services
  DROP CONSTRAINT IF EXISTS services_category_check;

ALTER TABLE public.services
  ADD CONSTRAINT services_category_check
  CHECK (category IN (
    'on_site_assembly',
    'field_support',
    'training',
    'financing',
    'installation',
    'maintenance'
  ));

CREATE TEMP TABLE tmp_storefront_products (
  id uuid,
  sku text,
  name text,
  slug text,
  description text,
  category text,
  price numeric,
  image_paths text[],
  sort_order integer
) ON COMMIT DROP;

INSERT INTO tmp_storefront_products VALUES
  ('a1000001-0001-4000-8000-000000000001', 'DR-9800-X', 'MAGNETAR Drill X-9', 'magnetar-drill-x9', 'High-torque rotary drill engineered for continuous subterranean operations.', 'drilling', 185000, ARRAY['/images/equipment-drill.jpg'], 10),
  ('a1000001-0001-4000-8000-000000000002', 'CV-400-T', 'Titan Conveyor C-400', 'titan-conveyor-c400', 'Heavy-duty modular conveyor for high-throughput material transfer.', 'material_handling', 42000, ARRAY['/images/equipment-conveyor.jpg'], 20),
  ('a1000001-0001-4000-8000-000000000003', 'DRN-AS-V', 'AeroScout Pro-V', 'aeroscout-pro-v', 'Survey drone platform for site mapping and inspection.', 'drones', 12500, ARRAY['/images/equipment-drone.jpg'], 30),
  ('a1000001-0001-4000-8000-000000000004', 'EX-5T-G', 'Goliath Exca-Bucket 5T', 'goliath-exca-bucket-5t', 'Abrasion-resistant excavator bucket for high-cycle digging.', 'excavators', 9800, ARRAY['/images/equipment-bucket.jpg'], 40),
  ('a1000001-0001-4000-8000-000000000005', 'SF-HELM-S', 'Sentinel Smart Helm', 'sentinel-smart-helm', 'Connected safety helmet with crew communications.', 'safety_gear', 890, ARRAY['/images/equipment-helmet.jpg'], 50);

UPDATE public.products p
SET
  sku = t.sku,
  name = t.name,
  description = t.description,
  category = t.category,
  price = t.price,
  image_paths = t.image_paths,
  is_active = true,
  sort_order = t.sort_order,
  updated_at = now()
FROM tmp_storefront_products t
WHERE p.slug = t.slug OR p.sku = t.sku;

INSERT INTO public.products (
  id, sku, name, slug, description, category, price, image_paths, is_active, sort_order
)
SELECT t.id, t.sku, t.name, t.slug, t.description, t.category, t.price, t.image_paths, true, t.sort_order
FROM tmp_storefront_products t
WHERE NOT EXISTS (
  SELECT 1 FROM public.products p WHERE p.sku = t.sku OR p.slug = t.slug
);

CREATE TEMP TABLE tmp_storefront_services (
  id uuid,
  sku text,
  name text,
  slug text,
  description text,
  category text,
  price numeric,
  image_paths text[],
  sort_order integer
) ON COMMIT DROP;

INSERT INTO tmp_storefront_services VALUES
  ('b1000001-0001-4000-8000-000000000001', 'SVC-INST-01', 'On-Site Assembly', 'on-site-assembly', 'Commissioning and assembly for heavy equipment deployments.', 'installation', 4500, ARRAY['/images/field-tunnel.jpg'], 10),
  ('b1000001-0001-4000-8000-000000000002', 'SVC-MAIN-01', '24/7 Field Support', 'field-support-24-7', 'Round-the-clock field maintenance and emergency response.', 'maintenance', 2800, ARRAY['/images/field-tunnel.jpg'], 20),
  ('b1000001-0001-4000-8000-000000000003', 'SVC-TRAIN-01', 'Operator Certification', 'operator-certification', 'Classroom and field certification for equipment operators.', 'training', 1200, ARRAY['/images/field-tunnel.jpg'], 30),
  ('b1000001-0001-4000-8000-000000000004', 'SVC-MAIN-02', 'Predictive Diagnostics', 'predictive-diagnostics', 'Sensor-driven diagnostics and maintenance forecasting.', 'maintenance', 1900, ARRAY['/images/field-tunnel.jpg'], 40),
  ('b1000001-0001-4000-8000-000000000005', 'SVC-FIN-01', 'Capital Equipment Leasing', 'capital-equipment-leasing', 'Flexible financing for capital equipment programs.', 'financing', 0, ARRAY['/images/field-tunnel.jpg'], 50);

UPDATE public.services s
SET
  sku = t.sku,
  name = t.name,
  description = t.description,
  category = t.category,
  price = t.price,
  image_paths = t.image_paths,
  is_active = true,
  sort_order = t.sort_order,
  updated_at = now()
FROM tmp_storefront_services t
WHERE s.slug = t.slug OR s.sku = t.sku;

INSERT INTO public.services (
  id, sku, name, slug, description, category, price, image_paths, is_active, sort_order
)
SELECT t.id, t.sku, t.name, t.slug, t.description, t.category, t.price, t.image_paths, true, t.sort_order
FROM tmp_storefront_services t
WHERE NOT EXISTS (
  SELECT 1 FROM public.services s WHERE s.sku = t.sku OR s.slug = t.slug
);
