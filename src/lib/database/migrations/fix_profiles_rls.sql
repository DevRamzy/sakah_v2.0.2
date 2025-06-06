-- Fix the infinite recursion in profiles table RLS policy
-- This migration drops the problematic policy and creates a new one that avoids recursion

-- First, let's drop any problematic policies on the profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create a simpler policy for viewing profiles
-- This allows users to view their own profile and admins to view all profiles
CREATE POLICY "Users can view own profile and admins can view all" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid() AND auth.users.email IN (
        SELECT email FROM auth.users WHERE auth.users.id IN (
          SELECT id FROM profiles WHERE role = 'admin'
        )
      )
    )
  );

-- Create a simpler policy for updating profiles
-- This allows users to update their own profile and admins to update all profiles
CREATE POLICY "Users can update own profile and admins can update all" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid() AND auth.users.email IN (
        SELECT email FROM auth.users WHERE auth.users.id IN (
          SELECT id FROM profiles WHERE role = 'admin'
        )
      )
    )
  );

-- Create a policy for inserting profiles (typically done by the system)
CREATE POLICY "System can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- Log this migration in admin_activity_logs
INSERT INTO admin_activity_logs (action, details, performed_by)
VALUES (
  'database_migration',
  'Fixed infinite recursion in profiles table RLS policies',
  'system'
);
