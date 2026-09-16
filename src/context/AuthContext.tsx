import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
    supabase, 
    isSupabaseConfigured, 
    signInWithGoogleIdToken,
    signInWithGoogleOAuth, 
    signInWithGithubOAuth, 
    signInWithMagicLink, 
    signInWithEmailPassword,
    signUpWithEmailPassword,
    resetPasswordForEmail,
    updateSupabaseUserData,
    syncProfileToDatabase,
    signOutSupabase 
} from '../lib/supabase';
import type { SupabaseUser } from '../lib/supabase';
import { useToast } from '../hooks/useToast';

export interface UserProfile {
    id: string;
    name: string;
    given_name: string;
    family_name: string;
    email: string;
    picture: string;
    authProvider: 'google' | 'github' | 'student' | 'email';
    studentId?: string;
    collegeName?: string;
    savedDocsCount: number;
    cloudBackupEnabled: boolean;
    isPro?: boolean;
    createdAt: string;
}

export type User = UserProfile;

export interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isSupabaseConfigured: boolean;
    isLoading: boolean;
    login: (customProfile?: Partial<UserProfile>) => void;
    loginWithGoogle: (redirectTo?: string) => Promise<{ success: boolean; redirected?: boolean; error?: string }>;
    loginWithGithub: (redirectTo?: string) => Promise<{ success: boolean; redirected?: boolean; error?: string }>;
    loginWithStudentId: (name: string, studentId: string, college: string) => Promise<void>;
    loginWithEmail: (email: string, redirectTo?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
    loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUpWithPassword: (
        email: string, 
        password: string, 
        metadata?: { name?: string; studentId?: string; collegeName?: string }
    ) => Promise<{ success: boolean; needsEmailConfirmation?: boolean; error?: string }>;
    resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
    logout: () => Promise<void>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
    incrementSavedDocs: () => void;
    isAuthModalOpen: boolean;
    setAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUserToProfile(su: SupabaseUser): UserProfile {
    const meta = su.user_metadata || {};
    const fullName = meta.full_name || meta.name || meta.user_name || su.email?.split('@')[0] || 'text2handwriting.me Scholar';
    const parts = fullName.trim().split(' ');
    const given = parts[0] || 'Scholar';
    const rest = parts.slice(1).join(' ');

    const rawProvider = (su.app_metadata?.provider as string) || 'email';
    const authProvider: 'google' | 'github' | 'student' | 'email' = 
        rawProvider === 'google' ? 'google' :
        rawProvider === 'github' ? 'github' : 'email';

    const avatar = meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(fullName)}`;

    return {
        id: su.id,
        name: fullName,
        given_name: given,
        family_name: rest,
        email: su.email || '',
        picture: avatar,
        authProvider,
        studentId: meta.studentId || `ID-${su.id.slice(0, 6).toUpperCase()}`,
        collegeName: meta.collegeName || 'Student Scholar',
        savedDocsCount: 3,
        cloudBackupEnabled: true,
            isPro: false,
        createdAt: su.created_at || new Date().toISOString(),
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { addToast } = useToast();
    const [user, setUser] = useState<UserProfile | null>(() => {
        if (typeof window === 'undefined') return null;
        try {
            const stored = localStorage.getItem('text2handwriting_user');
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    id: parsed.id || `user-${Date.now()}`,
                    name: parsed.name || 'Student Scholar',
                    given_name: parsed.given_name || parsed.name?.split(' ')[0] || 'Scholar',
                    family_name: parsed.family_name || parsed.name?.split(' ').slice(1).join(' ') || '',
                    email: parsed.email || 'scholar@university.edu',
                    picture: parsed.picture || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(parsed.name || 'Scholar')}`,
                    authProvider: parsed.authProvider || 'student',
                    studentId: parsed.studentId || 'STU-2026',
                    collegeName: parsed.collegeName || 'University Institute',
                    savedDocsCount: parsed.savedDocsCount ?? 4,
                    cloudBackupEnabled: parsed.cloudBackupEnabled ?? true,
                    createdAt: parsed.createdAt || new Date().toISOString(),
                };
            }
        } catch (e) {
            console.warn('Failed to parse stored user profile:', e);
        }
        return null;
    });

    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(() => {
        const hasCode = typeof window !== 'undefined' && (
            new URLSearchParams(window.location.search).has('code') ||
            window.location.hash.includes('access_token')
        );
        return Boolean((isSupabaseConfigured && supabase) || hasCode);
    });

    const persistUser = useCallback((updated: UserProfile | null) => {
        setUser(updated);
        if (updated) {
            try {
                localStorage.setItem('text2handwriting_user', JSON.stringify(updated));
            } catch (err) {
                console.warn('Failed to write user to localStorage:', err);
            }
        } else {
            localStorage.removeItem('text2handwriting_user');
            localStorage.removeItem('papertrail_user');
        }
    }, []);

    // Sync with real Supabase Auth session on mount and listen to state changes
    useEffect(() => {
        if (!isSupabaseConfigured || !supabase) {
            return;
        }

        let isMounted = true;

        // Detect if the URL contains OAuth/PKCE authorization callback parameters
        const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const code = searchParams?.get('code');
        const authError = searchParams?.get('error');
        const authErrorDesc = searchParams?.get('error_description');
        const hasHashToken = typeof window !== 'undefined' && window.location.hash.includes('access_token');
        const hasIncomingAuth = Boolean(code || hasHashToken);

        if (authError || authErrorDesc) {
            // Toast the full error so we can debug it
            const fullError = `${authError || 'Error'}: ${authErrorDesc || 'Unknown'}`.replace(/\+/g, ' ');
            console.warn('OAuth redirect error from provider:', fullError);
            addToast(fullError, 'error');
            try {
                const cleanUrl = new URL(window.location.href);
                cleanUrl.searchParams.delete('error');
                cleanUrl.searchParams.delete('error_description');
                cleanUrl.searchParams.delete('error_code');
                window.history.replaceState({}, document.title, cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : ''));
            } catch {
                // ignore
            }
        }

        // Safety fallback timer: ensure UI unblocks even on network timeouts
        const safetyTimer = setTimeout(() => {
            if (isMounted) setIsLoading(false);
        }, 6000);

        // 1. If we have a PKCE code in the URL, explicitly exchange it before unblocking route guards
        if (code) {
            supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
                if (!isMounted) return;
                if (error) {
                    console.error('Supabase code exchange error:', error.message);
                } else if (data?.session?.user) {
                    const profile = mapSupabaseUserToProfile(data.session.user);
                    persistUser(profile);
                    (async () => {
    const dbProfile = await syncProfileToDatabase(data.session!.user);
    if (dbProfile?.is_pro) {
        profile.isPro = true;
        persistUser(profile);
    }
})();

                    // If landing on root or auth page after OAuth, redirect into the app
                    if (window.location.pathname === '/' || window.location.pathname === '/auth') {
                        const isNew = !localStorage.getItem('text2handwriting_onboarding_done');
                        const target = isNew ? '/onboarding' : '/editor';
                        window.location.replace(target);
                        return;
                    }
                }

                // Clean the code and state from the URL without triggering a React Router route change
                try {
                    const cleanUrl = new URL(window.location.href);
                    cleanUrl.searchParams.delete('code');
                    cleanUrl.searchParams.delete('state');
                    window.history.replaceState({}, document.title, cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : ''));
                } catch {
                    // ignore
                }

                setIsLoading(false);
            }).catch((err) => {
                console.error('Supabase exchangeCodeForSession failed:', err);
                if (isMounted) setIsLoading(false);
            });
        } else if (!hasIncomingAuth) {
            // 2. Normal session check on mount when not an incoming OAuth callback
            supabase.auth.getSession().then(({ data: { session }, error }) => {
                if (!isMounted) return;
                if (error) {
                    console.warn('Supabase getSession error:', error.message);
                }
                if (session?.user) {
                    const profile = mapSupabaseUserToProfile(session.user);
                    persistUser(profile);
                    (async () => {
    const dbProfile = await syncProfileToDatabase(session.user);
    if (dbProfile?.is_pro) {
        profile.isPro = true;
        persistUser(profile);
    }
})();
                } else if (!error) {
                    // A cached display profile is not an authenticated payment
                    // session. Clear it so checkout routes users through login
                    // instead of allowing a request that will inevitably 401.
                    persistUser(null);
                }
                setIsLoading(false);
            }).catch((err) => {
                console.warn('Supabase auth initialization failed:', err);
                if (isMounted) setIsLoading(false);
            });
        }

        // 3. Listen for OAuth callbacks, Magic link tokens, sign ins, sign outs
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!isMounted) return;
            if (session?.user) {
                const profile = mapSupabaseUserToProfile(session.user);
                persistUser(profile);
                (async () => {
    const dbProfile = await syncProfileToDatabase(session.user);
    if (dbProfile?.is_pro) {
        profile.isPro = true;
        persistUser(profile);
    }
})();
            } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
                persistUser(null);
            }
            setIsLoading(false);
        });

        return () => {
            isMounted = false;
            clearTimeout(safetyTimer);
            subscription.unsubscribe();
        };
    }, [persistUser, addToast]);

    const login = useCallback((customProfile?: Partial<UserProfile>) => {
        const defaultProfile: UserProfile = {
            id: `usr-${Date.now()}`,
            name: customProfile?.name || 'Student Scholar',
            given_name: customProfile?.given_name || customProfile?.name?.split(' ')[0] || 'Student',
            family_name: customProfile?.family_name || '',
            email: customProfile?.email || 'scholar@university.edu',
            picture: customProfile?.picture || 'https://api.dicebear.com/7.x/notionists/svg?seed=scholar',
            authProvider: customProfile?.authProvider || 'student',
            studentId: customProfile?.studentId || '500123456',
            collegeName: customProfile?.collegeName || 'University Institute',
            savedDocsCount: customProfile?.savedDocsCount ?? 3,
            cloudBackupEnabled: true,
            isPro: false,
            createdAt: new Date().toISOString(),
        };

        persistUser({ ...defaultProfile, ...customProfile });
        setAuthModalOpen(false);
    }, [persistUser]);

    const loginWithGoogle = useCallback(async (redirectTo?: string) => {
        setIsLoading(true);

        if (isSupabaseConfigured && supabase) {
            try {
                if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
                    await signInWithGoogleIdToken();
                    setIsLoading(false);
                    setAuthModalOpen(false);
                    return { success: true, redirected: false };
                }

                const dest = redirectTo || `${window.location.origin}/account`;
                await signInWithGoogleOAuth(dest);
                return { success: true, redirected: true };
            } catch (err: unknown) {
                console.error('Real Google OAuth failed:', err);
                const rawMsg = err instanceof Error ? err.message : 'Google OAuth failed';
                let message = rawMsg;
                if (rawMsg.toLowerCase().includes('provider is not enabled') || rawMsg.toLowerCase().includes('unsupported provider') || rawMsg.toLowerCase().includes('validation_failed')) {
                    message = 'Google OAuth provider is not enabled in your Supabase project (rebwoyqwxnoqmxvumzjf). Please enable Google in Supabase Dashboard → Authentication → Providers, or sign in instantly with Student ID / Email.';
                }
                setIsLoading(false);
                return { success: false, error: message };
            }
        }

        // Demo fallback if Supabase not configured
        await new Promise((r) => setTimeout(r, 300));
        const name = 'Aarav Sharma';
        const email = 'student.scholar@gmail.com';
        const [given, ...rest] = name.split(' ');

        const profile: UserProfile = {
            id: `goog-${Date.now()}`,
            name,
            given_name: given,
            family_name: rest.join(' '),
            email,
            picture: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`,
            authProvider: 'google',
            studentId: 'STU-2026-CS',
            collegeName: 'Institute of Engineering',
            savedDocsCount: 5,
            cloudBackupEnabled: true,
            isPro: false,
            createdAt: new Date().toISOString(),
        };

        persistUser(profile);
        setIsLoading(false);
        setAuthModalOpen(false);
        return { success: true };
    }, [persistUser]);

    const loginWithGithub = useCallback(async (redirectTo?: string) => {
        setIsLoading(true);

        if (isSupabaseConfigured && supabase) {
            try {
                const dest = redirectTo || `${window.location.origin}/account`;
                await signInWithGithubOAuth(dest);
                return { success: true, redirected: true };
            } catch (err: unknown) {
                console.error('Real GitHub OAuth failed:', err);
                const rawMsg = err instanceof Error ? err.message : 'GitHub OAuth failed';
                let message = rawMsg;
                if (rawMsg.toLowerCase().includes('provider is not enabled') || rawMsg.toLowerCase().includes('unsupported provider') || rawMsg.toLowerCase().includes('validation_failed')) {
                    message = 'GitHub OAuth provider is not enabled in your Supabase project (rebwoyqwxnoqmxvumzjf). Please enable GitHub in Supabase Dashboard → Authentication → Providers, or sign in instantly with Student ID / Email.';
                }
                setIsLoading(false);
                return { success: false, error: message };
            }
        }

        // Demo fallback
        await new Promise((r) => setTimeout(r, 300));
        const ghUser = 'student-developer';
        const profile: UserProfile = {
            id: `gh-${Date.now()}`,
            name: ghUser,
            given_name: ghUser,
            family_name: '',
            email: `${ghUser.toLowerCase()}@users.noreply.github.com`,
            picture: `https://github.com/${ghUser}.png`,
            authProvider: 'github',
            studentId: 'DEV-STUDENT',
            collegeName: 'School of Computer Science',
            savedDocsCount: 7,
            cloudBackupEnabled: true,
            isPro: false,
            createdAt: new Date().toISOString(),
        };

        persistUser(profile);
        setIsLoading(false);
        setAuthModalOpen(false);
        return { success: true };
    }, [persistUser]);

    const loginWithEmail = useCallback(async (email: string, redirectTo?: string) => {
        setIsLoading(true);

        if (isSupabaseConfigured && supabase) {
            try {
                const dest = redirectTo || `${window.location.origin}/account`;
                await signInWithMagicLink(email, dest);
                setIsLoading(false);
                return { 
                    success: true, 
                    message: `Magic link sent to ${email}! Check your inbox and click the link to log in.` 
                };
            } catch (err: unknown) {
                console.warn('Supabase magic link error:', err);
                const message = err instanceof Error ? err.message : 'Failed to send magic link';
                setIsLoading(false);
                return { success: false, error: message };
            }
        }

        // Instant Student Demo Mode fallback
        await new Promise((r) => setTimeout(r, 400));
        const userEmail = email.trim() || 'student@university.edu';
        const defaultName = userEmail.split('@')[0].replace(/[._-]/g, ' ');
        const capitalized = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
        const [given, ...rest] = capitalized.split(' ');

        const profile: UserProfile = {
            id: `mail-${Date.now()}`,
            name: capitalized,
            given_name: given,
            family_name: rest.join(' '),
            email: userEmail,
            picture: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userEmail)}`,
            authProvider: 'email',
            studentId: 'STU-' + Math.floor(100000 + Math.random() * 900000),
            collegeName: 'University Scholar',
            savedDocsCount: 1,
            cloudBackupEnabled: true,
            isPro: false,
            createdAt: new Date().toISOString(),
        };

        persistUser(profile);
        setIsLoading(false);
        setAuthModalOpen(false);
        return { success: true };
    }, [persistUser]);

    const loginWithPassword = useCallback(async (email: string, password: string) => {
        setIsLoading(true);

        if (isSupabaseConfigured && supabase) {
            try {
                const data = await signInWithEmailPassword(email, password);
                if (data?.user) {
                    const profile = mapSupabaseUserToProfile(data.user);
                    persistUser(profile);
                    (async () => {
    const dbProfile = await syncProfileToDatabase(data.user);
    if (dbProfile?.is_pro) {
        profile.isPro = true;
        persistUser(profile);
    }
})();
                }
                setIsLoading(false);
                setAuthModalOpen(false);
                return { success: true };
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Invalid login credentials';
                setIsLoading(false);
                return { success: false, error: message };
            }
        }

        // Instant Demo fallback
        await new Promise((r) => setTimeout(r, 300));
        const userEmail = email.trim();
        const name = userEmail.split('@')[0];
        const profile: UserProfile = {
            id: `demo-${Date.now()}`,
            name,
            given_name: name,
            family_name: '',
            email: userEmail,
            picture: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`,
            authProvider: 'email',
            studentId: 'STU-' + Math.floor(100000 + Math.random() * 900000),
            collegeName: 'University Scholar',
            savedDocsCount: 1,
            cloudBackupEnabled: true,
            isPro: false,
            createdAt: new Date().toISOString(),
        };
        persistUser(profile);
        setIsLoading(false);
        setAuthModalOpen(false);
        return { success: true };
    }, [persistUser]);

    const signUpWithPassword = useCallback(async (
        email: string, 
        password: string, 
        metadata?: { name?: string; studentId?: string; collegeName?: string }
    ) => {
        setIsLoading(true);

        if (isSupabaseConfigured && supabase) {
            try {
                const data = await signUpWithEmailPassword(email, password, metadata);
                
                if (data?.session?.user) {
                    const profile = mapSupabaseUserToProfile(data.session.user);
                    persistUser(profile);
                    (async () => {
    const dbProfile = await syncProfileToDatabase(data.session!.user, { name: metadata?.name });
    if (dbProfile?.is_pro) {
        profile.isPro = true;
        persistUser(profile);
    }
})();
                    setIsLoading(false);
                    setAuthModalOpen(false);
                    return { success: true, needsEmailConfirmation: false };
                }

                setIsLoading(false);
                return { 
                    success: true, 
                    needsEmailConfirmation: true, 
                };
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to create account';
                setIsLoading(false);
                return { success: false, error: message };
            }
        }

        // Demo fallback
        await new Promise((r) => setTimeout(r, 300));
        const cleanName = metadata?.name || email.split('@')[0];
        const profile: UserProfile = {
            id: `demo-${Date.now()}`,
            name: cleanName,
            given_name: cleanName.split(' ')[0] || cleanName,
            family_name: cleanName.split(' ').slice(1).join(' '),
            email: email.trim(),
            picture: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(cleanName)}`,
            authProvider: 'email',
            studentId: metadata?.studentId || 'STU-' + Math.floor(100000 + Math.random() * 900000),
            collegeName: metadata?.collegeName || 'University Scholar',
            savedDocsCount: 0,
            cloudBackupEnabled: true,
            isPro: false,
            createdAt: new Date().toISOString(),
        };
        persistUser(profile);
        setIsLoading(false);
        setAuthModalOpen(false);
        return { success: true, needsEmailConfirmation: false };
    }, [persistUser]);

    const resetPassword = useCallback(async (email: string) => {
        if (isSupabaseConfigured && supabase) {
            try {
                await resetPasswordForEmail(email);
                return { success: true, message: `Password reset email sent to ${email}!` };
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to send reset email';
                return { success: false, error: message };
            }
        }
        return { success: true, message: `Password reset email sent to ${email}!` };
    }, []);

    const loginWithStudentId = useCallback(async (name: string, studentId: string, college: string) => {
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 350));

        const trimmedName = name.trim() || 'Student Scholar';
        const [given, ...rest] = trimmedName.split(' ');

        const cleanCollege = college.trim() || 'University Institute';
        const cleanId = studentId.trim() || 'STU-700192';

        const profile: UserProfile = {
            id: `stu-${Date.now()}`,
            name: trimmedName,
            given_name: given,
            family_name: rest.join(' '),
            email: `${cleanId.toLowerCase().replace(/[^a-z0-9]/g, '')}@${cleanCollege.toLowerCase().replace(/[^a-z0-9]/g, '') || 'university'}.edu`,
            picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanId)}`,
            authProvider: 'student',
            studentId: cleanId,
            collegeName: cleanCollege,
            savedDocsCount: 2,
            cloudBackupEnabled: true,
            isPro: false,
            createdAt: new Date().toISOString(),
        };

        persistUser(profile);
        setIsLoading(false);
        setAuthModalOpen(false);
    }, [persistUser]);

    const logout = useCallback(async () => {
        setIsLoading(true);
        if (isSupabaseConfigured) {
            try {
                await signOutSupabase();
            } catch (e) {
                console.warn('Supabase signout failed:', e);
            }
        }
        persistUser(null);
        setIsLoading(false);
    }, [persistUser]);

    const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
        setUser((prev) => {
            if (!prev) return null;
            const updated = { ...prev, ...updates };
            try {
                localStorage.setItem('text2handwriting_user', JSON.stringify(updated));
            } catch (e) {
                console.warn('Failed to update local user:', e);
            }
            return updated;
        });

        // Sync with Supabase Auth metadata if logged in
        if (isSupabaseConfigured && supabase) {
            try {
                await updateSupabaseUserData({
                    name: updates.name,
                    avatar_url: updates.picture,
                    studentId: updates.studentId,
                    collegeName: updates.collegeName,
                });
            } catch (e) {
                console.warn('Could not sync profile to Supabase Auth:', e);
            }
        }
    }, []);

    const incrementSavedDocs = useCallback(() => {
        setUser((prev) => {
            if (!prev) return null;
            const updated = { ...prev, savedDocsCount: (prev.savedDocsCount || 0) + 1 };
            try {
                localStorage.setItem('text2handwriting_user', JSON.stringify(updated));
            } catch (e) {
                console.warn('Failed to update local user savedDocsCount:', e);
            }
            return updated;
        });
    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated: !!user, 
            isSupabaseConfigured,
            isLoading,
            login, 
            loginWithGoogle,
            loginWithGithub,
            loginWithStudentId,
            loginWithEmail,
            loginWithPassword,
            signUpWithPassword,
            resetPassword,
            logout,
            updateUserProfile,
            incrementSavedDocs,
            isAuthModalOpen, 
            setAuthModalOpen, 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
