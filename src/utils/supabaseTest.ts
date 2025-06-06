import { supabase } from '../lib/supabaseClient';

/**
 * Utility function to test Supabase connection and basic functionality
 * This helps diagnose issues with Supabase connectivity
 */
export const testSupabaseConnection = async () => {
  console.log('[SupabaseTest] Starting connection test...');
  
  try {
    // Test 1: Basic ping to check if Supabase is reachable
    console.log('[SupabaseTest] Test 1: Basic ping');
    const { data: pingData, error: pingError } = await supabase.from('profiles').select('count');
    
    if (pingError) {
      console.error('[SupabaseTest] Ping failed:', pingError);
      return { success: false, error: pingError };
    }
    
    console.log('[SupabaseTest] Ping successful:', pingData);
    
    // Test 2: Check auth service
    console.log('[SupabaseTest] Test 2: Auth service check');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[SupabaseTest] Auth service check failed:', sessionError);
      return { success: false, error: sessionError };
    }
    
    console.log('[SupabaseTest] Auth service check successful:', 
      sessionData.session ? 'Session exists' : 'No active session');
    
    // Test 3: Check if we can access the listings table
    console.log('[SupabaseTest] Test 3: Listings table access');
    const { data: listingsData, error: listingsError } = await supabase
      .from('listings')
      .select('count');
    
    if (listingsError) {
      console.error('[SupabaseTest] Listings table access failed:', listingsError);
      return { success: false, error: listingsError };
    }
    
    console.log('[SupabaseTest] Listings table access successful:', listingsData);
    
    // All tests passed
    console.log('[SupabaseTest] All tests passed! Supabase connection is working properly.');
    return { success: true };
    
  } catch (error) {
    console.error('[SupabaseTest] Unexpected error during tests:', error);
    return { success: false, error };
  }
};
