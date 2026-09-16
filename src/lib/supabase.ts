import { createClient, type SupabaseClient, type User as SupabaseUser } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// Supabase's Edge Functions server adapter requires the newer publishable key.
// Keep the legacy anon-key fallback for older local environments during the
// migration, but prefer the publishable key in production.
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

type GoogleCredentialResponse = { credential?: string };
type GooglePromptNotification = {
    isNotDisplayed: () => boolean;
    isSkippedMoment: () => boolean;
    isDismissedMoment: () => boolean;
    getNotDisplayedReason?: () => string;
    getSkippedReason?: () => string;
    getDismissedReason?: () => string;
};
type GoogleIdentityApi = {
    initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        context?: 'signin' | 'signup' | 'use';
        use_fedcm_for_prompt?: boolean;
    }) => void;
    prompt: (callback?: (notification: GooglePromptNotification) => void) => void;
};

declare global {
    interface Window {
        google?: { accounts?: { id?: GoogleIdentityApi } };
    }
}

export const isSupabaseConfigured = Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
    ? createClient(supabaseUrl!, supabaseAnonKey!, {
          auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true,
              flowType: 'pkce',
          },
      })
    : null;

export interface SignUpMetadata {
    name?: string;
    studentId?: string;
    collegeName?: string;
}

/**
 * Initiates Google OAuth redirect via Supabase.
 * In production or development with valid keys, redirects to Google Accounts.
 */
export async function signInWithGoogleOAuth(redirectTo?: string) {
    if (!supabase) {
        throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const redirect = redirectTo || `${window.location.origin}/account`;
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirect,
        },
    });
    if (error) throw error;
    return data;
}

let googleIdentityScriptPromise: Promise<GoogleIdentityApi> | null = null;

function loadGoogleIdentity(): Promise<GoogleIdentityApi> {
    if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
    if (googleIdentityScriptPromise) return googleIdentityScriptPromise;

    const scriptPromise = new Promise<GoogleIdentityApi>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
        const script = existing || document.createElement('script');
        const onLoad = () => {
            const api = window.google?.accounts?.id;
            if (api) resolve(api);
            else reject(new Error('Google Identity Services did not initialize.'));
        };
        const onError = () => reject(new Error('Google Identity Services could not be loaded.'));

        script.addEventListener('load', onLoad, { once: true });
        script.addEventListener('error', onError, { once: true });
        if (!existing) {
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.dataset.googleIdentity = 'true';
            document.head.appendChild(script);
        }
    }).catch((error) => {
        googleIdentityScriptPromise = null;
        throw error;
    });

    googleIdentityScriptPromise = scriptPromise;
    return scriptPromise;
}

/**
 * Uses Google Identity Services on the site's own origin, then exchanges the
 * returned ID token for a Supabase session. This avoids exposing the Supabase
 * project hostname in Google's account chooser.
 */
export async function signInWithGoogleIdToken() {
    if (!supabase) {
        throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    if (!googleClientId) {
        throw new Error('Google direct sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID.');
    }

    const googleIdentity = await loadGoogleIdentity();
    return new Promise((resolve, reject) => {
        let settled = false;
        const finish = (callback: () => void) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeoutId);
            callback();
        };
        const timeoutId = window.setTimeout(() => {
            finish(() => reject(new Error('Google sign-in timed out. Please try again.')));
        }, 90_000);

        googleIdentity.initialize({
            client_id: googleClientId,
            auto_select: false,
            cancel_on_tap_outside: false,
            context: 'signin',
            use_fedcm_for_prompt: true,
            callback: async ({ credential }) => {
                if (!credential) {
                    finish(() => reject(new Error('Google did not return an identity token.')));
                    return;
                }
                try {
                    const { data, error } = await supabase.auth.signInWithIdToken({
                        provider: 'google',
                        token: credential,
                    });
                    if (error) throw error;
                    finish(() => resolve(data));
                } catch (error) {
                    finish(() => reject(error));
                }
            },
        });

        googleIdentity.prompt((notification) => {
            if (!notification.isNotDisplayed() && !notification.isSkippedMoment() && !notification.isDismissedMoment()) {
                return;
            }
            const reason = notification.getNotDisplayedReason?.()
                || notification.getSkippedReason?.()
                || notification.getDismissedReason?.()
                || 'cancelled';
            finish(() => reject(new Error(`Google sign-in was not completed (${reason}).`)));
        });
    });
}

