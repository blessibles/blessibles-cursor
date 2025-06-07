-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    confirmed BOOLEAN DEFAULT false,
    confirmation_token TEXT,
    unsubscribed BOOLEAN DEFAULT false,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS newsletter_subscribers_email_idx ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS newsletter_subscribers_created_at_idx ON newsletter_subscribers(created_at);
CREATE INDEX IF NOT EXISTS newsletter_subscribers_confirmed_idx ON newsletter_subscribers(confirmed);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all subscribers"
    ON newsletter_subscribers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Anyone can subscribe"
    ON newsletter_subscribers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can unsubscribe themselves"
    ON newsletter_subscribers FOR UPDATE
    USING (
        email = auth.jwt()->>'email'
    )
    WITH CHECK (
        email = auth.jwt()->>'email'
    ); 