# API Endpoints Documentation

## Base URL
`http://localhost:3001/api`

## Authentication
Most endpoints require authentication. Include JWT token in header:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth
- `POST /auth/register` - Register new user
  - Body: `{ email, password, name, role }`
  - Returns: `{ user, token }`
  
- `POST /auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ user, token }`
  
- `GET /auth/me` - Get current user
  - Returns: `{ user }`

### Organizations
- `POST /organizations` - Create organization (admin only)
  - Body: `{ name, type, address }`
  - Returns: `{ organization }`
  
- `GET /organizations` - List organizations
  - Returns: `{ organizations }`
  
- `GET /organizations/:id` - Get organization
  - Returns: `{ organization }`
  
- `PATCH /organizations/:id` - Update organization (admin only)
  - Body: `{ name?, type?, address? }`
  - Returns: `{ organization }`

### Residents
- `POST /residents` - Create resident (staff/admin only)
  - Body: `{ organization_id, name, room_number?, care_type }`
  - Returns: `{ resident }`
  
- `GET /residents` - List residents (scoped by role)
  - Staff/Admin: Returns residents from their organization
  - Resident: Returns their own profile
  - Returns: `{ residents }`
  
- `GET /residents/:id` - Get resident
  - RLS: Staff/Admin (same org), Family (connected), Resident (own)
  - Returns: `{ resident }`
  
- `PATCH /residents/:id` - Update resident (staff/admin only)
  - Body: `{ name?, room_number?, status? }`
  - Returns: `{ resident }`

### Stories
- `POST /stories` - Create story
  - Body: `{ resident_id, title?, video_url, question_id?, privacy, duration_seconds }`
  - Returns: `{ story }`
  
- `GET /stories` - List stories (scoped by role)
  - Query params: `resident_id`, `status`
  - RLS: Staff/Admin (org residents), Family (connected), Resident (own)
  - Returns: `{ stories }`
  
- `GET /stories/:id` - Get story
  - RLS: Same as list
  - Returns: `{ story }`
  
- `PATCH /stories/:id` - Update story
  - Body: `{ title?, privacy?, status? }`
  - Returns: `{ story }`

### Questions (Q&A Engine)
- `POST /questions` - Create question (family only)
  - Body: `{ resident_id, question_text, notify_all_family? }`
  - Returns: `{ question }`
  
- `GET /questions` - List questions (scoped by role)
  - Query params: `resident_id`, `status`
  - Resident: Returns questions for their profile
  - Family: Returns questions they asked
  - Returns: `{ questions }`
  
- `GET /questions/:id` - Get question
  - RLS: Resident (for their profile), Family (they asked)
  - Returns: `{ question }`
  
- `PATCH /questions/:id` - Update question
  - Body: `{ status?, answered_story_id? }`
  - Used to mark question as ANSWERED
  - Returns: `{ question }`

### Family Connections
- `POST /family/invitations/batch` - Batch invite family members (staff/admin only)
  - Body: `{ resident_id, contacts: [{ name, email, relationship }] }`
  - Creates family_connections records with status=PENDING
  - Returns: `{ invitations }`
  
- `GET /family/connections` - Get family connections
  - Query params: `resident_id`
  - Returns: `{ connections }`
  
- `POST /family/invitations/:token/accept` - Accept invitation
  - Body: `{ user_id }`
  - Updates connection status to ACTIVE
  - Returns: `{ connection }`

### Consent Records
- `POST /consent` - Create consent record (staff/admin only)
  - Body: `{ resident_id, consent_type, form_version, consented_by? }`
  - Creates immutable record
  - Returns: `{ consent_record }`
  
- `GET /consent` - Get consent records
  - Query params: `resident_id`
  - Returns: `{ consent_records }`

### Prompts
- `GET /prompts` - List prompts
  - Query params: `category`, `care_type`
  - Categories: CHILDHOOD, FAMILY, WISDOM, GRATITUDE, LEGACY, etc.
  - Care types: SNF, AL, HOSPICE
  - Returns: `{ prompts }`
  
- `GET /prompts/:id` - Get prompt
  - Returns: `{ prompt }`

