# Implementation Guide for Remaining Features

## ✅ COMPLETED
1. **Group Sessions System** - Fully implemented with bookings table
2. **Reviews Table & Policies** - SQL scripts created (need to run in Supabase)
3. **Secure Storage Policies** - SQL script created (need to run in Supabase)
4. **Review Dialog Component** - Created at `components/ReviewDialog.tsx`
5. **Student Dashboard Reviews** - Updated to show review button for past lessons

---

## 📋 TODO: Complete Reviews System

### Step 1: Run SQL Scripts in Supabase
Run these files in your Supabase SQL Editor **in this order**:

1. **`supabase/create_reviews_table.sql`** - Creates reviews table and auto-rating trigger
2. **`supabase/secure_storage_policies.sql`** - Secures avatar storage

### Step 2: Add Reviews Display to Tutor Profile

Edit `app/tutors/[id]/page.tsx`:

**Add to state (line ~21):**
```tsx
const [reviews, setReviews] = useState<any[]>([]);
```

**Add to `fetchTutorAndSessions` function (after setSessions):**
```tsx
// Fetch reviews
const { data: reviewsData, error: reviewsError } = await supabase
    .from('reviews')
    .select(`
        *,
        students:profiles!reviews_student_id_fkey (full_name)
    `)
    .eq('tutor_id', id)
    .order('created_at', { ascending: false });

if (reviewsError) throw reviewsError;
setReviews(reviewsData || []);
```

**Add Reviews Card (after Available Sessions card, around line 200):**
```tsx
<Card>
    <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Student Reviews ({reviews.length})
        </CardTitle>
    </CardHeader>
    <CardContent>
        {reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet.</p>
        ) : (
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{review.students?.full_name || 'Student'}</span>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                            i < review.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                        {review.comment && (
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </p>
                    </div>
                ))}
            </div>
        )}
    </CardContent>
</Card>
```

---

## 📋 TODO: Recurring Sessions (Medium Priority)

### Database Changes
Create `supabase/recurring_sessions.sql`:

```sql
-- Add recurrence fields to sessions table
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS recurrence_rule jsonb,
ADD COLUMN IF NOT EXISTS parent_session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE;

-- Example recurrence_rule format:
-- {
--   "frequency": "weekly",
--   "day_of_week": 1,  -- Monday
--   "time": "15:00",
--   "duration_minutes": 120,
--   "end_date": "2025-12-31"
-- }
```

### Frontend Component
Create `components/RecurringSessionDialog.tsx` - similar to create session dialog but with:
- Frequency dropdown (weekly, bi-weekly, monthly)
- Day of week selector
- End date picker
- "Generate Sessions" button that creates multiple session records

---

## 📋 TODO: Fix `tutor.bio` Issue (Low Priority)

The tutor profile page uses `tutor.bio` but `bio` is in the `profiles` table.

**Option 1: Move bio to tutors table**
```sql
ALTER TABLE public.tutors ADD COLUMN bio text;
UPDATE public.tutors t SET bio = p.bio FROM public.profiles p WHERE t.id = p.id;
```

**Option 2: Update query to join profiles**
Change the tutor fetch query to:
```tsx
.select(`
    *,
    profiles (full_name, avatar_url, bio)
`)
```
Then use `tutor.profiles?.bio` in the UI.

---

## 📋 TODO: Generate TypeScript Types (Low Priority)

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Generate types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

Then update `lib/supabase.ts`:
```tsx
import { Database } from '@/types/supabase';

export const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## 📋 TODO: Refactor Tutors List to Server Component (Low Priority)

Convert `app/tutors/page.tsx` from client to server component:

1. Remove `'use client'` directive
2. Move data fetching to server-side
3. Extract search/filter to a separate client component
4. Benefits: Better SEO, faster initial load

---

## 🎯 Priority Order

1. **HIGH**: Run SQL scripts (reviews + storage policies)
2. **HIGH**: Add reviews display to tutor profile
3. **MEDIUM**: Test the complete review flow (student leaves review → appears on tutor profile → rating updates)
4. **MEDIUM**: Recurring sessions (if tutors need it)
5. **LOW**: TypeScript types generation
6. **LOW**: Fix bio field
7. **LOW**: Server component refactor

---

## 🧪 Testing Checklist

### Reviews System
- [ ] Student can leave review for past session
- [ ] Review appears on tutor profile page
- [ ] Tutor rating updates automatically
- [ ] Student cannot review same session twice
- [ ] Student cannot review session they didn't attend

### Storage Security
- [ ] User can upload avatar to their own folder
- [ ] User cannot upload to another user's folder
- [ ] Everyone can view avatars
- [ ] User can delete only their own avatar

---

## 📝 Notes

- All SQL scripts are in the `supabase/` folder
- Review dialog component is ready to use
- Student dashboard already has review button integration
- The trigger in `create_reviews_table.sql` auto-updates tutor ratings
