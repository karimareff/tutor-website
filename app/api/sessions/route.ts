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
        const { title, subject, price, location, date, time, description, max_students } = body;

        // Validate required fields
        if (!title || !subject || !price || !date || !time) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check for time conflicts
        const { data: existingSessions, error: conflictError } = await supabase
            .from('sessions')
            .select('*')
            .eq('tutor_id', user.id)
            .eq('date', date)
            .eq('time', time);

        if (conflictError) {
            return NextResponse.json({ error: conflictError.message }, { status: 500 });
        }

        if (existingSessions && existingSessions.length > 0) {
            return NextResponse.json(
                { error: 'Time slot already booked' },
                { status: 409 }
            );
        }

        // Create the session
        const { data: session, error: insertError } = await supabase
            .from('sessions')
            .insert({
                tutor_id: user.id,
                title,
                subject,
                price,
                location: location || 'Online',
                date,
                time,
                description: description || '',
                max_students: max_students || 1,
                status: 'available'
            })
            .select()
            .single();

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ session }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { searchParams } = new URL(request.url);
        const tutorId = searchParams.get('tutor_id');

        let query = supabase
            .from('sessions')
            .select(`
        *,
        profiles:tutor_id (full_name, avatar_url)
      `)
            .order('date', { ascending: true });

        if (tutorId) {
            query = query.eq('tutor_id', tutorId);
        }

        const { data: sessions, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ sessions }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