### Health
- `GET /health` - API health check
  - Returns: `{ success, message, database }`

## Request/Response Examples

### Register
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "family"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "family"
    },
    "token": "jwt-token-here"
  }
}
```

### Create Question
```json
POST /api/questions
{
  "resident_id": "uuid",
  "question_text": "What was your childhood like?",
  "notify_all_family": true
}

Response:
{
  "success": true,
  "data": {
    "question": {
      "id": "uuid",
      "resident_id": "uuid",
      "question_text": "What was your childhood like?",
      "status": "PENDING",
      "created_at": "2024-..."
    }
  }
}
```

### Create Story
```json
POST /api/stories
{
  "resident_id": "uuid",
  "title": "My Childhood Home",
  "video_url": "https://...",
  "question_id": "uuid",
  "privacy": "FAMILY_ONLY",
  "duration_seconds": 180
}

Response:
{
  "success": true,
  "data": {
    "story": {
      "id": "uuid",
      "resident_id": "uuid",
      "title": "My Childhood Home",
      "video_url": "https://...",
      "question_id": "uuid",
      "privacy": "FAMILY_ONLY",
      "duration_seconds": 180,
      "created_at": "2024-..."
    }
  }
}
```

### Batch Invite Family
```json
POST /api/family/invitations/batch
{
  "resident_id": "uuid",
  "contacts": [
    {
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "relationship": "Granddaughter"
    },
    {
      "name": "Michael Johnson",
      "email": "michael@example.com",
      "relationship": "Son"
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "invitations": [
      {
        "id": "uuid",
        "resident_id": "uuid",
        "email": "sarah@example.com",
        "relationship": "Granddaughter",
        "invite_status": "PENDING",
        "invite_token": "token-here"
      },
      ...
    ]
  }
}
```

### Create Consent Record
```json
POST /api/consent
{
  "resident_id": "uuid",
  "consent_type": "SELF",
  "form_version": "1.0",
  "consented_by": "Jennifer Martinez, RN"
}

Response:
{
  "success": true,
  "data": {
    "consent_record": {
      "id": "uuid",
      "resident_id": "uuid",
      "consent_type": "SELF",
      "form_version": "1.0",
      "consented_by": "Jennifer Martinez, RN",
      "created_at": "2024-..."
    }
  }
}
```

### Get Prompts with Filters
```json
GET /api/prompts?category=CHILDHOOD&care_type=SNF

Response:
{
  "success": true,
  "data": {
    "prompts": [
      {
        "id": "uuid",
        "text": "What is your earliest memory?",
        "category": "CHILDHOOD",
        "care_type": "SNF"
      },
      ...
    ]
  }
}
```

## Row Level Security (RLS)

### Staff/Admin
- Can only access data from their organization
- Can create residents in their organization
- Can view all residents in their organization
- Can create consent records
- Can batch invite family members

### Family
- Can only see stories/questions for connected residents
- Can only ask questions to connected residents
- Can see their own questions and answers
- Cannot see other family members' questions

### Resident
- Can only see their own profile
- Can only see questions for their profile
- Can only see their own stories
- Can create stories for themselves

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional validation errors
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Example Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Query Parameters

### Stories
- `resident_id` - Filter by resident
- `status` - Filter by status (PUBLISHED, DRAFT, etc.)

### Questions
- `resident_id` - Filter by resident
- `status` - Filter by status (PENDING, ANSWERED)

### Prompts
- `category` - Filter by category (CHILDHOOD, FAMILY, WISDOM, etc.)
- `care_type` - Filter by care type (SNF, AL, HOSPICE)

### Family Connections
- `resident_id` - Filter by resident

### Consent Records
- `resident_id` - Filter by resident

## Rate Limiting

Currently no rate limiting implemented. Consider adding for production.

## CORS

CORS is enabled for `http://localhost:3000` (frontend). Update for production domain.

## Pagination

Currently no pagination implemented. Consider adding for large datasets.

---

**Total Endpoints**: 25+
**Authentication Required**: Most endpoints (except health check)
**RLS Enabled**: Yes, on all data endpoints
