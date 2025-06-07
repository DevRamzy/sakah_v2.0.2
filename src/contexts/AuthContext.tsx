// AuthContext provides authentication state and profile management for the application
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
  profileFetchFailed: boolean;
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
  const [loading, setLoading] = useState(true); // Start with loading true to prevent premature data fetching
  // This is used to determine when to fall back to email-based admin detection
  const [profileFetchFailed, setProfileFetchFailed] = useState(false); // Track profile fetch failures for fallback handling

  // Function to refresh the user profile - using the same approach as background fetching
  const refreshProfile = async () => {
    if (!user) return;
    
    console.log('[AuthContext] Refreshing profile for user:', user.id);
    setLoading(true);
    
    try {
      // Determine admin status directly from email (matching our RLS policies)
      const isAdminUser = Boolean(user.email?.includes('admin') || user.email?.endsWith('@sakah.online'));
      console.log('[AuthContext] Admin check from email during refresh:', isAdminUser ? 'Is admin' : 'Not admin');
      
      // Set admin status immediately based on email
      setIsAdmin(isAdminUser);
      
      // First try to get user data directly from auth.getUser() - bypasses RLS
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('[AuthContext] Error getting auth user during refresh:', authError);
        throw authError;
      }
      
      if (!authUser) {
        console.error('[AuthContext] No auth user found during refresh');
        throw new Error('No auth user found');
      }
      
      // Now try to get profile - this might work with our RLS policies
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        // If we get permission denied, we'll create a profile based on auth user
        if (error.message.includes('permission denied')) {
          console.log('[AuthContext] Permission denied for profile during refresh, using auth user data');
          // Continue execution - we'll create a profile below
        } else {
          console.error('[AuthContext] Error fetching profile during refresh:', error);
          throw error;
        }
      }
      
      // If we successfully got profile data from the database, use it
      if (profileData) {
        console.log('[AuthContext] Profile refreshed successfully');
        setProfile(profileData);
        // Only update admin status if it's different from email-based check
        if ((profileData.role === 'admin') !== isAdminUser) {
          console.log('[AuthContext] Updating admin status from profile during refresh:', profileData.role);
          setIsAdmin(profileData.role === 'admin');
        }
      } else {
        // No profile found or permission denied - create a default profile
        console.log('[AuthContext] Creating default profile from auth user data during refresh');
        
        // Create default profile using auth user data
        const defaultProfile = {
          id: user.id,
          role: isAdminUser ? 'admin' : 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Add any additional fields from auth user if available
          full_name: authUser.user_metadata?.full_name || '',
          avatar_url: authUser.user_metadata?.avatar_url || ''
        };
        
        // Set the profile in state
        setProfile(defaultProfile as UserProfile);
        
        // Check if profile exists first to avoid duplicate key errors
        try {
          console.log('[AuthContext] Checking if profile exists before creating during refresh');
          const { count, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('id', user.id);
            
          if (countError) {
            console.log('[AuthContext] Error checking profile existence during refresh:', countError);
            // Continue anyway and try to create
          } else if (count && count > 0) {
            console.log('[AuthContext] Profile already exists during refresh, skipping creation');
            return; // Skip creation if profile exists
          }
          
          // Try to create the profile in the database - but don't block on this
          console.log('[AuthContext] Attempting to create profile in database during refresh');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                role: isAdminUser ? 'admin' : 'user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                full_name: authUser.user_metadata?.full_name || '',
                avatar_url: authUser.user_metadata?.avatar_url || ''
              }
            ]);
            
          if (insertError) {
            // If we get permission denied here, it's expected with our RLS policies
            if (insertError.message.includes('permission denied')) {
              console.log('[AuthContext] Permission denied creating profile during refresh - this is expected with RLS');
            } else if (insertError.message.includes('duplicate key')) {
              console.log('[AuthContext] Profile already exists during refresh (duplicate key)');
            } else {
              console.error('[AuthContext] Error creating profile during refresh:', insertError);
            }
          } else {
            console.log('[AuthContext] Profile created successfully during refresh');
          }
        } catch (insertError) {
          console.error('[AuthContext] Exception creating profile during refresh:', insertError);
        }
      }
    } catch (error) {
      console.error('[AuthContext] Exception in refreshProfile:', error);
      setProfileFetchFailed(true);
      
      // Even on error, create a fallback profile based on email
      if (user) {
        console.log('[AuthContext] Creating fallback profile after refresh error');
        const fallbackProfile = {
          id: user.id,
          role: Boolean(user.email?.includes('admin') || user.email?.endsWith('@sakah.online')) ? 'admin' : 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(fallbackProfile as UserProfile);
      }
    } finally {
      setLoading(false);
      console.log('[AuthContext] Profile refresh complete, loading set to false');
    }
  };

  // Function to check if the current user is an admin
  const checkIsAdmin = () => {
    // First check if we have a profile with admin role
    if (profile?.role === 'admin') return true;
    
    // Fallback to email check if profile fetch failed or role is not set
    if (profileFetchFailed && user?.email) {
      console.log('[AuthContext] Using email fallback for admin check due to profile fetch failure');
      return Boolean(user.email.includes('admin') || user.email.endsWith('@sakah.online'));
    } else if (user?.email) {
      return Boolean(user.email.includes('admin') || user.email.endsWith('@sakah.online'));
    }
    
    return false;
  };

  useEffect(() => {
    console.log('[AuthContext] Initial auth check starting');
    setLoading(true);
    
    // Get the initial session - simplified approach
    const getInitialSession = async () => {
      try {
        console.log('[AuthContext] Fetching session');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[AuthContext] Session fetched:', session ? 'Has session' : 'No session');
        
        // Set session and user immediately
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Determine admin status directly from email - fast path
          const isAdminUser = Boolean(session.user.email?.includes('admin') || session.user.email?.endsWith('@sakah.online'));
          console.log('[AuthContext] Quick admin check from email:', isAdminUser ? 'Is admin' : 'Not admin');
          
          // Set admin status immediately based on email
          setIsAdmin(isAdminUser);
          
          // Create a minimal profile immediately to ensure UI can proceed
          const minimalProfile = {
            id: session.user.id,
            role: isAdminUser ? 'admin' : 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setProfile(minimalProfile as UserProfile);
          
          // Set loading to false immediately to unblock UI
          setLoading(false);
          
          // Fetch complete profile in background - completely non-blocking
          setTimeout(() => {
            fetchProfileInBackground(session.user.id, isAdminUser);
          }, 0);
        } else {
          console.log('[AuthContext] No user in session');
          setProfile(null);
          setIsAdmin(false);
          setLoading(false); // Done loading if no user
        }
      } catch (error) {
        console.error('[AuthContext] Exception in getInitialSession:', error);
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false); // Done loading on error
      }
    };
    
    // Fetch profile in background without blocking the UI
    const fetchProfileInBackground = async (userId: string, isAdminFromEmail: boolean) => {
      // We're already in a non-blocking context, but we'll add extra protection
      // by wrapping in a try/catch that won't affect the UI
      try {
        console.log('[AuthContext] Fetching profile in background for:', userId);
        
        // First try to get user data directly from auth.getUser() - bypasses RLS
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('[AuthContext] Error getting auth user in background:', authError);
          // Don't throw, just return - we already have a minimal profile
          return;
        }
        
        if (!authUser) {
          console.error('[AuthContext] No auth user found in background fetch');
          // Don't throw, just return - we already have a minimal profile
          return;
        }
        
        // Now try to get profile - this might work with our RLS policies
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          // If we get permission denied, we'll create a profile based on auth user
          if (error.message.includes('permission denied')) {
            console.log('[AuthContext] Permission denied for profile, using auth user data');
            // Continue execution - we'll create a profile below
          } else {
            console.log('[AuthContext] Error fetching profile in background:', error);
            // Don't throw, just continue with what we have
          }
        }
        
        // If we successfully got profile data from the database, use it
        if (profileData) {
          console.log('[AuthContext] Profile fetched successfully in background');
          setProfile(profileData);
          // Only update admin status if it's different from email-based check
          if ((profileData.role === 'admin') !== isAdminFromEmail) {
            console.log('[AuthContext] Updating admin status from profile:', profileData.role);
            setIsAdmin(profileData.role === 'admin');
          }
        } else {
          // No profile found or permission denied - create a default profile
          console.log('[AuthContext] Creating default profile from auth user data');
          
          // Create default profile using auth user data
          const defaultProfile = {
            id: userId,
            role: isAdminFromEmail ? 'admin' : 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Add any additional fields from auth user if available
            full_name: authUser.user_metadata?.full_name || '',
            avatar_url: authUser.user_metadata?.avatar_url || ''
          };
          
          // Set the profile in state
          setProfile(defaultProfile as UserProfile);
          
          // Check if profile exists first to avoid duplicate key errors
          try {
            console.log('[AuthContext] Checking if profile exists before creating');
            const { count, error: countError } = await supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .eq('id', userId);
              
            if (countError) {
              console.log('[AuthContext] Error checking profile existence:', countError);
              // Continue anyway and try to create
            } else if (count && count > 0) {
              console.log('[AuthContext] Profile already exists, skipping creation');
              return; // Skip creation if profile exists
            }
            
            // Try to create the profile in the database - but don't block on this
            console.log('[AuthContext] Attempting to create profile in database');
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: userId,
                  role: isAdminFromEmail ? 'admin' : 'user',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  full_name: authUser.user_metadata?.full_name || '',
                  avatar_url: authUser.user_metadata?.avatar_url || ''
                }
              ]);
              
            if (insertError) {
              // If we get permission denied here, it's expected with our RLS policies
              if (insertError.message.includes('permission denied')) {
                console.log('[AuthContext] Permission denied creating profile - this is expected with RLS');
              } else if (insertError.message.includes('duplicate key')) {
                console.log('[AuthContext] Profile already exists (duplicate key)');
              } else {
                console.error('[AuthContext] Error creating profile in background:', insertError);
              }
            } else {
              console.log('[AuthContext] Profile created successfully in background');
            }
          } catch (insertError) {
            console.error('[AuthContext] Exception creating profile in background:', insertError);
          }
        }
      } catch (error) {
        console.error('[AuthContext] Exception in background profile handling:', error);
        setProfileFetchFailed(true);
        
        // Even on error, create a fallback profile based on email
        if (user) {
          console.log('[AuthContext] Creating fallback profile after error');
          const fallbackProfile = {
            id: userId,
            role: isAdminFromEmail ? 'admin' : 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setProfile(fallbackProfile as UserProfile);
        }
      } finally {
        // Always set loading to false when background fetch completes
        setLoading(false);
        console.log('[AuthContext] Background profile fetch complete, loading set to false');
      }
    };
    
    getInitialSession();

    // Listen for auth state changes - simplified approach
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[AuthContext] Auth state change: ${event}`);
        
        // Update session and user immediately
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Quick admin check from email
          const isAdminUser = Boolean(session.user.email?.includes('admin') || session.user.email?.endsWith('@sakah.online'));
          console.log('[AuthContext] Quick admin check on auth change:', isAdminUser ? 'Is admin' : 'Not admin');
          
          // Set admin status immediately based on email
          setIsAdmin(isAdminUser);
          
          // Create a minimal profile immediately to ensure UI can proceed
          const minimalProfile = {
            id: session.user.id,
            role: isAdminUser ? 'admin' : 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setProfile(minimalProfile as UserProfile);
          
          // Set loading to false immediately to unblock UI
          setLoading(false);
          
          // Fetch complete profile in background - completely non-blocking
          setTimeout(() => {
            fetchProfileInBackground(session.user.id, isAdminUser);
          }, 0);
        } else {
          console.log('[AuthContext] No user in session after auth change');
          setProfile(null);
          setIsAdmin(false);
          setLoading(false); // Done loading if no user
        }
      }
    );

    return () => {
      console.log('[AuthContext] Cleaning up auth listener');
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
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
        throw error;
      }
      
      // Explicitly clear all auth state
      console.log('[AuthContext] Explicitly clearing all auth state');
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setProfileFetchFailed(false);
      
      console.log('[AuthContext] Sign out successful');
    } catch (error) {
      console.error('[AuthContext] Exception in signOut:', error);
      // Still clear state even if there was an error
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setProfileFetchFailed(false);
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
    profileFetchFailed,
    signOut,
    checkIsAdmin,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the hook as a named constant to be compatible with HMR
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
