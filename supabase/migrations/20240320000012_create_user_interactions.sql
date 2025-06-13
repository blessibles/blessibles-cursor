-- Create user_interactions table for tracking user behavior
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'wishlist', 'purchase', 'cart_add', 'cart_remove')),
    metadata JSONB DEFAULT '{}'::jsonb,
    count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS user_interactions_user_id_idx ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS user_interactions_product_id_idx ON user_interactions(product_id);
CREATE INDEX IF NOT EXISTS user_interactions_interaction_type_idx ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS user_interactions_created_at_idx ON user_interactions(created_at);
CREATE INDEX IF NOT EXISTS user_interactions_count_idx ON user_interactions(count);

-- Enable Row Level Security
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own interactions"
    ON user_interactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions"
    ON user_interactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to get user recommendations
CREATE OR REPLACE FUNCTION get_user_recommendations(user_id UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
    product_id UUID,
    score FLOAT,
    reason TEXT
) AS $$
BEGIN
    -- Grant necessary permissions
    GRANT SELECT ON products TO authenticated;
    GRANT SELECT ON user_interactions TO authenticated;

    RETURN QUERY
    WITH user_interaction_counts AS (
        SELECT 
            ui2.product_id,
            COUNT(*) as interaction_count
        FROM user_interactions ui1
        JOIN user_interactions ui2 ON ui1.product_id = ui2.product_id
        WHERE ui1.user_id = $1
        AND ui2.user_id != $1
        GROUP BY ui2.product_id
    ),
    category_scores AS (
        SELECT 
            p.id as product_id,
            COUNT(*) as category_match_count
        FROM user_interactions ui
        JOIN products p ON ui.product_id = p.id
        WHERE ui.user_id = $1
        GROUP BY p.id
    )
    SELECT 
        p.id as product_id,
        COALESCE(uic.interaction_count, 0) + COALESCE(cs.category_match_count, 0) as score,
        CASE 
            WHEN uic.interaction_count > 0 THEN 'Based on similar users'
            WHEN cs.category_match_count > 0 THEN 'Based on your interests'
            ELSE 'Popular item'
        END as reason
    FROM products p
    LEFT JOIN user_interaction_counts uic ON p.id = uic.product_id
    LEFT JOIN category_scores cs ON p.id = cs.product_id
    WHERE p.id NOT IN (
        SELECT product_id 
        FROM user_interactions 
        WHERE user_id = $1
    )
    ORDER BY score DESC
    LIMIT $2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 