-- Add 'parent' role to profiles check constraint if possible, 
-- or we just trust the app to handle it if we can't easily alter the check constraint without dropping.
-- For now, let's assume we can update the check constraint or just allow text.
-- Postgres doesn't easily allow altering a check constraint text in-place without dropping.
-- We will proceed with adding new tables first.

-- 1. Update Tutors Table with Slug
ALTER TABLE public.tutors 
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- 2. Student-Tutor Roster (The "Class")
CREATE TABLE IF NOT EXISTS public.student_tutors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tutor_id uuid REFERENCES public.tutors(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('ACTIVE', 'PENDING', 'ARCHIVED')) DEFAULT 'ACTIVE',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, tutor_id)
);

-- RLS for student_tutors
ALTER TABLE public.student_tutors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can view their own students"
  ON public.student_tutors FOR SELECT
  USING ( auth.uid() = tutor_id );

CREATE POLICY "Students can view their own tutor connections"
  ON public.student_tutors FOR SELECT
  USING ( auth.uid() = student_id );

CREATE POLICY "Tutors can add students (invite)"
  ON public.student_tutors FOR INSERT
  WITH CHECK ( auth.uid() = tutor_id );
  
-- Allow students to "join" a tutor (insert themselves)
CREATE POLICY "Students can join tutors"
  ON public.student_tutors FOR INSERT
  WITH CHECK ( auth.uid() = student_id );

-- 3. Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id uuid REFERENCES public.tutors(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  content text, -- Could be JSON or HTML
  attachment_url text, -- URL to storage
  due_date timestamp with time zone,
  status text CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')) DEFAULT 'DRAFT',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can manage their own assignments"
  ON public.assignments FOR ALL
  USING ( auth.uid() = tutor_id );

CREATE POLICY "Students can view published assignments from their tutors"
  ON public.assignments FOR SELECT
  USING ( 
    status = 'PUBLISHED' AND
    EXISTS (
      SELECT 1 FROM public.student_tutors st
      WHERE st.tutor_id = assignments.tutor_id
      AND st.student_id = auth.uid()
    )
  );

-- 4. Assignment Submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id uuid REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_url text, -- URL to storage
  comments text,
  grade numeric,
  submitted_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(assignment_id, student_id)
);

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their own submissions"
  ON public.assignment_submissions FOR ALL
  USING ( auth.uid() = student_id );

CREATE POLICY "Tutors can view and grade submissions for their assignments"
  ON public.assignment_submissions FOR ALL
  USING ( 
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_submissions.assignment_id
      AND a.tutor_id = auth.uid()
    )
  );

-- 5. Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id uuid REFERENCES public.tutors(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]', -- JSON array of questions
  time_limit_minutes integer,
  status text CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')) DEFAULT 'DRAFT',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can manage their own quizzes"
  ON public.quizzes FOR ALL
  USING ( auth.uid() = tutor_id );

CREATE POLICY "Students can view published quizzes from their tutors"
  ON public.quizzes FOR SELECT
  USING ( 
    status = 'PUBLISHED' AND
    EXISTS (
      SELECT 1 FROM public.student_tutors st
      WHERE st.tutor_id = quizzes.tutor_id
      AND st.student_id = auth.uid()
    )
  );

-- 6. Quiz Submissions
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}',
  score numeric,
  submitted_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(quiz_id, student_id)
);

ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can create own quiz submissions"
  ON public.quiz_submissions FOR INSERT
  WITH CHECK ( auth.uid() = student_id );

CREATE POLICY "Students can view own quiz submissions"
  ON public.quiz_submissions FOR SELECT
  USING ( auth.uid() = student_id );

CREATE POLICY "Tutors can view submissions for their quizzes"
  ON public.quiz_submissions FOR SELECT
  USING ( 
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_submissions.quiz_id
      AND q.tutor_id = auth.uid()
    )
  );
