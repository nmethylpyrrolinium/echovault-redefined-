# EchoVault

EchoVault is a cinematic emotional journaling web app with a local-first vault and optional Supabase authentication/profile sync

## Live app
- GitHub Pages: https://nmethylpyrrolinium.github.io/echovault.com/

## Supabase setup used by this project
- Project URL: https://phfwaxuyauuyskzruqbk.supabase.co
- Client key: publishable key (public/browser-safe) via `window.ECHOVAULT_CONFIG.SUPABASE_ANON_KEY`
- Avatar storage bucket: `avatars`
- Existing tables:
  - `profiles`
  - `echoes`
- Auth URL configuration:
  - Site URL: `https://nmethylpyrrolinium.github.io/echovault.com/`
  - Additional redirect URLs:
    - `https://nmethylpyrrolinium.github.io/echovault.com/`
    - `http://localhost:3000/`
    - `http://localhost:5173/`

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
- `{{ .Token }}` is the visible 6-digit Email OTP code when your Supabase project/template sends one.
- `{{ .ConfirmationURL }}` is the Magic Link.
- OTP/magic-link requests are rate-limited; wait about 60 seconds before requesting another email.
- Check spam/promotions if the email does not appear.
- Hosted Supabase email templates must be edited in the Supabase Dashboard.

## Special Access codes

EchoVault includes a local-first Special Access system. This is not a payment, subscription, pricing, or public purchase flow. Core vault ownership stays free: existing echoes, echo creation, local mode, auth, export, import, basic profile, timeline/universe, Mood Receipt, Echo Soundprint, Inner Conflict, Crash Report, Emotion DNA, Shatter Softly, and Basic Wrapped are never gated. Void Lantern and Storm Jar are Special Access rituals.

Access state is stored under `echovault_access_v1` and can be unlocked with manually granted codes. Production code redemption uses the Supabase `redeem_premium_code` RPC when a user is logged in, while local mode validates starter codes without exposing them in the UI.
