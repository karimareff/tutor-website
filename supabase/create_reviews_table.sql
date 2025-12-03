-- Create Reviews Table
CREATE TABLE public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tutor_id uuid REFERENCES public.tutors(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(session_id, student_id) -- One review per student per session
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Students can view all reviews
CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING ( true );

-- Students can create reviews for sessions they attended
CREATE POLICY "Students can create reviews for their sessions"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = student_id
  AND EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.session_id = reviews.session_id
    AND bookings.student_id = auth.uid()
  )
);

-- Students can update their own reviews
CREATE POLICY "Students can update their own reviews"
ON public.reviews FOR UPDATE
USING ( auth.uid() = student_id );

-- Students can delete their own reviews
CREATE POLICY "Students can delete their own reviews"
ON public.reviews FOR DELETE
USING ( auth.uid() = student_id );

-- Create function to update tutor rating
CREATE OR REPLACE FUNCTION public.update_tutor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tutors
  SET rating = (
    SELECT COALESCE(AVG(rating), 5.0)
    FROM public.reviews
    WHERE tutor_id = NEW.tutor_id
  )
  WHERE id = NEW.tutor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update tutor rating
CREATE TRIGGER update_tutor_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_tutor_rating();
