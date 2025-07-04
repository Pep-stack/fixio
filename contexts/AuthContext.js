'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [githubLinked, setGithubLinked] = useState(false);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check if GitHub is linked
      if (session?.user) {
        await checkGithubLink(session.user.id);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          await checkGithubLink(session.user.id);
        } else {
          setGithubLinked(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithGitHub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard-diy`
      }
    });
    
    if (error) {
      console.error('GitHub sign in error:', error);
      throw error;
    }
    
    return data;
  };

  const linkGitHub = async () => {
    const { data, error } = await supabase.auth.link({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard-diy/profile`
      }
    });
    
    if (error) {
      console.error('GitHub link error:', error);
      throw error;
    }
    
    return data;
  };

  const checkGithubLink = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('github_username')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking GitHub link:', error);
        return;
      }
      
      setGithubLinked(!!data?.github_username);
    } catch (error) {
      console.error('Error checking GitHub link:', error);
    }
  };

  const unlinkGitHub = async () => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ github_username: null })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error unlinking GitHub:', error);
        throw error;
      }
      
      setGithubLinked(false);
    } catch (error) {
      console.error('Error unlinking GitHub:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signOut,
    signInWithGitHub,
    linkGitHub,
    unlinkGitHub,
    githubLinked
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 