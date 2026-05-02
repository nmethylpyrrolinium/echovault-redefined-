# EchoVault

EchoVault is a cinematic emotional journaling web app with a local-first vault and optional Supabase authentication/profile sync.

## Live app
- GitHub Pages: https://nmethylpyrrolinium.github.io/echovault.com/

## Supabase setup used by this project
- Project URL: https://phfwaxuyauuyskzruqbk.supabase.co
- Client key: publishable key (public/browser-safe) via `window.ECHOVAULT_CONFIG.SUPABASE_ANON_KEY`
- Avatar storage bucket: `avatars`
- Existing tables:
  - `profiles`
  - `echoes`

## Auth behavior
- App uses Supabase email/password auth (`signUp`, `signInWithPassword`) when config is present.
- If email confirmation is enabled, signup may require checking your inbox before first sign-in.

## Local fallback mode
- If Supabase config is missing/unavailable, EchoVault still works in local mode.
- Echoes remain local-first and are preserved in localStorage.
- Profile fields and avatar can still save locally.
