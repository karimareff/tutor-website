# SQL Scripts Execution Order

## ⚠️ IMPORTANT: Run these in your Supabase SQL Editor

### 1. Reviews System (HIGH PRIORITY)
**File:** `supabase/create_reviews_table.sql`

**What it does:**
- Creates `reviews` table
- Sets up RLS policies (students can review sessions they attended)
- Creates auto-trigger to update tutor ratings when reviews are added/updated/deleted

**Run this first!**

---

### 2. Storage Security (HIGH PRIORITY)
**File:** `supabase/secure_storage_policies.sql`

**What it does:**
- Restricts avatar uploads to user's own folder (`avatars/{user_id}/*`)
- Prevents users from deleting other users' avatars
- Keeps avatars publicly viewable

**Run this second!**

---

### 3. RLS Policies (ALREADY RUN - for reference)
These were already executed during the group sessions migration:

- ✅ `supabase/reset_and_fix_policies.sql` - Fixed RLS for sessions and bookings
- ✅ `supabase/fix_rls_recursion.sql` - Fixed infinite recursion
- ✅ `supabase/convert_to_group_sessions.sql` - Migrated to group sessions

---

## 🧪 How to Test After Running Scripts

### Test Reviews:
1. As a student, go to Dashboard → Past Lessons
2. Click "Leave Review" on a past session
3. Submit a 5-star review with a comment
4. Go to that tutor's profile page
5. Verify the review appears
6. Check that the tutor's rating updated

### Test Storage Security:
1. Try to upload an avatar in Settings
2. Check browser console - should upload to `avatars/{your-user-id}/filename`
3. Try to access another user's avatar URL - should work (public read)
4. Try to delete another user's avatar via API - should fail

---

## 📊 Database Schema After All Scripts

```
profiles
├── id (uuid, PK)
├── email
├── full_name
├── avatar_url
├── bio
└── role (student/tutor)

tutors
├── id (uuid, PK, FK → profiles)
├── hourly_rate
├── rating (auto-updated by trigger)
└── subjects

sessions
├── id (uuid, PK)
├── tutor_id (FK → tutors)
├── subject
├── price
├── start_time
├── end_time
├── location
├── status (AVAILABLE/COMPLETED)
└── capacity (default: 10)

bookings (many-to-many)
├── id (uuid, PK)
├── session_id (FK → sessions)
├── student_id (FK → profiles)
└── created_at

reviews ⭐ NEW
├── id (uuid, PK)
├── session_id (FK → sessions)
├── student_id (FK → profiles)
├── tutor_id (FK → tutors)
├── rating (1-5)
├── comment (optional)
└── created_at
```

---

## 🚨 Troubleshooting

### "Relation 'reviews' does not exist"
→ You haven't run `create_reviews_table.sql` yet

### "Infinite recursion detected"
→ Run `reset_and_fix_policies.sql` again

### "Permission denied for storage object"
→ Run `secure_storage_policies.sql`

### Reviews not updating tutor rating
→ Check if the trigger was created:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'update_tutor_rating_trigger';
```

---

## ✅ Verification Queries

After running the scripts, verify with these queries:

```sql
-- Check if reviews table exists
SELECT * FROM information_schema.tables WHERE table_name = 'reviews';

-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'update_tutor_rating_trigger';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';

-- Test review insertion (replace UUIDs with real ones)
INSERT INTO reviews (session_id, student_id, tutor_id, rating, comment)
VALUES ('session-uuid', 'student-uuid', 'tutor-uuid', 5, 'Great tutor!');

-- Check if tutor rating updated
SELECT id, rating FROM tutors WHERE id = 'tutor-uuid';
```
