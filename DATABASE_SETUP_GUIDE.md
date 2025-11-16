# BadgerTutors - Database Setup Guide

## Overview
This guide covers the complete database setup for the BadgerTutors platform using Supabase PostgreSQL.

---

## ✅ Current Status

### Already Implemented:
- ✅ **profiles** table - User data with RLS
- ✅ **tutor_profiles_public** view - Secure tutor browsing
- ✅ Auto profile creation trigger on user signup
- ✅ Email validation (@wisc.edu enforcement)
- ✅ Proper Row-Level Security (RLS) policies

---

## ❌ What You Need to Do

### Step 1: Apply the New Migration

Run the migration file to create the missing tables:

```bash
# If using Supabase CLI locally
supabase db push

# Or apply directly in Supabase Dashboard
# Go to SQL Editor and paste the contents of:
# supabase/migrations/20251116_add_sessions_reviews_tables.sql
```

This will create:
1. **sessions** table - Tutoring session management with escrow tracking
2. **reviews** table - On-chain review references
3. **courses** table - Course catalog (optional but recommended)
4. **study_groups** table - Study group management (optional)
5. **study_group_members** table - Group membership tracking (optional)

---

## 📊 Database Schema Overview

### 1. **sessions** Table (CRITICAL)

Manages tutoring sessions from booking to payment release.

**Key Features:**
- Tracks session status (scheduled → awaiting-confirmation → completed)
- Escrow status tracking (pending → locked → released)
- Dual confirmation system (both student and tutor must confirm)
- 24-hour auto-release deadline after first confirmation
- Stores Solana escrow account address and transaction hash

**Important Fields:**
- `confirmation_deadline` - 24 hours from first confirmation
- `auto_release_triggered` - Prevents duplicate auto-releases
- `payment_released` - Required to be TRUE before review submission

**RLS Policies:**
- Users can only view/update sessions they're part of (as student or tutor)
- Students can create new sessions

---

### 2. **reviews** Table (CRITICAL)

Stores references to immutable on-chain reviews.

**Key Features:**
- One review per student-tutor pair (enforced by UNIQUE constraint)
- Requires completed session with released payment
- Stores blockchain transaction hash for verification
- Anonymous but verifiable via reviewer_hash

**RLS Policies:**
- Anyone can read reviews (public data)
- Only students can insert reviews for their completed sessions
- INSERT policy enforces payment_released = true check

**Important Constraints:**
```sql
CONSTRAINT one_review_per_pair UNIQUE(student_id, tutor_id)
```
This matches your frontend's one-review-per-tutor-forever logic.

---

### 3. **courses** Table (Optional)

Course catalog for UW-Madison courses.

**Features:**
- Standardized course codes (e.g., "CS400", "MATH221")
- Department tracking
- Can be used to tag sessions and tutor specializations

**Suggested Initial Data:**
```sql
INSERT INTO public.courses (code, name, department, credits) VALUES
('CS300', 'Programming II', 'COMP SCI', 3),
('CS400', 'Programming III', 'COMP SCI', 3),
('CS540', 'Intro to AI', 'COMP SCI', 3),
('MATH221', 'Calculus I', 'MATH', 5),
('MATH222', 'Calculus II', 'MATH', 4),
('MATH340', 'Linear Algebra', 'MATH', 3),
('STAT240', 'Intro to Statistics', 'STAT', 3),
('ECE252', 'Intro to Computer Engineering', 'E C E', 3);
```

---

### 4. **study_groups** & **study_group_members** Tables (Optional)

Study group management system.

**Features:**
- Students can create/join study groups
- Group creator approval workflow
- Max member limits
- Meeting time and location tracking

---

## 🔧 Helper Functions Created

### `calculate_tutor_rating(tutor_uuid)`
Calculates average rating and review count for a tutor.

**Usage:**
```sql
SELECT * FROM calculate_tutor_rating('tutor-uuid-here');
-- Returns: { avg_rating: 4.75, review_count: 8 }
```

### `can_submit_review(student_id, tutor_id)`
Checks if a student can submit a review for a tutor.

**Usage:**
```sql
SELECT can_submit_review(
  'student-uuid-here',
  'tutor-uuid-here'
);
-- Returns: true or false
```

### `get_sessions_for_auto_release()`
Returns sessions that need auto-release (deadline passed).

**Usage (for cron job):**
```sql
SELECT * FROM get_sessions_for_auto_release();
```

---

## 🔐 Security Notes

### Row-Level Security (RLS)

All tables have RLS enabled with appropriate policies:

1. **profiles** - Users can only view their own full profile
2. **sessions** - Users see only sessions they're part of
3. **reviews** - Public read, restricted write (requires completed session)
4. **courses** - Public read, authenticated write
5. **study_groups** - Authenticated users only, creators can manage

### Data Privacy

**Sensitive fields NEVER exposed publicly:**
- ❌ email
- ❌ phone
- ❌ student_id
- ❌ wallet_public_key

**Public tutor view only shows:**
- ✅ name, major, graduation year, department
- ✅ bio, location, hourly_rate
- ✅ availability, specializations
- ✅ is_verified status

---

## 📈 Indexes Created

For optimal query performance:

**sessions table:**
- `idx_sessions_student_id` - Student lookups
- `idx_sessions_tutor_id` - Tutor lookups
- `idx_sessions_status` - Filter by status
- `idx_sessions_escrow_status` - Escrow queries
- `idx_sessions_confirmation_deadline` - Auto-release cron job

