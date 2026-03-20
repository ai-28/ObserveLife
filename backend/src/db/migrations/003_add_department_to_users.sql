-- Add department and staff_type fields to users table for staff members
ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_type TEXT CHECK (staff_type IN ('facilitator', 'therapist') OR staff_type IS NULL);
