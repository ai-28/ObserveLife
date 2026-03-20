-- ObserveLife Database Schema
-- Based on FlowGuide data model

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('SNF', 'AL', 'HOSPICE')),
    address TEXT,
    billing_status TEXT NOT NULL DEFAULT 'PILOT' CHECK (billing_status IN ('PILOT', 'ACTIVE', 'SUSPENDED')),
    residents_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table (all user types: admin, family, resident, staff)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('platform_admin', 'facility_admin', 'family', 'resident', 'staff')),
    organization_id UUID REFERENCES organizations(id),
    phone TEXT,
    timezone TEXT DEFAULT 'America/New_York',
    notification_method TEXT DEFAULT 'EMAIL' CHECK (notification_method IN ('EMAIL', 'SMS', 'BOTH')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Residents table
CREATE TABLE residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    room_number TEXT,
    care_type TEXT NOT NULL CHECK (care_type IN ('SNF', 'AL', 'HOSPICE')),
    consent_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (consent_status IN ('PENDING', 'CONFIRMED')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    profile_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prompts table (story prompts library)
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    text TEXT NOT NULL,
    care_type TEXT CHECK (care_type IN ('SNF', 'AL', 'HOSPICE', NULL)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Questions table (Q&A Engine) - Created before stories to avoid circular dependency
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id),
    asked_by_user_id UUID NOT NULL REFERENCES users(id),
    question_text TEXT NOT NULL CHECK (char_length(question_text) <= 500),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ANSWERED')),
    answered_story_id UUID, -- Will add foreign key constraint after stories table is created
    notify_all_family BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stories table
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id),
    title TEXT,
    video_url TEXT NOT NULL,
    prompt_id UUID REFERENCES prompts(id),
    question_id UUID REFERENCES questions(id),
    privacy TEXT NOT NULL DEFAULT 'FAMILY_ONLY' CHECK (privacy IN ('PUBLIC', 'PRIVATE', 'FAMILY_ONLY')),
    staff_recorded_by UUID REFERENCES users(id),
    duration_seconds INTEGER,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for answered_story_id (after stories table exists)
ALTER TABLE questions 
ADD CONSTRAINT fk_questions_answered_story 
FOREIGN KEY (answered_story_id) REFERENCES stories(id);

-- Family connections table
CREATE TABLE family_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id),
    user_id UUID NOT NULL REFERENCES users(id),
    relationship TEXT NOT NULL,
    invite_token TEXT UNIQUE NOT NULL,
    invite_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (invite_status IN ('PENDING', 'ACTIVE')),
    connected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Consent records table (IMMUTABLE)
CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id),
    consented_by_user_id UUID REFERENCES users(id),
    consent_type TEXT NOT NULL CHECK (consent_type IN ('SELF', 'REPRESENTATIVE')),
    rep_name TEXT,
    rep_relationship TEXT,
    form_version TEXT NOT NULL,
    ip_address TEXT,
    consent_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Billing accounts table
CREATE TABLE billing_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('SNF', 'AL', 'HOSPICE')),
    rate_per_resident DECIMAL(10, 2) NOT NULL,
    active_residents_count INTEGER NOT NULL DEFAULT 0,
    billing_anchor_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_residents_organization_id ON residents(organization_id);
CREATE INDEX idx_residents_user_id ON residents(user_id);
CREATE INDEX idx_stories_resident_id ON stories(resident_id);
CREATE INDEX idx_stories_question_id ON stories(question_id);
CREATE INDEX idx_questions_resident_id ON questions(resident_id);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_asked_by ON questions(asked_by_user_id);
CREATE INDEX idx_family_connections_resident_id ON family_connections(resident_id);
CREATE INDEX idx_family_connections_user_id ON family_connections(user_id);
CREATE INDEX idx_family_connections_token ON family_connections(invite_token);
CREATE INDEX idx_consent_records_resident_id ON consent_records(resident_id);
CREATE INDEX idx_prompts_category ON prompts(category);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON residents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_connections_updated_at BEFORE UPDATE ON family_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_accounts_updated_at BEFORE UPDATE ON billing_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
