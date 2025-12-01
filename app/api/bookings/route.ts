import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the user
        const { data: { user }, error: authError } = await supabase.auth.getUser(
            authHeader.replace('Bearer ', '')
        );

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { tutor_id, session_id, date, time, subject } = body;

        // Validate required fields
        if (!tutor_id || !date || !time || !subject) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check for double bookings (same student, same tutor, same date/time)
        const { data: existingBookings, error: conflictError } = await supabase
            .from('bookings')
            .select('*')
            .eq('student_id', user.id)
            .eq('tutor_id', tutor_id)
            .eq('date', date)
            .eq('time', time)
            .in('status', ['pending', 'confirmed']);

        if (conflictError) {
            return NextResponse.json({ error: conflictError.message }, { status: 500 });
        }

        if (existingBookings && existingBookings.length > 0) {
            return NextResponse.json(
                { error: 'You already have a booking at this time' },
                { status: 409 }
            );
        }

        // Create the booking
        const { data: booking, error: insertError } = await supabase
            .from('bookings')
            .insert({
                student_id: user.id,
                tutor_id,
                session_id: session_id || null,
                date,
                time,
                subject,
                status: 'pending'
            })
            .select()
            .single();

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ booking }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the user
        const { data: { user }, error: authError } = await supabase.auth.getUser(
            authHeader.replace('Bearer ', '')
        );

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('student_id');
        const tutorId = searchParams.get('tutor_id');

        let query = supabase
            .from('bookings')
            .select(`
        *,
        student:student_id (full_name, email),
        tutor:tutor_id (full_name, email)
      `)
            .order('date', { ascending: true });

        if (studentId) {
            query = query.eq('student_id', studentId);
        }

        if (tutorId) {
            query = query.eq('tutor_id', tutorId);
        }

        const { data: bookings, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ bookings }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
