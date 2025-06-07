/*
  # Create user dashboard stats function

  1. New Functions
    - `get_user_dashboard_stats(user_id)` - Returns dashboard statistics for a specific user
      - `total_listings` (integer) - Total number of listings by the user
      - `published_listings` (integer) - Number of published listings
      - `draft_listings` (integer) - Number of draft listings

  2. Security
    - Function uses security definer to access data
    - Only returns data for the specified user
*/

CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count integer := 0;
  published_count integer := 0;
  draft_count integer := 0;
  result json;
BEGIN
  -- Get total listings count
  SELECT COUNT(*)
  INTO total_count
  FROM listings
  WHERE listings.user_id = get_user_dashboard_stats.user_id;

  -- Get published listings count
  SELECT COUNT(*)
  INTO published_count
  FROM listings
  WHERE listings.user_id = get_user_dashboard_stats.user_id
    AND listings.is_published = true;

  -- Calculate draft count
  draft_count := total_count - published_count;

  -- Build result object
  result := json_build_object(
    'total_listings', total_count,
    'published_listings', published_count,
    'draft_listings', draft_count
  );

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_dashboard_stats(uuid) TO authenticated;