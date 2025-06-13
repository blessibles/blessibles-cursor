-- Rename title column to name
ALTER TABLE products RENAME COLUMN title TO name;

-- Update indexes
DROP INDEX IF EXISTS products_category_idx;
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
DROP INDEX IF EXISTS products_tags_idx;
CREATE INDEX IF NOT EXISTS products_tags_idx ON products USING GIN(tags);
DROP INDEX IF EXISTS products_rating_idx;
CREATE INDEX IF NOT EXISTS products_rating_idx ON products(rating);
DROP INDEX IF EXISTS products_bestseller_idx;
CREATE INDEX IF NOT EXISTS products_bestseller_idx ON products(bestseller);
DROP INDEX IF EXISTS products_new_idx;
CREATE INDEX IF NOT EXISTS products_new_idx ON products(new);
DROP INDEX IF EXISTS products_sale_idx;
CREATE INDEX IF NOT EXISTS products_sale_idx ON products(sale); 