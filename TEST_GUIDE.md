
### Test 1: Homepage

1. Open `http://localhost:3000`
2. **Expected:**
   - Navbar with "Observe Life" brand
   - Hero section with title
   - Three feature cards (Resident, Family, Facilities)
   - "Get Started" and "Learn More" buttons

### Test 2: Register Page

1. Click "Get Started" or navigate to `/register`
2. **Fill form:**
   - Name: "John Doe"
   - Email: "john@example.com"
   - Role: Select "Family Member"
   - Password: "password123"
   - Confirm Password: "password123"
3. Click "Create Account"
4. **Expected:** Redirect to `/family` dashboard

### Test 3: Login Page

1. Navigate to `/login`
2. **Fill form:**
   - Email: "john@example.com"
   - Password: "password123"
3. Click "Sign In"
4. **Expected:** Redirect to dashboard based on role

### Test 4: Logout

1. Clear localStorage or wait for token expiration
2. Try to access protected route
3. **Expected:** Redirect to `/login`

---

## New Pages Testing

### Resident Pages

#### S01: Resident Story Profile (`/resident`)
1. Login as resident
2. **Expected:**
   - Top bar with "My Story Profile" and "+ Record" button
   - Profile card with avatar, name, organization, stats
   - Pending Questions section (if any)
   - My Stories section
   - Bottom navigation (Home, Record, Questions, Family)

#### S03: Question Queue (`/resident/questions`)
1. Navigate from bottom nav or directly
2. **Expected:**
   - Stats showing Pending, Answered, From family counts
   - "Answer These" section with pending questions
   - "Recently Answered" section
   - Record button on each pending question

### Family Pages

#### F02: Family Home (`/family`)
1. Login as family member
2. **Expected:**
   - Top bar with resident name and "Ask ❓" button
   - Resident info card
   - Notification card (if question answered)
   - All Stories list
   - Bottom navigation (Home, Ask, Alerts, Me)

#### F04: Notifications (`/family/notifications`)
1. Navigate from bottom nav
2. **Expected:**
   - List of notifications when questions are answered
   - "Watch Now" buttons
   - Empty state if no notifications

### Staff/Admin Pages

#### T01: Staff Dashboard (`/staff`)
1. Login as staff/admin
2. **Expected:**
   - Top bar with organization name and "Story Night Mode"
   - Stats cards (Residents, Need Attention, Stories, Family Accounts)
   - Filter buttons (All, Needs Attention, No Stories Yet)
   - Residents table with columns: Resident, Last Story, Pending Qs, Stories, Family, Actions
   - Record/View buttons per resident

#### T02: Admin Dashboard (`/admin`)
1. Login as admin
2. Navigate to `/admin`
3. **Expected:**
   - Usage stats (Residents, Stories, Family Accounts, Qs Answered)
   - Staff management section
   - Billing section with current plan, rate, bill
   - Therapy ROI calculator
   - "Update Resident Count" and "Manage Payment" buttons

#### A01: Add Resident (`/admin/residents/new`)
1. Navigate from admin dashboard
2. **Step 1: Resident Information**
   - Fill: First Name, Last Name, Room
   - Select Care Type (SNF/AL/Hospice)
   - Click "Continue"
3. **Step 2: Consent**
   - Review consent checkboxes
   - Select consent type (Self/Representative)
   - Enter staff name
   - Click "Continue"
4. **Step 3: Review**
   - Review all information
   - Click "Create Resident & Continue →"
5. **Expected:** Redirect to family contacts page

#### A02: Family Contacts (`/admin/residents/[id]/family`)
1. After creating resident
2. **Expected:**
   - Form to add family members (Name, Email, Relationship)
   - "+ Add another family member" button
   - Summary showing number of invitations
   - "Send All Invitations →" button
   - "Skip — do this later" option

### Hospice Pages

#### H01: Bedside Mode (`/hospice/bedside?resident_id=XXX`)
1. Login as staff
2. Navigate with resident_id parameter
3. **Expected:**
   - Full-screen dark interface
   - Top bar with "Bedside Mode" and Exit button
   - Prompt display in center
   - Large video preview
   - Big "Start Recording" button
   - Timer display when recording
   - Auto-save message

