/*
  # Fix Listings and Listing Images RLS Policies

  1. Changes
    - Drops any existing RLS policies on `listings` and `listing_images` tables for a clean slate.
    - Creates policies for public read access to published listings and their images.
    - Creates policies for authenticated users to manage their own listings and images.

  2. Security
    - Ensures only published listings and their associated images are publicly viewable.
    - Ensures users can only CUD (Create, Update, Delete) their own listings and images.
*/

-- Drop existing policies on listings table (if any)
DROP POLICY IF EXISTS "Public can view published listings" ON public.listings;
DROP POLICY IF EXISTS "Users can manage their own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can insert their own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON public.listings;

-- Drop existing policies on listing_images table (if any)
DROP POLICY IF EXISTS "Public can view images for published listings" ON public.listing_images;
DROP POLICY IF EXISTS "Users can manage images for their own listings" ON public.listing_images;
DROP POLICY IF EXISTS "Users can insert images for their own listings" ON public.listing_images;
DROP POLICY IF EXISTS "Users can update images for their own listings" ON public.listing_images;
DROP POLICY IF EXISTS "Users can delete images for their own listings" ON public.listing_images;

-- Policies for 'listings' table

-- 1. Allow public read access to published listings
CREATE POLICY "Public can view published listings"
  ON public.listings FOR SELECT
  USING (is_published = true);

-- 2. Allow authenticated users to insert their own listings
CREATE POLICY "Users can insert their own listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Allow authenticated users to update their own listings
CREATE POLICY "Users can update their own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Allow authenticated users to delete their own listings
CREATE POLICY "Users can delete their own listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for 'listing_images' table

-- 1. Allow public read access to images of published listings
CREATE POLICY "Public can view images for published listings"
  ON public.listing_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = listing_images.listing_id AND l.is_published = true
    )
  );

-- 2. Allow authenticated users to insert images for their own listings
CREATE POLICY "Users can insert images for their own listings"
  ON public.listing_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = listing_images.listing_id AND l.user_id = auth.uid()
    )
  );

-- 3. Allow authenticated users to update images for their own listings (e.g., change primary status)
CREATE POLICY "Users can update images for their own listings"
  ON public.listing_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = listing_images.listing_id AND l.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = listing_images.listing_id AND l.user_id = auth.uid()
    )
  );

-- 4. Allow authenticated users to delete images for their own listings
CREATE POLICY "Users can delete images for their own listings"
  ON public.listing_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = listing_images.listing_id AND l.user_id = auth.uid()
    )
  );

-- Enable RLS on the tables if not already enabled
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

-- Log this migration (optional, adjust as needed)
-- This assumes you have an admin_activity_logs table
-- Consider creating one if you want to log migrations
/*
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'admin_activity_logs'
  ) THEN
    INSERT INTO public.admin_activity_logs (admin_id, action, entity_type, details)
    VALUES (
      auth.uid(), -- Or a system user ID if applicable
      'database_migration',
      'listings_rls',
      'Applied RLS policies for listings and listing_images tables.'
    );
  END IF;
END $$;
*/
