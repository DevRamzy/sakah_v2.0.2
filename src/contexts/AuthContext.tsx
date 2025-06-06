// @ts-nocheck - Temporarily suppress TypeScript errors until Supabase is properly configured
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  checkIsAdmin: () => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile from the database
  // Flag to prevent infinite recursion when fetching profile fails due to RLS issues
  const [profileFetchFailed, setProfileFetchFailed] = useState(false);
  const [profileFetchAttempts, setProfileFetchAttempts] = useState(0);
  const MAX_PROFILE_FETCH_ATTEMPTS = 2;

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    // If we've already detected an infinite recursion issue, return a default profile
    if (profileFetchFailed) {
      console.log('[AuthContext] Using default profile due to previous RLS error');
      return {
        id: userId,
        role: 'user', // Default to regular user for safety
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as UserProfile;
    }

    try {
      console.log('[AuthContext] Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Error fetching user profile:', error);
        
        // Check for infinite recursion error in RLS policy
        if (error.message && error.message.includes('infinite recursion')) {
          console.log('[AuthContext] Detected infinite recursion in RLS policy, using default profile');
          setProfileFetchFailed(true);
          return {
            id: userId,
            role: 'user', // Default to regular user for safety
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as UserProfile;
        }
        
        // If the profile doesn't exist, create a default one
        if (error.code === 'PGRST116') { // No rows returned
          console.log('[AuthContext] Profile not found, creating default profile');
          return {
            id: userId,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as UserProfile;
        }
        
        // Increment attempt counter
        setProfileFetchAttempts(prev => prev + 1);
        
        // If we've tried too many times, use a default profile
        if (profileFetchAttempts >= MAX_PROFILE_FETCH_ATTEMPTS) {
          console.log('[AuthContext] Max profile fetch attempts reached, using default profile');
          setProfileFetchFailed(true);
          return {
            id: userId,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as UserProfile;
        }
        
        return null;
      }

      console.log('[AuthContext] Profile data retrieved:', data ? 'Data exists' : 'No data');
      return data as UserProfile;
    } catch (error) {
      console.error('[AuthContext] Exception fetching user profile:', error);
      // For any other unexpected errors, use a default profile
      setProfileFetchFailed(true);
      return {
        id: userId,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as UserProfile;
    }
  };

  // Function to refresh the user profile
  const refreshProfile = async () => {
    console.log('[AuthContext] Profile refresh requested');
    if (!user?.id) {
      console.log('[AuthContext] No user ID available for profile refresh');
      return;
    }
    
    try {
      console.log('[AuthContext] Fetching updated profile for:', user.id);
      const userProfile = await fetchUserProfile(user.id);
      console.log('[AuthContext] Updated profile retrieved:', userProfile ? 'Profile exists' : 'No profile');
      setProfile(userProfile);
      setIsAdmin(userProfile?.role === 'admin');
      console.log('[AuthContext] Updated admin status:', userProfile?.role === 'admin');
    } catch (error) {
      console.error('[AuthContext] Error refreshing profile:', error);
    }
  };

  // Function to check if the current user is an admin
  const checkIsAdmin = () => {
    return profile?.role === 'admin';
  };

  useEffect(() => {
    const getSession = async () => {
      console.log('[AuthContext] Initial auth check - Setting loading to true');
      setLoading(true);
      try {
        console.log('[AuthContext] Getting session from Supabase');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error);
          setLoading(false);
          return;
        }
        
        console.log('[AuthContext] Session retrieved:', session ? 'Session exists' : 'No session');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('[AuthContext] User found, fetching profile for:', session.user.id);
          try {
            const userProfile = await fetchUserProfile(session.user.id);
            console.log('[AuthContext] Profile retrieved:', userProfile ? 'Profile exists' : 'No profile');
            
            // Even if profile is null, we should continue and set loading to false
            setProfile(userProfile);
            setIsAdmin(userProfile?.role === 'admin');
            console.log('[AuthContext] Is admin:', userProfile?.role === 'admin');
          } catch (profileError) {
            // Handle profile fetch errors gracefully
            console.error('[AuthContext] Error fetching profile:', profileError);
            setProfile(null);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error('[AuthContext] Exception in getSession:', error);
      } finally {
        console.log('[AuthContext] Initial auth check complete - Setting loading to false');
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log(`[AuthContext] Auth state changed: ${event}`);
        console.log('[AuthContext] Setting loading to true in auth state change');
        setLoading(true);
        
        try {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('[AuthContext] User found in auth change, fetching profile');
            try {
              const userProfile = await fetchUserProfile(session.user.id);
              console.log('[AuthContext] Profile in auth change:', userProfile ? 'Profile exists' : 'No profile');
              
              // If profile fetch fails, we'll use null but still continue
              setProfile(userProfile);
              setIsAdmin(userProfile?.role === 'admin');
              console.log('[AuthContext] Is admin in auth change:', userProfile?.role === 'admin');
            } catch (profileError) {
              // Handle profile fetch errors gracefully
              console.error('[AuthContext] Error fetching profile in auth change:', profileError);
              setProfile(null);
              setIsAdmin(false);
            }
          } else {
            console.log('[AuthContext] No user in auth change, clearing profile');
            setProfile(null);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('[AuthContext] Exception in auth state change:', error);
        } finally {
          console.log('[AuthContext] Auth state change complete - Setting loading to false');
          setLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('[AuthContext] Sign out initiated - Setting loading to true');
    setLoading(true);
    try {
      console.log('[AuthContext] Calling Supabase signOut');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AuthContext] Error signing out:', error);
      }
      // setUser(null) and setSession(null) will be handled by onAuthStateChange
      console.log('[AuthContext] Clearing profile and admin status');
      setProfile(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('[AuthContext] Exception in signOut:', error);
    } finally {
      console.log('[AuthContext] Sign out complete - Setting loading to false');
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    isAdmin,
    signOut,
    checkIsAdmin,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};