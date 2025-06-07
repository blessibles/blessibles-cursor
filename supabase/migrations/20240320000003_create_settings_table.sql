-- Create a settings table for site-wide configuration
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- Insert the refunds_enabled flag (default: true)
INSERT INTO settings (key, value)
VALUES ('refunds_enabled', '{"enabled": true}')
ON CONFLICT (key) DO NOTHING; 