-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category VARCHAR(50),
    tags TEXT[],
    rating DECIMAL(3,2),
    reviews_count INTEGER DEFAULT 0,
    bestseller BOOLEAN DEFAULT false,
    new BOOLEAN DEFAULT false,
    sale BOOLEAN DEFAULT false,
    sale_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_tags_idx ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS products_rating_idx ON products(rating);
CREATE INDEX IF NOT EXISTS products_bestseller_idx ON products(bestseller);
CREATE INDEX IF NOT EXISTS products_new_idx ON products(new);
CREATE INDEX IF NOT EXISTS products_sale_idx ON products(sale);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view products"
    ON products FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert products"
    ON products FOR INSERT
    WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Only admins can update products"
    ON products FOR UPDATE
    USING (auth.role() = 'admin');

CREATE POLICY "Only admins can delete products"
    ON products FOR DELETE
    USING (auth.role() = 'admin');

-- Insert sample products
INSERT INTO products (title, description, price, image_url, category, tags, rating, reviews_count, bestseller, new, sale, sale_price)
VALUES
    ('Scripture Wall Art', 'Inspire your home with beautiful verses.', 12.99, '/products/scripture-wall-art.jpg', 'wall-art', ARRAY['scripture', 'wall art', 'home decor', 'faith'], 4.8, 124, true, false, false, null),
    ('Family Prayer Journal', 'Grow together in faith and gratitude.', 9.99, '/products/family-prayer-journal.jpg', 'journals', ARRAY['prayer', 'journal', 'family', 'faith'], 4.9, 89, true, false, true, 7.99),
    ('Kids Bible Activities', 'Fun, faith-filled activities for children.', 14.99, '/products/kids-bible-activities.jpg', 'activities', ARRAY['kids', 'bible', 'activities', 'learning'], 4.7, 56, false, true, false, null),
    ('Blessibles Digital Gift Card', 'Give the gift of choice! Instantly delivered by email, redeemable for any printable.', 25.00, '/products/gift-card.jpg', 'gift-card', ARRAY['gift card', 'gift', 'digital'], 5.0, 12, true, true, false, null)
ON CONFLICT DO NOTHING; 