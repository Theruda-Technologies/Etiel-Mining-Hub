-- Row Level Security

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_number_counters ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

CREATE POLICY profiles_select_staff
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_staff());

-- Own profile (name/email) or any profile if super_admin.
-- Role changes are enforced by profiles_prevent_role_escalation trigger.
CREATE POLICY profiles_update_staff
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_staff() AND (id = auth.uid() OR public.is_super_admin()))
  WITH CHECK (public.is_staff() AND (id = auth.uid() OR public.is_super_admin()));

CREATE POLICY profiles_delete_admins_super_admin
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin()
    AND role = 'admin'
    AND id <> auth.uid()
  );

-- No INSERT policy: profiles are created by handle_new_user trigger (security definer)

CREATE OR REPLACE FUNCTION public.profiles_prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only super_admin can change roles';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_prevent_role_escalation();

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------

CREATE POLICY products_select_active_public
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_staff());

CREATE POLICY products_insert_staff
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY products_update_staff
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY products_delete_staff
  ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_staff());

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------

CREATE POLICY services_select_active_public
  ON public.services
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_staff());

CREATE POLICY services_insert_staff
  ON public.services
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY services_update_staff
  ON public.services
  FOR UPDATE
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY services_delete_staff
  ON public.services
  FOR DELETE
  TO authenticated
  USING (public.is_staff());

-- ---------------------------------------------------------------------------
-- orders (no anon table access; create via RPC)
-- Status changes blocked by trigger unless update_order_status sets GUC
-- ---------------------------------------------------------------------------

CREATE POLICY orders_select_staff
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (public.is_staff());

CREATE POLICY orders_update_staff
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- No INSERT/DELETE for authenticated via table — create_order is SECURITY DEFINER;
-- deletes not needed for v1

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------

CREATE POLICY order_items_select_staff
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (public.is_staff());

-- ---------------------------------------------------------------------------
-- order_status_history (append via SECURITY DEFINER triggers/RPCs only)
-- ---------------------------------------------------------------------------

CREATE POLICY order_status_history_select_staff
  ON public.order_status_history
  FOR SELECT
  TO authenticated
  USING (public.is_staff());

-- ---------------------------------------------------------------------------
-- order_number_counters: no client access (SECURITY DEFINER only)
-- ---------------------------------------------------------------------------
-- RLS enabled with no policies → deny all for anon/authenticated

-- Table privileges (RLS still applies)
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;

GRANT SELECT ON public.services TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;

GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
GRANT SELECT ON public.order_status_history TO authenticated;

GRANT SELECT, UPDATE, DELETE ON public.profiles TO authenticated;