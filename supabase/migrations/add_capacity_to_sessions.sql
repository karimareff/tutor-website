-- Add capacity column to sessions table
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 1 NOT NULL;

-- Initial update for existing sessions (optional, but good for clarity)
UPDATE public.sessions SET capacity = 1 WHERE capacity IS NULL;
