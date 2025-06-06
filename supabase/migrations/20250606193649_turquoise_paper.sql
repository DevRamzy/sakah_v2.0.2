-- Drop any problematic policies on the profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile and admins can view all" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile and admins can update all" ON profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a simpler policy for viewing profiles (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Public can view profiles'
  ) THEN
    CREATE POLICY "Public can view profiles"
      ON profiles FOR SELECT
      USING (true);
  END IF;
END $$;

-- Create a policy for updating profiles (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

-- Create a policy for inserting profiles (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Make sure RLS is enabled on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Log this migration (only if admin_activity_logs table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'admin_activity_logs'
  ) THEN
    INSERT INTO admin_activity_logs (admin_id, action, entity_type, entity_id, details)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      'database_migration',
      'profiles',
      '00000000-0000-0000-0000-000000000000',
      '{"description": "Fixed infinite recursion in profiles table RLS policies"}'
    );
  END IF;
END $$;