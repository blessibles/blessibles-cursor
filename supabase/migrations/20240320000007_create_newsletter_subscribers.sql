-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all subscribers"
    ON newsletter_subscribers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role = 'admin'
        )
    );

CREATE POLICY "Anyone can insert subscribers"
    ON newsletter_subscribers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Subscribers can update their own record"
    ON newsletter_subscribers FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Subscribers can delete their own record"
    ON newsletter_subscribers FOR DELETE
    USING (user_id = auth.uid());

-- Index for faster queries
CREATE INDEX IF NOT EXISTS newsletter_subscribers_subscribed_at_idx ON newsletter_subscribers(subscribed_at); 