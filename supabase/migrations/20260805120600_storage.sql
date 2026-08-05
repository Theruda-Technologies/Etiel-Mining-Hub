-- Storage buckets for catalog images

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'product-images',
    'product-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'service-images',
    'service-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read
CREATE POLICY product_images_public_select
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY service_images_public_select
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'service-images');

-- Staff write
CREATE POLICY product_images_staff_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_staff());

CREATE POLICY product_images_staff_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_staff())
  WITH CHECK (bucket_id = 'product-images' AND public.is_staff());

CREATE POLICY product_images_staff_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_staff());

CREATE POLICY service_images_staff_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'service-images' AND public.is_staff());

CREATE POLICY service_images_staff_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'service-images' AND public.is_staff())
  WITH CHECK (bucket_id = 'service-images' AND public.is_staff());

CREATE POLICY service_images_staff_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'service-images' AND public.is_staff());