#### H02: Legacy Prompts (`/hospice/prompts`)
1. Navigate to prompts page
2. **Expected:**
   - "End of Life Reflections" section
   - Prompts with categories (GRATITUDE, FAMILY, WISDOM, LEGACY)
   - "Record a Message for the Future" section
   - Milestone buttons (Wedding, Graduation, New Baby, Birthday)

### Billing Pages

#### B01: Billing Dashboard (`/admin/billing`)
1. Login as admin
2. Navigate to `/admin/billing`
3. **Expected:**
   - Current Plan section (Type, Rate, Active residents, Current bill, Next billing)
   - Update Resident Count button
   - Manage Payment Method button
   - Therapy Billing ROI calculator
   - Usage This Month stats

---

## End-to-End User Flows

### Flow 1: Admin Creates Organization & Resident

#### Step 1: Register as Admin
1. Register with role: `admin`
2. Note the user ID from response

#### Step 2: Create Organization
**Request:**
```bash
curl -X POST http://localhost:3001/api/organizations \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mountain View Health & Rehab",
    "type": "SNF",
    "address": "123 Main St, City, State"
  }'
```

**Save organization_id**

#### Step 3: Update User with Organization
You may need to manually update the user's organization_id in database:
```sql
UPDATE users 
SET organization_id = 'YOUR_ORG_ID' 
WHERE email = 'admin@example.com';
```

#### Step 4: Create Resident via UI
1. Navigate to `/admin/residents/new`
2. Complete 3-step wizard:
   - Enter resident info
   - Capture consent
   - Add family contacts
3. **Expected:** Resident created, invitations sent

### Flow 2: Family Member Asks Question

#### Step 1: Register as Family Member
1. Register with role: `family`
2. Get token

#### Step 2: Create Family Connection
**Note:** This is typically done via batch invite, but for testing:

You may need to manually create connection in database:
```sql
INSERT INTO family_connections (resident_id, user_id, relationship, invite_token, invite_status)
VALUES (
  'YOUR_RESIDENT_ID',
  'YOUR_FAMILY_USER_ID',
  'Granddaughter',
  'test-token-123',
  'ACTIVE'
);
```

#### Step 3: Ask Question via UI
1. Login as family member
2. Navigate to `/ask?resident_id=RESIDENT_ID`
3. Enter question or select from prompt library
4. Click "Send Question →"
5. **Expected:** Question created, redirect to family dashboard

#### Step 4: View Question in Frontend
1. Login as resident (need to create resident user first)
2. Navigate to `/resident`
3. **Expected:** See pending question in "Pending Questions" section

### Flow 3: Resident Records Story

#### Step 1: Create Resident User
Register with role: `resident`, then link to resident record in database.

#### Step 2: Record Story
1. Login as resident
2. Navigate to `/record`
3. **Expected:**
   - Camera preview appears
   - "Start Recording" button
4. Click "Start Recording"
5. **Expected:** Recording indicator, timer
6. Click "Stop Recording"
7. **Expected:** Video playback, title input, privacy settings
8. Fill title: "My First Story"
9. Click "Save Story"

**Note:** Video upload to Backblaze B2 not implemented yet, so this will fail at upload step. The UI flow should work.

### Flow 4: Q&A Engine Complete Flow

1. **Family asks question** (Flow 2, Step 3)
2. **Resident sees question** in `/resident` dashboard
3. **Resident records answer:**
   - Click "Record" on question card
   - Navigate to `/record?question_id=QUESTION_ID`
   - Record video answering the question
   - Save story
4. **Question status updates** to "ANSWERED"
5. **Family sees answer** in `/family` dashboard or `/family/notifications`

### Flow 5: Staff Records for Resident

1. Login as staff
2. Navigate to `/staff`
3. Find resident in table
4. Click "Record" button
5. **Expected:** Navigate to `/record?resident_id=RESIDENT_ID`
6. Record story (same as Flow 3)
7. **Expected:** Story saved with staff context

### Flow 6: Admin Manages Billing

1. Login as admin
2. Navigate to `/admin/billing`
3. View current plan and usage
4. Click "Update Resident Count"
5. **Expected:** Modal/form to update count (when implemented)
6. Click "Manage Payment Method"
7. **Expected:** Redirect to Stripe Customer Portal (when implemented)

