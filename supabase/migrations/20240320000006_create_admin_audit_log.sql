-- Create admin_audit_log table to track admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action_type TEXT NOT NULL,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS admin_audit_log_target_user_id_idx ON admin_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_admin_user_id_idx ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_at_idx ON admin_audit_log(created_at); 