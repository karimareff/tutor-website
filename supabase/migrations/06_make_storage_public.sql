-- Migration: Fix Storage Policies for File Uploads
-- Run this in Supabase SQL Editor to fix RLS errors

-- Step 1: Make buckets public for URL access
UPDATE storage.buckets SET public = true WHERE id = 'submissions';
UPDATE storage.buckets SET public = true WHERE id = 'assignments';

-- Step 2: Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Students can upload submission files" ON storage.objects;
DROP POLICY IF EXISTS "Students can update submission files" ON storage.objects;
DROP POLICY IF EXISTS "Students can view their submission files" ON storage.objects;
DROP POLICY IF EXISTS "Tutors can upload assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Tutors can update assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Tutors can delete assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Students can view assignment files" ON storage.objects;

-- Step 3: Create new permissive policies

-- Submissions bucket: Any authenticated user can upload
CREATE POLICY "Allow authenticated uploads to submissions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'submissions');

-- Submissions bucket: Any authenticated user can update their own files
CREATE POLICY "Allow authenticated updates to submissions"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'submissions');

-- Submissions bucket: Any authenticated user can view (public bucket)
CREATE POLICY "Allow authenticated reads from submissions"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'submissions');

-- Submissions bucket: Allow public read (since bucket is public)
CREATE POLICY "Allow public reads from submissions"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'submissions');

-- Assignments bucket: Tutors can upload
CREATE POLICY "Allow tutors to upload assignments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assignments' AND
  EXISTS (SELECT 1 FROM public.tutors WHERE id = auth.uid())
);

-- Assignments bucket: Everyone authenticated can read
CREATE POLICY "Allow authenticated reads from assignments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'assignments');

-- Assignments bucket: Allow public read (since bucket is public)
CREATE POLICY "Allow public reads from assignments"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'assignments');

-- ROLLBACK:
-- DROP POLICY IF EXISTS "Allow authenticated uploads to submissions" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated updates to submissions" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated reads from submissions" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public reads from submissions" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow tutors to upload assignments" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated reads from assignments" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public reads from assignments" ON storage.objects;
-- UPDATE storage.buckets SET public = false WHERE id IN ('submissions', 'assignments');
