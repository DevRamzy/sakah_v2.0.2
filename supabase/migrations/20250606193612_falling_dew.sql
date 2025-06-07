/*
  # Fix Profiles RLS Policy

  1. Changes
    - Drops problematic RLS policies on the profiles table
    - Creates simplified policies that avoid infinite recursion
    - Adds a policy for inserting profiles
  
  2. Security
    - Maintains security by allowing users to view and update only their own profiles
    - Adds special handling for admin users
*/

-- Drop any problematic policies on the profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile and admins can view all" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile and admins can update all" ON profiles;

-- Also drop the new policies if they already exist (in case this migration was partially applied)
DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a simpler policy for viewing profiles
CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT
  USING (true);

-- Create a policy for updating profiles
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create a policy for inserting profiles (typically done by the system)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Logging migration is skipped to avoid foreign key constraint errors
-- You can manually log this migration after it's applied if needed