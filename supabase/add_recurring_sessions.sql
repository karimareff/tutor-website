-- Add Recurring Sessions Support

-- Add recurrence fields to sessions table
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS recurrence_rule jsonb,
ADD COLUMN IF NOT EXISTS parent_session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE;

-- Add index for better performance when querying recurring sessions
CREATE INDEX IF NOT EXISTS idx_sessions_parent_session_id ON public.sessions(parent_session_id);

-- Comment on columns
COMMENT ON COLUMN public.sessions.recurrence_rule IS 'JSON object containing recurrence pattern: {frequency: "weekly"|"biweekly"|"monthly", day_of_week: 0-6, time: "HH:MM", duration_minutes: number, end_date: "YYYY-MM-DD"}';
COMMENT ON COLUMN public.sessions.parent_session_id IS 'Reference to the parent session if this is part of a recurring series';

-- Example recurrence_rule format:
-- {
--   "frequency": "weekly",      -- "weekly", "biweekly", or "monthly"
--   "day_of_week": 1,           -- 0 (Sunday) to 6 (Saturday)
--   "time": "15:00",            -- Start time
--   "duration_minutes": 120,    -- Session duration
--   "end_date": "2025-12-31"    -- When to stop generating sessions
-- }
