-- Catalog: products and services

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL
    CHECK (category IN (
      'metal_detectors',
      'excavators',
      'drilling',
      'mining_supplies',
      'ground_scanners'
    )),
  price numeric(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  specs jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_paths text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_sku_unique UNIQUE (sku),
  CONSTRAINT products_slug_unique UNIQUE (slug),
  CONSTRAINT products_specs_is_array CHECK (jsonb_typeof(specs) = 'array')
);

CREATE INDEX products_category_idx ON public.products (category);
CREATE INDEX products_is_active_idx ON public.products (is_active);
CREATE INDEX products_sort_order_idx ON public.products (sort_order);

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL
    CHECK (category IN (
      'on_site_assembly',
      'field_support',
      'training',
      'financing'
    )),
  price numeric(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  specs jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_paths text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT services_sku_unique UNIQUE (sku),
  CONSTRAINT services_slug_unique UNIQUE (slug),
  CONSTRAINT services_specs_is_array CHECK (jsonb_typeof(specs) = 'array')
);

CREATE INDEX services_category_idx ON public.services (category);
CREATE INDEX services_is_active_idx ON public.services (is_active);
CREATE INDEX services_sort_order_idx ON public.services (sort_order);

CREATE TRIGGER services_set_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
