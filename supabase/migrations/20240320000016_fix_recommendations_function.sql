-- Fix ambiguous column reference in get_user_recommendations function
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
        (COALESCE(uic.interaction_count, 0) + COALESCE(cs.category_match_count, 0))::FLOAT as score,
        CASE 
            WHEN uic.interaction_count > 0 THEN 'Based on similar users'
            WHEN cs.category_match_count > 0 THEN 'Based on your interests'
            ELSE 'Popular item'
        END as reason
    FROM products p
    LEFT JOIN user_interaction_counts uic ON p.id = uic.product_id
    LEFT JOIN category_scores cs ON p.id = cs.product_id
    WHERE p.id NOT IN (
        SELECT ui.product_id 
        FROM user_interactions ui
        WHERE ui.user_id = $1
    )
    ORDER BY score DESC
    LIMIT $2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 