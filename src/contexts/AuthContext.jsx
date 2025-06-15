
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLouvor, setIsLouvor] = useState(false);

  const clearSession = useCallback(() => {
    console.log("AuthContext: Clearing session state.");
    setUser(null);
    setIsAdmin(false);
    setIsLouvor(false);
    setLoading(false);
  }, []);

  const fetchUserProfile = useCallback(async (supabaseUser) => {
    if (!supabaseUser) {
      console.log("AuthContext: fetchUserProfile called with no supabaseUser. Clearing session.");
      clearSession();
      return null;
    }
    console.log("AuthContext: Fetching profile for user:", supabaseUser.id);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('AuthContext: Error fetching profile in fetchUserProfile:', error.code, error.message);
        if (error.code === 'PGRST116' || error.code === '406') { 
          console.warn("AuthContext: Profile not found or not accessible for user:", supabaseUser.id, "Error:", error.message);
          
          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) console.error("AuthContext: Error signing out after profile fetch failure:", signOutError);
          clearSession();
          return null;
        }
        // For other errors, we might still want to clear the session if profile is crucial
        // but for now, let's log and see. User might be partially usable.
        const basicUserDataOnError = {
            id: supabaseUser.id,
            email: supabaseUser.email,
            ...supabaseUser.user_metadata,
        };
        setUser(basicUserDataOnError);
        setIsAdmin(false);
        setIsLouvor(false);
        setLoading(false);
        return basicUserDataOnError; 
      }
      
      const userData = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        ...supabaseUser.user_metadata, 
        ...(profile || {}), 
      };
      
      console.log("AuthContext: Profile fetched successfully for", userData.id);
      setUser(userData);
      setIsAdmin(profile?.role === 'admin');
      const ministriesArray = profile?.ministries || [];
      setIsLouvor(ministriesArray.includes('Louvor') || ministriesArray.includes('louvor'));
      setLoading(false);
      return userData;

    } catch (e) {
      console.error("AuthContext: Exception fetching profile:", e.message);
      const basicUserDataCatch = {
            id: supabaseUser.id,
            email: supabaseUser.email,
            ...supabaseUser.user_metadata,
      };
      setUser(basicUserDataCatch); 
      setIsAdmin(false);
      setIsLouvor(false);
      setLoading(false);
      return basicUserDataCatch;
    }
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;
    console.log("AuthContext: Initializing session and profile check.");
    setLoading(true); 

    const getSessionAndProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (sessionError) {
          console.error("AuthContext: Error getting session:", sessionError.message);
          if (sessionError.message?.includes("Refresh Token Not Found") || sessionError.message?.includes("Invalid Refresh Token") || sessionError.message?.includes("Invalid login credentials")) {
            console.warn("AuthContext: Invalid token or credentials detected. Clearing session and signing out.");
            await supabase.auth.signOut().catch(e => console.error("AuthContext: Error signing out after invalid token/credentials:", e));
            clearSession();
          } else {
            clearSession();
          }
          return;
        }
        
        if (session?.user) {
          console.log("AuthContext: Session found, user ID:", session.user.id);
          await fetchUserProfile(session.user);
        } else {
          console.log("AuthContext: No active session found.");
          clearSession();
        }
      } catch (e) {
        if (isMounted) {
          console.error("AuthContext: Exception in getSessionAndProfile:", e.message);
          clearSession();
        }
      }
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      console.log("AuthContext: Auth state changed. Event:", _event, "Session user ID:", session?.user?.id);
      
      try {
        if (_event === 'SIGNED_OUT' || !session?.user) {
          console.log("AuthContext: User signed out or session ended.");
          clearSession();
        } else if (_event === 'INITIAL_SESSION' || _event === 'TOKEN_REFRESHED' || _event === 'SIGNED_IN' || _event === 'USER_UPDATED') {
          if (session?.user) {
             console.log("AuthContext: Session event requiring profile fetch for:", session.user.id);
            await fetchUserProfile(session.user);
          } else {
            console.log("AuthContext: Session event but no user object. Clearing session.");
            clearSession();
          }
        } else if (_event === 'PASSWORD_RECOVERY') {
            console.log("AuthContext: Password recovery event.");
            setLoading(false); 
        } else if (_event === 'MFA_CHALLENGE_VERIFIED') {
            console.log("AuthContext: MFA Challenge Verified. Fetching profile.");
            if (session?.user) await fetchUserProfile(session.user);
        }
      } catch (e) {
        if (isMounted) {
          console.error("AuthContext: Exception in onAuthStateChange handler:", e.message);
          clearSession();
        }
      }
    });

    return () => {
      console.log("AuthContext: Unsubscribing auth listener.");
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchUserProfile, clearSession]);


  const login = async (email, password) => {
    console.log("AuthContext: Attempting login for", email);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("AuthContext: Login error:", error.message);
        setLoading(false); 
        throw error;
      }
      console.log("AuthContext: Login successful for", email, "User ID:", data?.user?.id);
      return data;
    } catch (error) {
      setLoading(false); 
      throw error;
    }
  };

  const register = async (email, password, firstName, lastName, churchName) => {
    console.log("AuthContext: Attempting registration for", email);
    setLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (signUpError) {
        setLoading(false);
        throw signUpError;
      }
      console.log("AuthContext: Registration successful for", email, "User ID:", signUpData?.user?.id);
      return signUpData;
    } catch (error) {
      console.error("AuthContext: Registration error:", error.message);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    console.log("AuthContext: Attempting logout.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Error logging out:', error.message);
      }
      console.log("AuthContext: Logout successful.");
    } catch (e) {
        console.error('AuthContext: Exception logging out:', e.message);
    } finally {
      clearSession(); 
    }
  };
  
  const updateProfile = async (updates) => {
    if (!user) throw new Error("User not authenticated for profile update.");
    console.log("AuthContext: Attempting profile update for", user.id, "Updates:", updates);
    setLoading(true);
    try {
      const profileUpdates = { ...updates };
      const authUpdates = {};

      if (updates.email && updates.email !== user.email) {
        authUpdates.email = updates.email;
      }
      
      if (updates.first_name || updates.last_name) {
          authUpdates.data = { 
              ...user.user_metadata, 
              ...(updates.first_name && {first_name: updates.first_name}),
              ...(updates.last_name && {last_name: updates.last_name})
          };
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error: userUpdateError } = await supabase.auth.updateUser(authUpdates);
        if (userUpdateError) {
          throw userUpdateError;
        }
      }
      
      const validProfileFields = { ...profileUpdates };
      delete validProfileFields.email; 
      delete validProfileFields.id; 
      
      validProfileFields.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('profiles')
        .update(validProfileFields)
        .eq('id', user.id);

      if (error) {
        throw error;
      }
      
      const { data: { user: currentAuthUser } } = await supabase.auth.getUser();
      if (currentAuthUser) await fetchUserProfile(currentAuthUser); 
      else setLoading(false);
      console.log("AuthContext: Profile update successful for", user.id);
      
    } catch (error) {
      console.error("AuthContext: Profile update error:", error.message);
      setLoading(false); 
      throw error; 
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    updateProfile,
    loading,
    isAdmin,
    isLouvor,
    fetchUserProfile, 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
