-- Create admin_audit_log table to track admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action_type TEXT NOT NULL,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Only admins can view audit logs"
    ON admin_audit_log FOR SELECT
    USING (auth.role() = 'admin');

CREATE POLICY "Only admins can insert audit logs"
    ON admin_audit_log FOR INSERT
    WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Only admins can update audit logs"
    ON admin_audit_log FOR UPDATE
    USING (auth.role() = 'admin');

CREATE POLICY "Only admins can delete audit logs"
    ON admin_audit_log FOR DELETE
    USING (auth.role() = 'admin');

-- Index for faster queries
CREATE INDEX IF NOT EXISTS admin_audit_log_target_user_id_idx ON admin_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_admin_user_id_idx ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_at_idx ON admin_audit_log(created_at); 