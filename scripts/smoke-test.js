const fs = require('fs');

const failures = [];

['index.html','styles.css','script.js','README.md','manifest.json','sw.js','wrapped-cinematic-module.js'].forEach((f) => {
  if (!fs.existsSync(f)) failures.push(`Missing required file: ${f}`);
});

const index = fs.readFileSync('index.html','utf8');
const script = fs.readFileSync('script.js','utf8');
const style = fs.readFileSync('styles.css','utf8');
const readme = fs.readFileSync('README.md','utf8');
const pkg = fs.existsSync('package.json')
  ? JSON.parse(fs.readFileSync('package.json','utf8'))
  : { dependencies:{}, devDependencies:{} };

// Phase 1 — Supabase/Auth/Profile/PWA checks
if (!index.includes('window.ECHOVAULT_CONFIG')) failures.push('index.html missing window.ECHOVAULT_CONFIG');
if (!index.includes('https://phfwaxuyauuyskzruqbk.supabase.co')) failures.push('index.html missing Supabase project URL');
if (!index.includes('sb_publishable_')) failures.push('index.html missing publishable key prefix');
if (!index.includes('avatars')) failures.push('index.html missing avatars bucket');

if (!script.includes('avatar-file-input')) failures.push('script.js missing avatar-file-input reference');
if (script.includes("getElementById('avatar-input')") || script.includes('"avatar-input"')) {
  failures.push('script.js still relies on avatar-input');
}
if (!script.includes('signInWithPassword')) failures.push('script.js missing signInWithPassword');
if (!script.includes('signUp')) failures.push('script.js missing signUp');
if (!script.includes('signInWithOtp')) failures.push('script.js missing signInWithOtp');
if (!script.includes('verifyOtp')) failures.push('script.js missing verifyOtp');
if (!script.includes('emailRedirectTo')) failures.push('script.js missing emailRedirectTo');
if (!script.includes('auth-local-btn')) failures.push('script.js missing auth-local-btn for Continue Locally');
if (!script.includes('getAuthRedirectUrl')) failures.push('script.js missing getAuthRedirectUrl helper');
if (!script.includes('https://nmethylpyrrolinium.github.io/echovault.com/')) {
  failures.push('script.js missing production auth redirect URL');
}
if (!script.toLowerCase().includes('code or magic link')) {
  failures.push('script.js missing code-or-magic-link guidance text');
}
if (script.includes('profile.display_name = legacy;') && script.includes('write(profile);')) {
  failures.push('ProfileStore.read() still calls write(profile) during legacy migration');
}
if (!(script.includes('await Auth.init();') && script.indexOf('await Auth.init();') < script.indexOf('Login.init();'))) {
  failures.push('Auth.init is not awaited/chained before Login.init');
}

if (!script.includes("from('profiles')") && !script.includes('from("profiles")')) {
  failures.push('script.js missing profiles integration');
}
if (!script.includes('.storage.from(')) failures.push('script.js missing avatar storage upload logic');

if (!style.includes('#user-chip') || !style.includes('@media(max-width:768px)')) {
  failures.push('styles.css missing responsive user-chip handling');
}
if (!style.includes('env(safe-area-inset-top')) failures.push('styles.css missing safe-area top handling');
if (!style.includes('env(safe-area-inset-bottom')) failures.push('styles.css missing safe-area bottom handling');
if (!(style.includes('display-mode: standalone') || style.includes('is-standalone'))) {
  failures.push('styles.css missing standalone display-mode handling');
}

if (/id="avatar-file-input"[^>]*display\s*:\s*none/i.test(index)) {
  failures.push('avatar-file-input still uses display:none');
}

if (!readme.includes('phfwaxuyauuyskzruqbk.supabase.co') || !readme.includes('local mode')) {
  failures.push('README missing Supabase/local fallback notes');
}
if (!readme.includes('{{ .Token }}')) failures.push('README missing {{ .Token }} instructions');
if (!readme.includes('{{ .ConfirmationURL }}')) failures.push('README missing {{ .ConfirmationURL }} instructions');
if (!readme.includes('Magic Link')) failures.push('README missing Magic Link wording');
if (!readme.includes('Site URL')) failures.push('README missing Site URL setup instructions');
if (!readme.includes('redirect URL')) failures.push('README missing redirect URL setup instructions');
if (!readme.includes('Email OTP')) failures.push('README missing Email OTP wording');
if (!readme.includes('60 seconds')) failures.push('README missing 60 seconds rate limit note');