/**
 * Initiates GitHub OAuth redirect via Supabase.
 */
export async function signInWithGithubOAuth(redirectTo?: string) {
    if (!supabase) {
        throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const redirect = redirectTo || `${window.location.origin}/account`;
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: redirect,
        },
    });
    if (error) throw error;
    return data;
}

/**
 * Sends a passwordless Magic Link / OTP to user's email via Supabase.
 */
export async function signInWithMagicLink(email: string, redirectTo?: string) {
    if (!supabase) {
        throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const redirect = redirectTo || `${window.location.origin}/account`;
    const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
            emailRedirectTo: redirect,
        },
    });
    if (error) throw error;
    return data;
}

/**
 * Signs up a user with email and password via Supabase.
 */
export async function signUpWithEmailPassword(email: string, password: string, metadata?: SignUpMetadata) {
    if (!supabase) {
        throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
            data: {
                full_name: metadata?.name || '',
                studentId: metadata?.studentId || '',
                collegeName: metadata?.collegeName || '',
            },
        },
    });
    if (error) throw error;
    return data;
}

/**
 * Signs in a user with email and password via Supabase.
 */
export async function signInWithEmailPassword(email: string, password: string) {
    if (!supabase) {
        throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
    });
    if (error) throw error;
    return data;
}

/**
 * Sends a password reset email via Supabase.
 */
export async function resetPasswordForEmail(email: string, redirectTo?: string) {
    if (!supabase) {
        throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const redirect = redirectTo || `${window.location.origin}/auth?mode=reset`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirect,
    });
    if (error) throw error;
    return data;
}

/**
 * Updates current user metadata in Supabase Auth.
 */
export async function updateSupabaseUserData(updates: { name?: string; avatar_url?: string; studentId?: string; collegeName?: string }) {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.updateUser({
        data: {
            ...(updates.name ? { full_name: updates.name, name: updates.name } : {}),
            ...(updates.avatar_url ? { avatar_url: updates.avatar_url, picture: updates.avatar_url } : {}),
            ...(updates.studentId ? { studentId: updates.studentId } : {}),
            ...(updates.collegeName ? { collegeName: updates.collegeName } : {}),
        },
    });
    if (error) {
        console.warn('Failed to update Supabase user metadata:', error);
    }
    return data;
}

/**
 * Safely syncs profile into Supabase database 'profiles' table if available.
 */
export async function syncProfileToDatabase(user: SupabaseUser, customData?: { name?: string; avatar_url?: string }) {
    if (!supabase) return null;
    try {
        const username = customData?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'student';
        const avatar = customData?.avatar_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(username)}`;
        
        const { data } = await supabase.from('profiles').upsert({
            id: user.id,
            username: username.slice(0, 50),
            avatar_url: avatar,
            created_at: user.created_at || new Date().toISOString(),
        }, { onConflict: 'id' }).select().single();
        
        return data;
    } catch (e) {
        // Silently tolerate if table RLS restricts writes
        console.debug('Profiles table sync skipped or completed:', e);
        return null;
    }
}

/**
 * Signs out the current Supabase session.
 */
export async function signOutSupabase() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.warn('Supabase sign out error:', error);
    }
}

/**
 * Gets the current active Supabase user if session exists.
 */
export async function getCurrentSupabaseUser(): Promise<SupabaseUser | null> {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
}

export type { SupabaseUser };
