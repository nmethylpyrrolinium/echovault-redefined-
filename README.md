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

## Why am I getting a Magic Link instead of a code?
Supabase `signInWithOtp({ email })` uses the Magic Link flow by default, and Email OTP + Magic Link share the same implementation.

If you want users to see a visible 6-digit code in the email, edit the hosted Supabase template here:
**Supabase Dashboard → Auth → Email Templates → Magic Link**

Use this recommended template:

```html
<h2>Your EchoVault Code</h2>
<p>Enter this code to unlock your vault:</p>
<h1>{{ .Token }}</h1>
<p>If you prefer, you can also open this magic link:</p>
<p><a href="{{ .ConfirmationURL }}">Open EchoVault</a></p>
<p>If you did not request this, ignore this email.</p>
```

Notes:
- `{{ .Token }}` is the 6-digit OTP code.
- `{{ .ConfirmationURL }}` is the Magic Link.
- OTP/magic-link requests are rate-limited; wait about 60 seconds before requesting another email.
- Check spam/promotions if the email does not appear.
- Hosted Supabase email templates must be edited in the Supabase Dashboard.
