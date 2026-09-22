# Authentication setup and regression checks

The Google button uses Supabase OAuth redirects with PKCE. Do not replace it
with Google One Tap (`google.accounts.id.prompt`): that optional prompt can be
suppressed by FedCM, browser settings, or cooldown and is not a reliable primary
sign-in button. VITE_GOOGLE_CLIENT_ID is no longer required by the frontend.

## Provider configuration

- Enable Google in Supabase Authentication > Providers with the Google web
  OAuth client ID and secret. Keep the secret server-side only.
- Register the callback URL shown in Supabase in Google Cloud's authorized
  redirect URIs. Configure app branding in Google Auth Platform.
- Set the Supabase Site URL to https://text2handwriting.me and allow the exact
  callback destinations used by the app: /account, /editor, and /onboarding.
  Add localhost and specific preview origins only when needed for testing.
- Keep detectSessionInUrl enabled. The SDK exchanges callback codes itself;
  AuthContext must await getSession rather than exchange the code a second time.

## Before production promotion

1. Run npm run lint and npm run build.
2. From /auth, click Continue with Google: Google's sign-in page should open
   without the One Tap unknown_reason error.
3. Complete sign-in with a test account; verify onboarding/editor redirect and
   reload /account to confirm session persistence.
4. Repeat sign-in from the editor auth modal, then sign out.
5. Check GitHub, email link, cancelled OAuth and expired callback behavior.
6. Test only trusted Cloudflare Pages preview deployments, and keep preview
   origins out of the Supabase allow-list unless they are actively needed.

On 2026-09-22 the production Google, GitHub, and email flows were manually
confirmed end to end. Re-run the checks above whenever provider settings,
redirect URLs, or authentication code changes.
