-- Add refund-related columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_id TEXT,
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- Create index for faster refund queries
CREATE INDEX IF NOT EXISTS orders_refunded_at_idx ON orders(refunded_at);
CREATE INDEX IF NOT EXISTS orders_payment_intent_id_idx ON orders(payment_intent_id);

-- Add refund status to order status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_type 
        WHERE typname = 'order_status' 
        AND EXISTS (
            SELECT 1 
            FROM pg_enum 
            WHERE enumlabel = 'Refunded'
        )
    ) THEN
        ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Refunded';
    END IF;
END $$; 