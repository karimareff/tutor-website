# 📍 Visual Guide: Adding Reviews to Tutor Profile

## File: `app/tutors/[id]/page.tsx`

---

## STEP 1: Add State Variable

**Location:** Around line 21, after `const [sessions, setSessions] = useState<any[]>([]);`

```tsx
export default function TutorProfilePage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const [tutor, setTutor] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);  // ← ADD THIS LINE
    const [loading, setLoading] = useState(true);
    const [bookingId, setBookingId] = useState<string | null>(null);
```

---

## STEP 2: Fetch Reviews

**Location:** Inside `fetchTutorAndSessions` function, after `setSessions(sessionsData || []);` (around line 59)

```tsx
const fetchTutorAndSessions = async () => {
    try {
        // ... existing tutor fetch code ...

        // Fetch Available Sessions
        const { data: sessionsData, error: sessionsError } = await supabase
            .from('sessions')
            .select('*, bookings(count)')
            .eq('tutor_id', id)
            .eq('status', 'AVAILABLE')
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true });

        if (sessionsError) throw sessionsError;
        setSessions(sessionsData || []);

        // ↓↓↓ ADD THIS BLOCK ↓↓↓
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
        // ↑↑↑ END OF ADDED BLOCK ↑↑↑

    } catch (error: any) {
        console.error('Error fetching data:', JSON.stringify(error, null, 2));
        toast.error('Failed to load tutor data: ' + (error.message || 'Unknown error'));
    } finally {
        setLoading(false);
    }
};
```

---

## STEP 3: Add Reviews Card to UI

**Location:** After the "Available Sessions" `</Card>` closing tag (around line 200)

**Visual Context:**
```tsx
                                </Card>  {/* ← End of Available Sessions card */}

                                {/* ↓↓↓ ADD REVIEWS CARD HERE ↓↓↓ */}
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
                                                            <span className="font-semibold">
                                                                {review.students?.full_name || 'Student'}
                                                            </span>
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
                                                            <p className="text-sm text-muted-foreground">
                                                                {review.comment}
                                                            </p>
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
                                {/* ↑↑↑ END OF REVIEWS CARD ↑↑↑ */}

                            </div>  {/* ← End of lg:col-span-2 */}
```

---

## 🎯 Quick Checklist

Before making changes:
- [ ] Make sure you've run `supabase/create_reviews_table.sql` in Supabase SQL Editor
- [ ] Backup your file (or commit to git)

After making changes:
- [ ] Check for TypeScript errors in your IDE
- [ ] Save the file
- [ ] Refresh the browser
- [ ] Navigate to a tutor profile page
- [ ] Verify "Student Reviews (0)" section appears

---

## 🧪 How to Test

1. **Create a test review manually in Supabase:**
   ```sql
   -- Get a session ID and tutor ID from your database
   INSERT INTO reviews (session_id, student_id, tutor_id, rating, comment)
   VALUES (
       'your-session-id',
       'your-student-id',
       'your-tutor-id',
       5,
       'Great tutor! Very helpful and patient.'
   );
   ```

2. **Visit the tutor profile page**
   - You should see "Student Reviews (1)"
   - The review should display with 5 stars
   - The comment should be visible
   - The date should be formatted correctly

3. **Test via the app:**
   - As a student, complete a session
   - Go to Dashboard → Past Lessons
   - Click "Leave Review"
   - Submit a review
   - Go to the tutor's profile
   - Verify the review appears

---

## 🐛 Troubleshooting

### "reviews is not defined"
→ You forgot Step 1 (add state variable)

### "Cannot read property 'length' of undefined"
→ You forgot Step 1 or the reviews state is not initialized

### Reviews don't appear
→ Check browser console for errors
→ Verify you ran the SQL script
→ Check if reviews exist in the database

### TypeScript errors
→ The code uses `any` types which is fine for now
→ You can ignore TypeScript warnings about `any`

---

## ✅ Expected Result

After completing all steps, the tutor profile page will show:

```
┌─────────────────────────────────────┐
│  Tutor Profile Card                 │
│  (Name, Avatar, Rating, etc.)       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  📅 Available Sessions              │
│  - Session 1                        │
│  - Session 2                        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ⭐ Student Reviews (3)             │
│  ┌───────────────────────────────┐ │
│  │ John Doe        ⭐⭐⭐⭐⭐     │ │
│  │ "Excellent tutor!"            │ │
│  │ Dec 1, 2025                   │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │ Jane Smith      ⭐⭐⭐⭐☆     │ │
│  │ "Very helpful"                │ │
│  │ Nov 28, 2025                  │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🎉 Done!

Once you see reviews appearing on the tutor profile page, the Reviews & Ratings system is **100% complete**! 🚀
