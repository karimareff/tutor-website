# 🚀 Quick Start Guide - New Features

## 1️⃣ Enable Recurring Sessions (1 minute)

**Run this SQL script in Supabase:**
```sql
-- File: supabase/add_recurring_sessions.sql
-- Just copy and paste the entire file into Supabase SQL Editor and click "Run"
```

**That's it!** The "Create Recurring Sessions" button will now work.

---

## 2️⃣ Test Recurring Sessions (2 minutes)

1. Login as a tutor
2. Go to Dashboard
3. Click **"Create Recurring Sessions"** (new button next to "Create Session")
4. Fill in:
   - Subject: "Test Weekly Session"
   - Price: 100
   - Frequency: Weekly
   - Day: Monday
   - Time: 15:00
   - Duration: 60
   - End Date: (1 month from now)
   - Capacity: 10
5. See preview: "This will create 4 sessions"
6. Click "Create 4 Sessions"
7. Check "My Sessions" tab - you should see 4 sessions!

---

## 3️⃣ Test Reviews Tab (1 minute)

1. Login as a tutor
2. Go to Dashboard
3. Click **"Reviews"** tab (new tab)
4. See all your reviews!

**If you don't have reviews yet:**
- Login as a student
- Leave a review for a past session
- Go back to tutor dashboard
- Reviews tab will show it!

---

## 🎯 That's It!

**Both features are now live:**
- ✅ Reviews tab in tutor dashboard
- ✅ Recurring sessions creator

**Total setup time: ~2 minutes** (just run the SQL script)

---

## 📋 Quick Troubleshooting

**"Create Recurring Sessions" button doesn't work:**
→ Did you run `add_recurring_sessions.sql` in Supabase?

**Reviews tab is empty:**
→ No reviews yet! Students need to leave reviews first.

**Can't see the new buttons:**
→ Refresh the page (Ctrl+R or Cmd+R)

---

## 💡 Pro Tips

**Recurring Sessions:**
- Start with a short end date to test (1-2 months)
- You can always create more later
- Each session is independent - students book individually

**Reviews:**
- Average rating updates automatically
- Reviews are sorted newest first
- Students see reviews on your public profile too

---

**Enjoy your new features!** 🎉
