-- Function to update session status
CREATE OR REPLACE FUNCTION public.update_session_status()
RETURNS TRIGGER AS $$
DECLARE
    v_capacity int;
    v_booked_count int;
    v_session_id uuid;
BEGIN
    -- Determine session_id based on operation
    IF (TG_OP = 'DELETE') THEN
        v_session_id := OLD.session_id;
    ELSE
        v_session_id := NEW.session_id;
    END IF;

    -- Get capacity
    SELECT capacity INTO v_capacity FROM public.sessions WHERE id = v_session_id;
    
    -- Get current booked count
    SELECT count(*) INTO v_booked_count FROM public.bookings WHERE session_id = v_session_id AND status = 'CONFIRMED';
    
    -- Update status
    IF v_capacity IS NOT NULL AND v_booked_count >= v_capacity THEN
        UPDATE public.sessions SET status = 'BOOKED' WHERE id = v_session_id;
    ELSE
        UPDATE public.sessions SET status = 'AVAILABLE' WHERE id = v_session_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS tr_update_session_status ON public.bookings;
CREATE TRIGGER tr_update_session_status
AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_session_status();
