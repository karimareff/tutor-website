-- Migration: Remove hourly_rate, video_url, and curriculums columns from tutors table
-- Run this migration in your Supabase SQL editor

-- Drop the columns
ALTER TABLE public.tutors 
DROP COLUMN IF EXISTS hourly_rate,
DROP COLUMN IF EXISTS video_url,
DROP COLUMN IF EXISTS curriculums;

-- Note: This is a destructive migration. Make sure to back up your data first if needed.
