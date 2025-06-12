-- Fix existing tables and add missing columns

-- First, check if order_items has the correct columns
DO $$ 
BEGIN
    -- Add product_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'product_id'
    ) THEN
        ALTER TABLE order_items ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE SET NULL;
    END IF;

    -- Add price if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'price'
    ) THEN
        ALTER TABLE order_items ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0.00;
    END IF;

    -- Add quantity if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'quantity'
    ) THEN
        ALTER TABLE order_items ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items(product_id);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);

-- Enable RLS if not already enabled
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'order_items' 
        AND policyname = 'Users can view their own order items'
    ) THEN
        CREATE POLICY "Users can view their own order items"
            ON order_items FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM orders
                    WHERE orders.id = order_items.order_id
                    AND orders.user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'order_items' 
        AND policyname = 'Users can create order items for their own orders'
    ) THEN
        CREATE POLICY "Users can create order items for their own orders"
            ON order_items FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM orders
                    WHERE orders.id = order_items.order_id
                    AND orders.user_id = auth.uid()
                )
            );
    END IF;
END $$; 