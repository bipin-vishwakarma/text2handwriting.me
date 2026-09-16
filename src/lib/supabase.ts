import { createClient, type SupabaseClient, type User as SupabaseUser } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// Supabase's Edge Functions server adapter requires the newer publishable key.
// Keep the legacy anon-key fallback for older local environments during the
// migration, but prefer the publishable key in production.
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

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
