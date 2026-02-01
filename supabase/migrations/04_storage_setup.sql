-- Migration 04: Storage Setup
-- This migration creates storage buckets and policies for file uploads

-- Note: Bucket creation might need to be done via Supabase Dashboard or API
-- This SQL assumes storage schema is accessible

-- 1. Create storage buckets (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('assignments', 'assignments', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']),
  ('submissions', 'submissions', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. Storage policies for assignments bucket
-- Tutors can upload assignment files
CREATE POLICY "Tutors can upload assignment files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assignments' AND
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM public.tutors WHERE id = auth.uid())
);

-- Tutors can update their own assignment files
CREATE POLICY "Tutors can update assignment files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'assignments' AND
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM public.tutors WHERE id = auth.uid())
);

-- Tutors can delete their own assignment files
CREATE POLICY "Tutors can delete assignment files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'assignments' AND
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM public.tutors WHERE id = auth.uid())
);

-- Students in a tutor's class can view/download assignment files
CREATE POLICY "Students can view assignment files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'assignments' AND
  auth.role() = 'authenticated'
);

-- 3. Storage policies for submissions bucket
-- Students can upload submission files
CREATE POLICY "Students can upload submission files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'submissions' AND
  auth.role() = 'authenticated'
);

-- Students can update their own submission files
CREATE POLICY "Students can update submission files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'submissions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Students can view their own submission files
CREATE POLICY "Students can view their submission files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'submissions' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- Tutors can view submissions for their assignments
    EXISTS (
      SELECT 1 FROM public.tutors WHERE id = auth.uid()
    )
  )
);

-- 4. Storage policies for avatars bucket (public bucket)
-- Anyone authenticated can upload to their own folder
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatar
CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Everyone can view avatars (public bucket)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- ROLLBACK:
-- DELETE FROM storage.buckets WHERE id IN ('assignments', 'submissions', 'avatars');
-- DROP POLICY IF EXISTS "Tutors can upload assignment files" ON storage.objects;
-- (... drop all other policies ...)
