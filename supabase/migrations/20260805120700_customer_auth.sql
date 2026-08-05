-- Customer storefront accounts share auth.users; staff remain admin / super_admin.

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'admin', 'super_admin'));

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'customer';

-- Public signups are always customers. Staff roles are set via app_metadata
-- (service role) or by a super_admin after invite.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  v_role := COALESCE(NULLIF(NEW.raw_app_meta_data ->> 'role', ''), 'customer');
  IF v_role NOT IN ('customer', 'admin', 'super_admin') THEN
    v_role := 'customer';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      NULL
    ),
    v_role
  );
  RETURN NEW;
END;
$$;

-- Customers can read / update their own profile (role changes still blocked by trigger).
CREATE POLICY profiles_select_own
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
