-- Migration 02: Fix Schema Mismatches
-- This migration standardizes field names and adds missing columns

-- 1. Rename meeting_link to meeting_url for consistency with code
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' AND column_name = 'meeting_link'
    ) THEN
        ALTER TABLE public.sessions RENAME COLUMN meeting_link TO meeting_url;
    END IF;
END $$;

-- 2. Add duration as computed column (optional - calculates from start/end times)
-- This makes queries simpler and matches what the UI expects
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS duration integer 
GENERATED ALWAYS AS (
  EXTRACT(EPOCH FROM (end_time - start_time))::integer / 60
) STORED;

-- 3. Ensure capacity column exists (from previous migration)
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 1 NOT NULL;

-- 4. Add status column to bookings if missing (added in step 1 but belt-and-suspenders)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS status text 
CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')) 
DEFAULT 'CONFIRMED';

-- ROLLBACK:
-- ALTER TABLE public.sessions RENAME COLUMN meeting_url TO meeting_link;
-- ALTER TABLE public.sessions DROP COLUMN IF EXISTS duration;
-- ALTER TABLE public.bookings DROP COLUMN IF EXISTS status;