---

## API Endpoint Testing

### Organizations API

```bash
# Create (Admin only)
curl -X POST http://localhost:3001/api/organizations \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Org", "type": "SNF"}'

# List
curl http://localhost:3001/api/organizations \
  -H "Authorization: Bearer TOKEN"

# Get one
curl http://localhost:3001/api/organizations/ORG_ID \
  -H "Authorization: Bearer TOKEN"

# Update (Admin only)
curl -X PATCH http://localhost:3001/api/organizations/ORG_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

### Residents API

```bash
# Create (Staff/Admin)
curl -X POST http://localhost:3001/api/residents \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "ORG_ID",
    "name": "Test Resident",
    "care_type": "SNF"
  }'

# List
curl http://localhost:3001/api/residents \
  -H "Authorization: Bearer TOKEN"

# Get one
curl http://localhost:3001/api/residents/RESIDENT_ID \
  -H "Authorization: Bearer TOKEN"
```

### Stories API

```bash
# Create
curl -X POST http://localhost:3001/api/stories \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resident_id": "RESIDENT_ID",
    "title": "Test Story",
    "video_url": "https://example.com/video.webm",
    "privacy": "FAMILY_ONLY",
    "duration_seconds": 120
  }'

# List
curl http://localhost:3001/api/stories \
  -H "Authorization: Bearer TOKEN"

# With filters
curl "http://localhost:3001/api/stories?resident_id=RESIDENT_ID" \
  -H "Authorization: Bearer TOKEN"
```

### Questions API

```bash
# Create (Family only)
curl -X POST http://localhost:3001/api/questions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resident_id": "RESIDENT_ID",
    "question_text": "Test question?",
    "notify_all_family": true
  }'

# List
curl http://localhost:3001/api/questions \
  -H "Authorization: Bearer TOKEN"

# With filters
curl "http://localhost:3001/api/questions?status=PENDING" \
  -H "Authorization: Bearer TOKEN"

# Update (mark as answered)
curl -X PATCH http://localhost:3001/api/questions/QUESTION_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ANSWERED",
    "answered_story_id": "STORY_ID"
  }'
```

### Family Connections API

```bash
# Batch invite (Staff/Admin)
curl -X POST http://localhost:3001/api/family/invitations/batch \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resident_id": "RESIDENT_ID",
    "contacts": [
      {
        "name": "Sarah Johnson",
        "email": "sarah@example.com",
        "relationship": "Granddaughter"
      }
    ]
  }'

# List connections
curl http://localhost:3001/api/family/connections \
  -H "Authorization: Bearer TOKEN"
```

### Consent API

```bash
# Create (Staff/Admin)
curl -X POST http://localhost:3001/api/consent \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resident_id": "RESIDENT_ID",
    "consent_type": "SELF",
    "form_version": "1.0",
    "consented_by": "Staff Name"
  }'

# List
curl http://localhost:3001/api/consent?resident_id=RESIDENT_ID \
  -H "Authorization: Bearer TOKEN"
```

### Prompts API

```bash
# List all
curl http://localhost:3001/api/prompts \
  -H "Authorization: Bearer TOKEN"

# Filter by category
curl "http://localhost:3001/api/prompts?category=CHILDHOOD" \
  -H "Authorization: Bearer TOKEN"

# Filter by care type
curl "http://localhost:3001/api/prompts?care_type=HOSPICE" \
  -H "Authorization: Bearer TOKEN"
