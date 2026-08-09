-- Contact inquiries from the public contact form (staff inbox)

CREATE TABLE public.contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  internal_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contact_inquiries_full_name_len CHECK (char_length(trim(full_name)) BETWEEN 1 AND 200),
  CONSTRAINT contact_inquiries_phone_len CHECK (char_length(trim(phone)) BETWEEN 5 AND 40),
  CONSTRAINT contact_inquiries_email_len CHECK (
    email IS NULL OR char_length(trim(email)) BETWEEN 3 AND 254
  ),
  CONSTRAINT contact_inquiries_message_len CHECK (char_length(message) BETWEEN 1 AND 5000),
  CONSTRAINT contact_inquiries_internal_notes_len CHECK (char_length(internal_notes) <= 5000)
);

CREATE INDEX contact_inquiries_status_idx ON public.contact_inquiries (status);
CREATE INDEX contact_inquiries_created_at_idx ON public.contact_inquiries (created_at DESC);
CREATE INDEX contact_inquiries_phone_idx ON public.contact_inquiries (phone);
CREATE INDEX contact_inquiries_email_idx ON public.contact_inquiries (lower(email));

CREATE TRIGGER contact_inquiries_set_updated_at
  BEFORE UPDATE ON public.contact_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Public create (no direct table INSERT for anon)
CREATE OR REPLACE FUNCTION public.create_contact_inquiry(
  p_full_name text,
  p_phone text,
  p_email text DEFAULT NULL,
  p_message text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text := trim(p_full_name);
  v_phone text := trim(p_phone);
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_message text := trim(coalesce(p_message, ''));
  v_id uuid;
  v_recent_count integer;
BEGIN
  IF v_name IS NULL OR char_length(v_name) < 1 OR char_length(v_name) > 200 THEN
    RAISE EXCEPTION 'Invalid full name';
  END IF;
  IF v_phone IS NULL OR char_length(v_phone) < 5 OR char_length(v_phone) > 40 THEN
    RAISE EXCEPTION 'Invalid phone';
  END IF;
  IF v_email IS NOT NULL THEN
    IF v_email !~ '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
       OR char_length(v_email) > 254 THEN
      RAISE EXCEPTION 'Invalid email';
    END IF;
  END IF;
  IF char_length(v_message) < 1 OR char_length(v_message) > 5000 THEN
    RAISE EXCEPTION 'Invalid message';
  END IF;

  -- Rate limit: max 5 inquiries per phone (or email when present) per hour
  SELECT count(*) INTO v_recent_count
  FROM public.contact_inquiries c
  WHERE c.created_at > now() - interval '1 hour'
    AND (
      c.phone = v_phone
      OR (v_email IS NOT NULL AND lower(c.email) = v_email)
    );

  IF v_recent_count >= 5 THEN
    RAISE EXCEPTION 'Too many inquiries recently; please try again later';
  END IF;

  INSERT INTO public.contact_inquiries (
    full_name,
    phone,
    email,
    message,
    status
  )
  VALUES (v_name, v_phone, v_email, v_message, 'new')
  RETURNING id INTO v_id;

  RETURN jsonb_build_object(
    'id', v_id,
    'status', 'new'
  );
END;
$$;

-- Staff status updates for admin inbox
CREATE OR REPLACE FUNCTION public.update_contact_inquiry_status(
  p_inquiry_id uuid,
  p_new_status text,
  p_internal_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.contact_inquiries%ROWTYPE;
  v_old_status text;
  v_notes text;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_new_status IS NULL OR p_new_status NOT IN ('new', 'in_progress', 'resolved', 'closed') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  SELECT * INTO v_row
  FROM public.contact_inquiries
  WHERE id = p_inquiry_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inquiry not found';
  END IF;

  v_old_status := v_row.status;

  IF p_internal_notes IS NOT NULL THEN
    v_notes := trim(p_internal_notes);
    IF char_length(v_notes) > 5000 THEN
      RAISE EXCEPTION 'Internal notes too long';
    END IF;
  ELSE
    v_notes := v_row.internal_notes;
  END IF;

  UPDATE public.contact_inquiries
  SET
    status = p_new_status,
    internal_notes = v_notes
  WHERE id = p_inquiry_id;

  RETURN jsonb_build_object(
    'id', p_inquiry_id,
    'from_status', v_old_status,
    'to_status', p_new_status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_contact_inquiry(text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_contact_inquiry_status(uuid, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_contact_inquiry(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_contact_inquiry_status(uuid, text, text) TO authenticated;

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- No anon table access; create via RPC. Staff can list/update for admin handling.
CREATE POLICY contact_inquiries_select_staff
  ON public.contact_inquiries
  FOR SELECT
  TO authenticated
  USING (public.is_staff());

CREATE POLICY contact_inquiries_update_staff
  ON public.contact_inquiries
  FOR UPDATE
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());
