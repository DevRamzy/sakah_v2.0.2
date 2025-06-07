-- Add approval workflow columns to listings table if they don't exist
DO $$
BEGIN
  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'status') THEN
    ALTER TABLE listings ADD COLUMN status TEXT DEFAULT 'pending';
    COMMENT ON COLUMN listings.status IS 'Status of the listing (pending, approved, rejected)';
  END IF;
  
  -- Add approved_by column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'approved_by') THEN
    ALTER TABLE listings ADD COLUMN approved_by UUID REFERENCES auth.users(id);
    COMMENT ON COLUMN listings.approved_by IS 'ID of the admin who approved the listing';
  END IF;
  
  -- Add approved_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'approved_at') THEN
    ALTER TABLE listings ADD COLUMN approved_at TIMESTAMPTZ;
    COMMENT ON COLUMN listings.approved_at IS 'Timestamp when the listing was approved';
  END IF;
  
  -- Add rejection_reason column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'rejection_reason') THEN
    ALTER TABLE listings ADD COLUMN rejection_reason TEXT;
    COMMENT ON COLUMN listings.rejection_reason IS 'Reason for rejection if the listing was rejected';
  END IF;
  
  -- Add is_featured column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'is_featured') THEN
    ALTER TABLE listings ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    COMMENT ON COLUMN listings.is_featured IS 'Whether the listing is featured on the homepage';
  END IF;
END $$;

-- Create index on status column for faster filtering
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_is_featured ON listings(is_featured);

-- Create function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Create function to approve a listing
CREATE OR REPLACE FUNCTION approve_listing(listing_id UUID, admin_id UUID DEFAULT auth.uid())
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve listings';
  END IF;

  -- Update the listing status
  UPDATE listings
  SET 
    status = 'approved',
    is_published = TRUE,
    approved_by = admin_id,
    approved_at = NOW(),
    rejection_reason = NULL
  WHERE id = listing_id;

  -- Log the admin activity
  INSERT INTO admin_activity_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    admin_id,
    'approve',
    'listing',
    listing_id,
    jsonb_build_object('timestamp', NOW())
  );
END;
$$;

-- Create function to reject a listing
CREATE OR REPLACE FUNCTION reject_listing(listing_id UUID, reason TEXT, admin_id UUID DEFAULT auth.uid())
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can reject listings';
  END IF;

  -- Update the listing status
  UPDATE listings
  SET 
    status = 'rejected',
    is_published = FALSE,
    approved_by = NULL,
    approved_at = NULL,
    rejection_reason = reason
  WHERE id = listing_id;

  -- Log the admin activity
  INSERT INTO admin_activity_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    admin_id,
    'reject',
    'listing',
    listing_id,
    jsonb_build_object('reason', reason, 'timestamp', NOW())
  );
END;
$$;

-- Create function to toggle featured status
CREATE OR REPLACE FUNCTION toggle_featured_listing(listing_id UUID, featured BOOLEAN, admin_id UUID DEFAULT auth.uid())
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can feature listings';
  END IF;

  -- Update the listing featured status
  UPDATE listings
  SET is_featured = featured
  WHERE id = listing_id;

  -- Log the admin activity
  INSERT INTO admin_activity_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    admin_id,
    'feature',
    'listing',
    listing_id,
    jsonb_build_object('featured', featured, 'timestamp', NOW())
  );
END;
$$;

-- Create function to get user dashboard stats
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_id UUID DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_listings integer;
  pending_listings integer;
  approved_listings integer;
  rejected_listings integer;
  result json;
BEGIN
  -- Check if the user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Get total listings count for this user
  SELECT COUNT(*) INTO total_listings FROM listings WHERE user_id = user_id;
  
  -- Get pending listings count
  SELECT COUNT(*) INTO pending_listings FROM listings WHERE user_id = user_id AND status = 'pending';
  
  -- Get approved listings count
  SELECT COUNT(*) INTO approved_listings FROM listings WHERE user_id = user_id AND status = 'approved';
  
  -- Get rejected listings count
  SELECT COUNT(*) INTO rejected_listings FROM listings WHERE user_id = user_id AND status = 'rejected';

  -- Build result object
  result := json_build_object(
    'totalListings', total_listings,
    'pendingListings', pending_listings,
    'approvedListings', approved_listings,
    'rejectedListings', rejected_listings
  );

  RETURN result;
END;
$$;

-- Create admin dashboard stats function
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_listings integer;
  pending_listings integer;
  total_users integer;
  featured_listings integer;
  new_users_this_month integer;
  new_listings_this_month integer;
  result json;
BEGIN
  -- Check if the user is an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can access dashboard stats';
  END IF;

  -- Get total listings count
  SELECT COUNT(*) INTO total_listings FROM listings;
  
  -- Get pending listings count
  SELECT COUNT(*) INTO pending_listings FROM listings WHERE status = 'pending';
  
  -- Get featured listings count
  SELECT COUNT(*) INTO featured_listings FROM listings WHERE is_featured = TRUE;
  
  -- Get total users count
  SELECT COUNT(*) INTO total_users FROM profiles;
  
  -- Get new users this month
  SELECT COUNT(*) 
  INTO new_users_this_month 
  FROM profiles 
  WHERE created_at >= date_trunc('month', current_date);
  
  -- Get new listings this month
  SELECT COUNT(*) 
  INTO new_listings_this_month 
  FROM listings 
  WHERE created_at >= date_trunc('month', current_date);

  -- Build result object
  result := json_build_object(
    'totalListings', total_listings,
    'pendingListings', pending_listings,
    'totalUsers', total_users,
    'featuredListings', featured_listings,
    'newUsersThisMonth', new_users_this_month,
    'newListingsThisMonth', new_listings_this_month
  );

  RETURN result;
END;
$$;

-- Update RLS policies for listings table

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view published listings" ON listings;
DROP POLICY IF EXISTS "Users can view their own listings" ON listings;
DROP POLICY IF EXISTS "Users can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON listings;
DROP POLICY IF EXISTS "Admins can delete all listings" ON listings;

-- Create new policies

-- 1. Public can only view approved listings
CREATE POLICY "Public can view published listings"
ON listings FOR SELECT
USING (status = 'approved' AND is_published = TRUE);

-- 2. Users can view their own listings regardless of status
CREATE POLICY "Users can view their own listings"
ON listings FOR SELECT
USING (auth.uid() = user_id);

-- 3. Users can insert their own listings (always as pending)
CREATE POLICY "Users can insert their own listings"
ON listings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Users can update their own listings if they're not approved
CREATE POLICY "Users can update their own listings"
ON listings FOR UPDATE
USING (auth.uid() = user_id AND status != 'approved')
WITH CHECK (auth.uid() = user_id AND status != 'approved');

-- 5. Users can delete their own listings if they're not approved
CREATE POLICY "Users can delete their own listings"
ON listings FOR DELETE
USING (auth.uid() = user_id AND status != 'approved');

-- 6. Admins can view all listings
CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
USING (is_admin());

-- 7. Admins can update all listings
CREATE POLICY "Admins can update all listings"
ON listings FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- 8. Admins can delete all listings
CREATE POLICY "Admins can delete all listings"
ON listings FOR DELETE
USING (is_admin());

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_dashboard_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_listing(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_listing(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_featured_listing(UUID, BOOLEAN, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;