// Shared types for the application

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'platform_admin' | 'facility_admin' | 'family' | 'resident' | 'staff';
    organization_id?: string;
    created_at: Date;
    updated_at: Date;
}

export interface Organization {
    id: string;
    name: string;
    type: 'SNF' | 'AL' | 'HOSPICE';
    address: string;
    billing_status: 'PILOT' | 'ACTIVE' | 'SUSPENDED';
    residents_count: number;
    created_at: Date;
    updated_at: Date;
}

export interface Resident {
    id: string;
    organization_id: string;
    user_id: string;
    room_number?: string;
    status: 'ACTIVE' | 'INACTIVE';
    created_at: Date;
    updated_at: Date;
}

export interface Story {
    id: string;
    resident_id: string;
    title: string;
    video_url: string;
    prompt_id?: string;
    question_id?: string;
    privacy: 'PUBLIC' | 'PRIVATE' | 'FAMILY_ONLY';
    created_at: Date;
    updated_at: Date;
}

export interface Question {
    id: string;
    resident_id: string;
    asked_by_user_id: string;
    question_text: string;
    status: 'PENDING' | 'ANSWERED';
    answered_story_id?: string;
    created_at: Date;
    updated_at: Date;
}

export interface Prompt {
    id: string;
    category: string;
    text: string;
    created_at: Date;
}
