-- Create tracking_updates table
CREATE TABLE IF NOT EXISTS tracking_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    location TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS tracking_updates_order_id_idx ON tracking_updates(order_id);
CREATE INDEX IF NOT EXISTS tracking_updates_timestamp_idx ON tracking_updates(timestamp);

-- Enable Row Level Security
ALTER TABLE tracking_updates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view tracking updates for their orders"
    ON tracking_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = tracking_updates.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Add tracking_number and carrier to orders table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'tracking_number'
    ) THEN
        ALTER TABLE orders ADD COLUMN tracking_number TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'carrier'
    ) THEN
        ALTER TABLE orders ADD COLUMN carrier TEXT;
    END IF;
END $$; 