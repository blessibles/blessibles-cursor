-- Add admin_notes column to users table for internal admin comments
ALTER TABLE users
ADD COLUMN IF NOT EXISTS admin_notes TEXT; 