```

---

## Role-Based Testing

### Test as Family Member

1. **Register** with role: `family`
2. **Login** → Should redirect to `/family`
3. **View dashboard:**
   - Should show connected residents
   - Should show stories (if any)
   - Should show notification card if question answered
4. **Ask question:**
   - Navigate to `/ask?resident_id=RESIDENT_ID`
   - Submit question or select from prompt library
   - Should see confirmation
5. **View notifications:**
   - Navigate to `/family/notifications`
   - Should see answered questions
6. **View stories:**
   - Should see stories from connected residents
   - Should see "Answered your question" tags

### Test as Resident

1. **Register** with role: `resident`
2. **Link to resident record** (manual DB update needed)
3. **Login** → Should redirect to `/resident`
4. **View dashboard:**
   - Should show profile
   - Should show pending questions
   - Should show own stories
   - Bottom nav should work
5. **Record story:**
   - Click "+ Record" or navigate to `/record`
   - Record video
   - Save story
6. **Answer question:**
   - Click "Record" on pending question
   - Or navigate to `/resident/questions`
   - Record answer
   - Save story
   - Question should be marked as answered
7. **Question queue:**
   - Navigate to `/resident/questions`
   - Should see stats and question list

### Test as Staff

1. **Register** with role: `staff`
2. **Set organization_id** (manual DB update)
3. **Login** → Should redirect to `/staff`
4. **View dashboard:**
   - Should show residents from their organization
   - Should show stats
   - Should show filters
5. **Create resident:**
   - Navigate to `/admin/residents/new` (if admin)
   - Or use API to create resident
   - Should appear in dashboard
6. **Record for resident:**
   - Click "Record" button
   - Should open recording with resident context
7. **Hospice bedside mode:**
   - Navigate to `/hospice/bedside?resident_id=XXX`
   - Should see full-screen recording interface

### Test as Admin

1. **Register** with role: `admin`
2. **Create organization** via API
3. **Set organization_id** (manual DB update)
4. **All staff features** plus:
   - Can access `/admin` dashboard
   - Can access `/admin/billing`
   - Can update organization
   - Can manage billing (when implemented)
   - Can add residents via UI (`/admin/residents/new`)
   - Can add family contacts (`/admin/residents/[id]/family`)

---

## Frontend Page Testing Checklist

### Homepage (`/`)
- [ ] Navbar displays correctly
- [ ] Hero section visible
- [ ] Feature cards display
- [ ] Buttons work (navigate to login/register)

### Login (`/login`)
- [ ] Form displays
- [ ] Can enter email/password
- [ ] Submit works
- [ ] Error messages display on failure
- [ ] Success redirects to dashboard
- [ ] "Sign up" link works

### Register (`/register`)
- [ ] Form displays
- [ ] All fields work
- [ ] Role dropdown works
- [ ] Password validation (min 8 chars)
- [ ] Submit works
- [ ] Error messages display
- [ ] Success redirects to dashboard
- [ ] "Sign in" link works

### Resident Dashboard (`/resident`)
- [ ] Top bar displays with "+ Record" button
- [ ] Profile displays with avatar
- [ ] Pending questions show
- [ ] Stories list displays
- [ ] Bottom navigation works
- [ ] Question cards have "Record" buttons
- [ ] Clicking "Record" navigates correctly

### Resident Question Queue (`/resident/questions`)
- [ ] Stats display (Pending, Answered, From family)
- [ ] Pending questions list
- [ ] Record buttons work
- [ ] Recently answered section
- [ ] Empty state if no questions

### Family Dashboard (`/family`)
- [ ] Top bar with "Ask ❓" button
- [ ] Resident info card displays
- [ ] Notification card shows (if applicable)
- [ ] Stories display
- [ ] Bottom navigation works
- [ ] Story cards are clickable
- [ ] "Answered your question" tags show

### Family Notifications (`/family/notifications`)
- [ ] List of answered questions
- [ ] "Watch Now" buttons work
- [ ] Empty state if no notifications

### Staff Dashboard (`/staff`)
- [ ] Top bar with organization name
- [ ] Stats display correctly
- [ ] Residents table displays
- [ ] Filters work
- [ ] "Record" buttons work
- [ ] Data scoped to organization

### Admin Dashboard (`/admin`)
- [ ] Usage stats display
- [ ] Staff management section
- [ ] Billing section
- [ ] ROI calculator
- [ ] Buttons work

### Add Resident (`/admin/residents/new`)
- [ ] Step 1: Form fields work
- [ ] Care type selection works
- [ ] Step 2: Consent checkboxes display
- [ ] Consent type selection works
- [ ] Step 3: Review displays correctly
- [ ] Navigation between steps works
- [ ] Final submit creates resident

### Family Contacts (`/admin/residents/[id]/family`)
- [ ] Form fields work
- [ ] Can add multiple contacts
- [ ] Can remove contacts
- [ ] Summary shows correct count
- [ ] Send invitations works
- [ ] Skip option works

### Record Page (`/record`)
- [ ] Camera preview works
- [ ] "Start Recording" works
- [ ] Timer displays
- [ ] "Stop Recording" works
- [ ] Video playback works
- [ ] Title input works
- [ ] Privacy dropdown works
- [ ] "Save Story" works (will fail at upload, but UI should work)
- [ ] Question context displays (if question_id in URL)
- [ ] Prompt library displays
- [ ] Prompt selection works

### Ask Question Page (`/ask`)
- [ ] Question input works
- [ ] Character counter works (500 max)
- [ ] Category filters work
- [ ] Prompt library displays
- [ ] Clicking prompt fills input
- [ ] Submit works
- [ ] Redirects after submit

### Hospice Bedside Mode (`/hospice/bedside`)
- [ ] Full-screen interface
- [ ] Prompt displays
- [ ] Camera preview works
- [ ] Recording works
- [ ] Exit button works

### Hospice Prompts (`/hospice/prompts`)
- [ ] Legacy prompts display
- [ ] Categories show correctly
- [ ] Milestone buttons display
- [ ] Prompt selection works

### Billing Dashboard (`/admin/billing`)
- [ ] Current plan displays
- [ ] Usage stats show
- [ ] ROI calculator works
- [ ] Buttons display

---

## Troubleshooting

### Backend Issues

**Error: "Database connection error"**
- Check `DATABASE_URL` in `.env`
- Verify database is running
- Check network/firewall

**Error: "JWT_SECRET not configured"**
- Add `JWT_SECRET` to `.env`
- Restart server

**Error: "Port 3001 already in use"**
- Change `PORT` in `.env`
- Or kill process using port 3001

**Error: "Module not found"**
- Run `npm install` again
- Delete `node_modules` and reinstall

### Frontend Issues

**Error: "Cannot connect to API"**
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is running
- Check CORS settings

**Error: "401 Unauthorized"**
- Token expired or invalid
- Clear localStorage and login again
- Check token in browser DevTools

**Error: "Page not found"**
- Check route exists in `app/` directory
- Restart Next.js dev server

**Error: "403 Forbidden"**
- User role doesn't have permission
- Check user role in database
- Verify organization_id is set (for staff/admin)

### Database Issues

**Error: "relation does not exist"**
- Run migrations in Neon
- Check table names match exactly

**Error: "foreign key constraint"**
- Check data exists in referenced table
- Verify IDs are correct UUIDs

---

## Test Data Setup Script

For easier testing, you can run this SQL in Neon to create test data:

```sql
-- Create test organization
INSERT INTO organizations (name, type, address)
VALUES ('Test Facility', 'SNF', '123 Test St')
RETURNING id;