// PWA checks
if (!script.includes('beforeinstallprompt')) failures.push('script.js missing beforeinstallprompt handling');
if (!script.includes('pwa-dismiss-btn')) failures.push('script.js missing dismiss button wiring');
if (!(script.includes('serviceWorker.register') || index.includes('serviceWorker.register'))) failures.push('script.js or index missing service worker registration');

// Phase 2 — Emotional intelligence checks
if (!script.includes('PatternEngine')) failures.push('script.js missing PatternEngine');
if (!script.includes('ArchetypeEngine')) failures.push('script.js missing ArchetypeEngine');
if (!script.includes('ReceiptRenderer')) failures.push('script.js missing ReceiptRenderer');
if (!script.includes('averageIntensity')) failures.push('PatternEngine missing averageIntensity');
if (!script.includes('averageSilence')) failures.push('PatternEngine missing averageSilence');
if (!script.includes('volatilityScore')) failures.push('PatternEngine missing volatilityScore');
if (!script.includes('Wrapped') || !script.includes('PatternEngine')) {
  failures.push('Wrapped does not appear to reference PatternEngine');
}
if (!script.includes('populateArchetype') || !script.includes('ArchetypeEngine')) {
  failures.push('profile/settings does not appear to use ArchetypeEngine');
}
if (!script.includes('SOUNDPRINTS')) failures.push('Soundprint data missing');
if (!script.includes('echovault_echoes_v2')) failures.push('localStorage echo key missing');


// Phase 4 — Emotional museum checks
['RelicEngine','WeatherMap','ArtifactArchive','CinematicCardRenderer','CoordinateEngine','Emotional Museum','Void Lantern','Storm Jar','Soundprint Wall','Archetype Hall','echovault_artifacts_v1'].forEach((marker)=>{ if(!script.includes(marker) && !index.includes(marker)) failures.push(`Missing Phase 4 marker: ${marker}`);});
if (script.toLowerCase().includes('chatbot') || script.toLowerCase().includes('chat ai')) failures.push('Chatbot module detected but forbidden in phase 4');

// Phase 3B — runtime wiring hotfix checks
if (!script.includes('const MigrationFlow = (() => {')) failures.push('script.js missing MigrationFlow module');
if (!script.includes('return { init, close };')) failures.push('MigrationFlow missing init/close exports');
if (!script.includes('MigrationFlow.init();')) failures.push('script.js missing MigrationFlow.init startup call');

const iifeCloseIndex = script.lastIndexOf('})();');
['migration-sync-btn','migration-keep-btn','migration-export-btn'].forEach((id) => {
  const idx = script.indexOf(id);
  if (idx === -1) failures.push(`script.js missing ${id}`);
  if (idx > iifeCloseIndex) failures.push(`${id} handler appears after final IIFE closure`);
});

if (!script.includes('function refreshEchoDependentUI() {')) failures.push('script.js missing refreshEchoDependentUI helper');
if (!script.includes('refreshEchoDependentUI();')) failures.push('script.js missing refreshEchoDependentUI usage');
if (!script.includes("document.getElementById('import-merge-btn')") || !script.includes('refreshEchoDependentUI();')) {
  failures.push('ImportFlow does not appear to refresh dependent UI');
}
if (!script.includes('const VaultPulse = (() => {')) failures.push('script.js missing VaultPulse module');
if (!(script.includes('const EchoSync = (() => {') || script.includes('syncLocalToCloud()'))) {
  failures.push('script.js missing EchoSync/syncLocalToCloud placeholder');
}

if (!script.includes('result?.ok')) failures.push('migration sync flow missing ok-check before marking synced');
if (!script.includes('Sign in to sync. Your local vault is still safe.')) {
  failures.push('migration sync flow missing local safety sign-in toast');
}
if (script.includes(".then(() => VaultPulse.set('synced', 'Vault Synced'))")) {
  failures.push('migration sync flow still unconditionally marks synced in promise chain');
}
if (!script.includes('auth-local-btn')) failures.push('script.js missing auth-local-btn');
if (!script.includes('signInWithOtp')) failures.push('script.js missing signInWithOtp');
if (!script.includes('beforeinstallprompt')) failures.push('script.js missing beforeinstallprompt');
if (!script.includes('echovault_echoes_v2')) failures.push('script.js missing echovault_echoes_v2 key');

// Keep dependency footprint small
const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
if (Object.keys(deps).some((d) => ['react','vue','angular','next','svelte'].includes(d))) {
  failures.push('Heavy framework dependency added unexpectedly');
}

if (failures.length) {
  console.error('Smoke test failed:');
  failures.forEach((f) => console.error('- ' + f));
  process.exit(1);
}

console.log('Smoke test passed.');