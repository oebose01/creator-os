To track acceptance rate, run this SQL on companion.db:
  SELECT 
    COUNT(CASE WHEN accepted = 1 THEN 1 END) * 1.0 / COUNT(*) AS acceptance_rate
  FROM suggestions
  WHERE user_id = 'your-user-id';
