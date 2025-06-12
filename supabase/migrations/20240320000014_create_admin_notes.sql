-- Create admin_notes table for internal admin comments
CREATE TABLE IF NOT EXISTS admin_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Only admins can view admin notes"
    ON admin_notes FOR SELECT
    USING (auth.role() = 'admin');

CREATE POLICY "Only admins can insert admin notes"
    ON admin_notes FOR INSERT
    WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Only admins can update admin notes"
    ON admin_notes FOR UPDATE
    USING (auth.role() = 'admin');

CREATE POLICY "Only admins can delete admin notes"
    ON admin_notes FOR DELETE
    USING (auth.role() = 'admin'); 