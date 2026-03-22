/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

const buildDisplayName = (authUser, profile) => {
  const metadataName = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name;
  if (profile?.full_name) return profile.full_name;
  if (metadataName) return metadataName;
  if (authUser?.email) return authUser.email.split('@')[0];
  return 'Customer';
};

const buildAvatarUrl = (authUser, profile) => {
  const metadataAvatar =
    authUser?.user_metadata?.avatar_url ||
    authUser?.user_metadata?.picture ||
    authUser?.identities?.[0]?.identity_data?.avatar_url ||
    authUser?.identities?.[0]?.identity_data?.picture;

  return profile?.avatar_url || metadataAvatar || '';
};

const buildPhoneNumber = (authUser, profile) => {
  const metadataPhone =
    authUser?.user_metadata?.phone ||
    authUser?.user_metadata?.phone_number ||
    authUser?.phone ||
    '';

  return profile?.phone || metadataPhone || '';
};

const normalizeUser = (authUser, profile) => {
  if (!authUser) return null;

  return {
    id: authUser.id,
    email: authUser.email || '',
    name: buildDisplayName(authUser, profile),
    role: profile?.role || 'customer',
    avatarUrl: buildAvatarUrl(authUser, profile),
    phone: buildPhoneNumber(authUser, profile),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyProfileState = useCallback((authUser, nextProfile) => {
    setProfile(nextProfile);
    setUser(normalizeUser(authUser, nextProfile));
  }, []);

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }, []);

  const ensureProfile = useCallback(async (authUser) => {
    const payload = {
      id: authUser.id,
      email: authUser.email,
      full_name: buildDisplayName(authUser, null),
    };

    const avatarUrl = buildAvatarUrl(authUser, null);
    const phoneNumber = buildPhoneNumber(authUser, null);
    if (avatarUrl) {
      payload.avatar_url = avatarUrl;
    }
    if (phoneNumber) {
      payload.phone = phoneNumber;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      throw error;
    }
  }, []);

  const syncAuthState = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      await ensureProfile(authUser);
      const nextProfile = await fetchProfile(authUser.id);
      applyProfileState(authUser, nextProfile);
    } catch (error) {
      console.error('Auth sync failed:', error);
      setProfile(null);
      setUser(normalizeUser(authUser, null));
    } finally {
      setLoading(false);
    }
  }, [applyProfileState, ensureProfile, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session bootstrap failed:', error);
      }

      if (!mounted) return;
      await syncAuthState(data.session?.user || null);
    };

    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setLoading(true);
      syncAuthState(session?.user || null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [syncAuthState]);

  const signInCustomer = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUpCustomer = async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async (redirectPath = '/login') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`,
      },
    });

    if (error) throw error;
  };

  const signInAdminWithGoogle = async () => {
    await signInWithGoogle('/admin-login');
  };

  const signInAdmin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const authUser = data.user || data.session?.user;
    if (!authUser) {
      throw new Error('Admin sign in failed.');
    }

    const nextProfile = await fetchProfile(authUser.id);
    if (nextProfile?.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('This account does not have admin access.');
    }

    return data;
  };

  const sendPasswordResetEmail = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  };

  const updatePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const updateProfile = useCallback(
    async ({ fullName, avatarUrl, phone }) => {
      if (!user?.id) {
        throw new Error('You must be logged in to update your profile.');
      }

      const normalizedName = String(fullName || '').trim();
      const normalizedAvatarUrl = String(avatarUrl || '').trim();
      const normalizedPhone = String(phone || '').trim();
      if (!normalizedName) {
        throw new Error('Full name is required.');
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: normalizedName,
          phone: normalizedPhone || null,
          avatar_url: normalizedAvatarUrl || null,
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: normalizedName,
          phone: normalizedPhone || null,
          phone_number: normalizedPhone || null,
          avatar_url: normalizedAvatarUrl || null,
        },
      });

      if (authError) {
        throw authError;
      }

      const { data: authData, error: authUserError } = await supabase.auth.getUser();
      if (authUserError) {
        throw authUserError;
      }

      const authUser = authData.user;
      if (!authUser) {
        throw new Error('Unable to refresh your session after updating the profile.');
      }

      const nextProfile = await fetchProfile(authUser.id);
      applyProfileState(authUser, nextProfile);
      return nextProfile;
    },
    [applyProfileState, fetchProfile, user?.id]
  );

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        signInCustomer,
        signUpCustomer,
        signInWithGoogle,
        signInAdminWithGoogle,
        signInAdmin,
        sendPasswordResetEmail,
        updatePassword,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
