-- Quick Test Script for Reviews System
-- Run this to create test data for testing reviews

-- Step 1: Get IDs (replace these with actual IDs from your database)
-- Run these queries first to get the IDs you need:

-- Get a student ID
-- SELECT id, email FROM profiles WHERE role = 'student' LIMIT 1;

-- Get a tutor ID  
-- SELECT id FROM tutors LIMIT 1;

-- Step 2: Create a completed session (REPLACE THE IDs)
INSERT INTO sessions (tutor_id, subject, price, start_time, end_time, location, status, capacity)
VALUES (
    'YOUR_TUTOR_ID_HERE',  -- Replace with actual tutor ID
    'Test Calculus Session',
    150,
    NOW() - INTERVAL '2 days',  -- 2 days ago
    NOW() - INTERVAL '2 days' + INTERVAL '1 hour',  -- 1 hour duration
    'online',
    'COMPLETED',
    10
) RETURNING id;

-- Step 3: Create a booking for that session (REPLACE THE IDs)
INSERT INTO bookings (session_id, student_id)
VALUES (
    'SESSION_ID_FROM_STEP_2',  -- Use the ID returned from Step 2
    'YOUR_STUDENT_ID_HERE'     -- Your student ID from Step 1
) RETURNING id;

-- Step 4: Now you can test!
-- 1. Login as the student
-- 2. Go to Dashboard → Past Lessons
-- 3. Click "Leave Review"
-- 4. Submit a 5-star review
-- 5. Go to tutor profile to see the review

-- Optional: Insert a test review directly (for quick testing)
-- INSERT INTO reviews (session_id, student_id, tutor_id, rating, comment)
-- VALUES (
--     'SESSION_ID',
--     'STUDENT_ID',
--     'TUTOR_ID',
--     5,
--     'Excellent tutor! Very patient and knowledgeable.'
-- );

-- Verify reviews exist
SELECT 
    r.id,
    r.rating,
    r.comment,
    p.full_name as student_name,
    s.subject as session_subject
FROM reviews r
JOIN profiles p ON r.student_id = p.id
JOIN sessions s ON r.session_id = s.id
ORDER BY r.created_at DESC;