-- Note: Create users via API to get proper password hashes
-- Then link them:

-- Link resident to user
UPDATE residents 
SET user_id = 'USER_ID' 
WHERE id = 'RESIDENT_ID';

-- Link user to organization
UPDATE users 
SET organization_id = 'ORG_ID' 
WHERE id = 'USER_ID';

-- Create family connection
INSERT INTO family_connections (resident_id, user_id, relationship, invite_token, invite_status)
VALUES (
  'RESIDENT_ID',
  'FAMILY_USER_ID',
  'Granddaughter',
  'test-token-123',
  'ACTIVE'
);
```

**Note:** For password hashes, use the register endpoint to create users properly.

---

## Success Criteria

✅ **Backend:**
- All health checks pass
- Can register/login users
- All API endpoints respond correctly
- RLS works (users only see their data)

✅ **Frontend:**
- All pages load
- Navigation works (including bottom nav)
- Forms submit correctly
- Error handling works
- Responsive design works
- All wireframe pages implemented

✅ **Integration:**
- Frontend can call backend APIs
- Authentication flow works
- Data displays correctly
- User flows complete end-to-end
- Bottom navigation works
- Prompt library integrated

---

## Next Steps After Testing

1. Fix any bugs found
2. Implement video upload (Backblaze B2)
3. Add email notifications (SendGrid)
4. Add billing integration (Stripe)
5. Enhance UI/UX based on testing
6. Add error boundaries
7. Add loading states
8. Add form validation feedback
9. Implement Stripe Customer Portal
10. Implement Backblaze B2 upload

---

**Happy Testing! 🧪**
