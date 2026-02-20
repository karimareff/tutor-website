-- Migration: Add academy branding fields to tutors table
-- These fields allow tutors to customize their "academy" branding
-- that students see when viewing their specific tutor's content.

ALTER TABLE public.tutors
  ADD COLUMN IF NOT EXISTS academy_name text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS brand_color text DEFAULT '#3b82f6',
  ADD COLUMN IF NOT EXISTS welcome_message text;

-- Add a comment for documentation
COMMENT ON COLUMN public.tutors.academy_name IS 'Custom academy name (e.g. "Ahmed Math Academy"). Falls back to tutor full_name if null.';
COMMENT ON COLUMN public.tutors.logo_url IS 'Custom logo for the tutor''s academy landing page.';
COMMENT ON COLUMN public.tutors.brand_color IS 'Hex color used for the tutor''s branded student experience.';
COMMENT ON COLUMN public.tutors.welcome_message IS 'Welcome message shown on the academy landing page and student dashboard.';