**reviews table:**
- `idx_reviews_tutor_id` - Fetch all reviews for a tutor
- `idx_reviews_student_id` - User's review history
- `idx_reviews_on_chain_hash` - Blockchain verification

**courses table:**
- `idx_courses_department` - Department filtering
- `idx_courses_code` - Course code lookup

---

## 🚀 Next Steps After Migration

### 1. Seed Course Data (Recommended)
Add common UW-Madison courses to the courses table.

### 2. Update Frontend Types
After migration, regenerate TypeScript types:

```bash
# If using Supabase CLI
supabase gen types typescript --local > src/integrations/supabase/types.ts

# Or via Supabase Dashboard: Settings → API → Generate Types
```

### 3. Update Frontend Code
Replace localStorage-based sessions/reviews with Supabase queries:

**Example - Fetch user sessions:**
```typescript
const { data: sessions } = await supabase
  .from('sessions')
  .select('*')
  .or(`student_id.eq.${userId},tutor_id.eq.${userId}`)
  .order('scheduled_time', { ascending: false });
```

**Example - Create session:**
```typescript
const { data, error } = await supabase
  .from('sessions')
  .insert({
    student_id: studentId,
    tutor_id: tutorId,
    course_id: courseId,
    scheduled_time: scheduledTime,
    duration: 60,
    amount: 50.00,
    status: 'scheduled',
    escrow_status: 'pending'
  });
```

**Example - Confirm session:**
```typescript
const { data, error } = await supabase
  .from('sessions')
  .update({
    confirmed_by_student: true,
    student_confirmed_at: new Date().toISOString(),
    confirmation_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'awaiting-confirmation'
  })
  .eq('id', sessionId);
```

### 4. Set Up Background Jobs (Critical)
Create a Supabase Edge Function or cron job for auto-release:

```typescript
// Edge Function: process-auto-release.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );

  // Get sessions needing auto-release
  const { data: sessions } = await supabase
    .rpc('get_sessions_for_auto_release');

  for (const session of sessions || []) {
    // Call Solana escrow release
    // await releaseSolanaEscrow(session.escrow_account);

    // Update session
    await supabase
      .from('sessions')
      .update({
        escrow_status: 'released',
        payment_released: true,
        status: 'completed',
        auto_release_triggered: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', session.id);
  }

  return new Response(JSON.stringify({ processed: sessions?.length || 0 }));
});
```

**Schedule this to run every 5 minutes via Supabase Dashboard → Edge Functions → Cron Triggers**

### 5. Environment Variables
Ensure these are set in your `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

---

## 🧪 Testing the Database

### Test 1: Create a Session
```sql
INSERT INTO sessions (student_id, tutor_id, scheduled_time, duration, amount)
VALUES (
  'student-uuid',
  'tutor-uuid',
  NOW() + INTERVAL '2 days',
  60,
  50.00
);
```

### Test 2: Check Review Eligibility
```sql
SELECT can_submit_review('student-uuid', 'tutor-uuid');
-- Should return FALSE (no completed session yet)
```

### Test 3: Simulate Session Completion
```sql
UPDATE sessions SET
  status = 'completed',
  payment_released = true,
  escrow_status = 'released'
WHERE id = 'session-uuid';

-- Now check eligibility again
SELECT can_submit_review('student-uuid', 'tutor-uuid');
-- Should return TRUE
```

### Test 4: Submit Review
```sql
INSERT INTO reviews (session_id, tutor_id, student_id, rating, review_text, on_chain_hash, reviewer_hash)
VALUES (
  'session-uuid',
  'tutor-uuid',
  'student-uuid',
  5,
  'Great tutor! Very helpful.',
  'solana-tx-hash-123',
  'reviewer-hash-456'
);
```

### Test 5: Try Duplicate Review (Should Fail)
```sql
INSERT INTO reviews (session_id, tutor_id, student_id, rating, review_text, on_chain_hash, reviewer_hash)
VALUES (
  'another-session-uuid',
  'tutor-uuid', -- Same tutor
  'student-uuid', -- Same student
  4,
  'Another review',
  'solana-tx-hash-789',
  'reviewer-hash-xyz'
);
-- ERROR: duplicate key value violates unique constraint "one_review_per_pair"
```

---

## 📞 Troubleshooting

### Issue: RLS blocking queries
**Solution:** Make sure you're querying from authenticated context:
```typescript
// Set auth header
supabase.auth.setSession({ access_token, refresh_token });
```

### Issue: Can't insert session
**Solution:** Check that `student_id` matches `auth.uid()` (RLS policy requirement)

### Issue: Can't submit review
**Solution:** Verify session has `status = 'completed'` AND `payment_released = true`

### Issue: Duplicate review error
**Solution:** This is intentional! One review per student-tutor pair is enforced.

---

## 🎯 Summary

**What you have:**
- ✅ User profiles with security
- ✅ Tutor browsing view

**What you're adding:**
- ➕ Session management with escrow tracking
- ➕ Review system with blockchain verification
- ➕ Course catalog
- ➕ Study groups (optional)

**After this migration:**
- Your frontend will work with real database instead of localStorage
- Session confirmations will be persisted
- Reviews will have database backing (ready for blockchain integration)
- Auto-release cron job can be implemented

**Next critical task:** Set up the Solana smart contract to actually handle escrow and reviews on-chain!
