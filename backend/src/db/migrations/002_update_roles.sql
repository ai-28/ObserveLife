-- Migration: Update role enum to include platform_admin and rename admin to facility_admin
-- This migration updates the role constraint and migrates existing data

-- Step 1: Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Update existing 'admin' records to 'facility_admin'
UPDATE users SET role = 'facility_admin' WHERE role = 'admin';

-- Step 3: Add new constraint with updated roles
ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('platform_admin', 'facility_admin', 'family', 'resident', 'staff'));
