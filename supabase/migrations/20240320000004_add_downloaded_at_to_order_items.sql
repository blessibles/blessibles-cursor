-- Add downloaded_at column to order_items to track downloads
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS downloaded_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS order_items_downloaded_at_idx ON order_items(downloaded_at); 