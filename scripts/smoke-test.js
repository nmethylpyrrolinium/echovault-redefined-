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
const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

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
if (!script.includes('Email sent — use the code if shown, or open the magic link.')) {
  failures.push('script.js missing exact code/magic-link sent guidance text');
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


if (!(script.includes('APP_VERSION') || fs.readFileSync('sw.js','utf8').includes('APP_VERSION'))) failures.push('APP_VERSION missing in script.js/sw.js');
if (fs.readFileSync('sw.js','utf8').includes("echovault-v3")) failures.push('sw.js still uses old echovault-v3 cache name');
if (!script.includes('AppEnvironment')) failures.push('script.js missing AppEnvironment');
if (!(style.includes('is-standalone') || style.includes('display-mode: standalone'))) failures.push('standalone CSS handling missing');
if (!style.includes('.nav-links{overflow-x:auto') && !style.includes('overflow-x: auto')) failures.push('nav links overflow-x auto missing');
if (!style.includes('#user-chip .chip-sync-label{display:none')) failures.push('mobile user chip sync label hide missing');
if (!(style.includes('auto-fit') && style.includes('min(260px'))) failures.push('fun-grid responsive auto-fit missing');
if (!(style.includes('.cinematic-modal') && style.includes('max-height') && style.includes('overflow-y:auto'))) failures.push('cinematic/fun modal max-height overflow missing');
if (!index.includes('Refresh App Cache') && !script.includes('refresh-app-cache-btn')) failures.push('Refresh App Cache control missing');


// Phase 1 game/community foundation checks
const sw = fs.readFileSync('sw.js','utf8');
if (!script.includes("receipt-failsafe-rendering")) failures.push('APP_VERSION not updated to receipt-failsafe-rendering');
if (!script.includes('echovault-v7-receipt-failsafe') && !sw.includes('echovault-v7-receipt-failsafe')) failures.push('Phase 2 cache marker missing');
if (!script.includes("phase-2-relic-crafting-avatar-progression")) failures.push('APP_VERSION not updated to phase-2-relic-crafting-avatar-progression');
if (!script.includes('echovault-v6-phase-2-game-loop') && !sw.includes('echovault-v6-phase-2-game-loop')) failures.push('Phase 2 cache marker missing');
if (!index.includes('Refresh App Cache') && !script.includes('refresh-app-cache-btn')) failures.push('Refresh App Cache missing');
['EchoAvatar','echovault_avatar_v1','MaterialEngine','VaultInventory','echovault_inventory_v1','GentleQuests','echovault_quests_v1','EchoSociety — coming later'].forEach((marker) => {
  if (!script.includes(marker) && !index.includes(marker)) failures.push(`Missing Phase 1 marker: ${marker}`);
});
['Void Lantern','Storm Jar','Emotional Museum','ArtifactArchive','signInWithOtp','auth-local-btn','beforeinstallprompt','echovault_echoes_v2','echovault_artifacts_v1'].forEach((marker) => {
  if (!script.includes(marker) && !index.includes(marker)) failures.push(`Required existing marker missing: ${marker}`);
});
if (/\b(leaderboard)\b/i.test(script.replace(/EchoSociety — coming later/g,''))) failures.push('Forbidden social/community implementation wording detected');
if (script.toLowerCase().includes('chatbot')) failures.push('Chatbot added unexpectedly');
if (!script.includes('Profile Synced')) failures.push('Vault sync wording does not use Profile Synced');
if (script.includes('Vault Synced')) failures.push('Vault Synced wording still present despite placeholder echo sync');


// Phase 1 hotfix/polish checks
if (!script.includes('function escapeHTML(value)')) failures.push('escapeHTML helper missing');
if (!(script.includes('escapeHTML(avatar.avatar_name)') && script.includes('escapeHTML(avatar.role)') && script.includes('escapeHTML(avatar.aura)') && script.includes('escapeHTML(avatar.outfit_hint)') && script.includes('escapeHTML(avatar.companion_symbol)'))) {
  failures.push('EchoAvatar render does not escape all avatar/profile fields');
}
if (script.includes('<h4>${avatar.avatar_name}</h4>') || script.includes('${avatar.role}</div><p>Aura: ${avatar.aura}')) {
  failures.push('EchoAvatar render still directly interpolates raw avatar fields');
}
if (!(script.includes('todayKey') && script.includes('completionKey') && script.includes('${id}:${dateKey}'))) {
  failures.push('GentleQuests completion does not appear keyed per local date');
}
if (!(script.includes('completed_at') || script.includes('todayKey'))) failures.push('GentleQuests missing completed_at/todayKey completion marker');
if (!(script.includes('Vault Holder') || script.includes('Cardholder'))) failures.push('Mood Receipt missing Vault Holder/Cardholder identity field');


// Mood Receipt fail-safe rendering checks
if (!script.includes('function safeGetReceiptData')) failures.push('safeGetReceiptData helper missing');
if (!(script.includes('safeGetReceiptData(safeMode)') || script.includes('safeGetReceiptData(mode'))) failures.push('buildReceipt does not use safeGetReceiptData');
if (!script.includes('Receipt failed to open')) failures.push('Receipt failure toast text missing');
if (script.includes('Auth.hasSupabase?.()')) failures.push('Auth.hasSupabase?.() regression detected');
if (!script.includes('receipt-error-card')) failures.push('receipt-error-card fallback missing');
if (!(script.includes("let charImgHTML = ''") || script.includes('let charImgHTML=""') || script.includes("var charImgHTML = ''") || script.includes("charImgHTML = ''"))) failures.push('charImgHTML safe default missing');
if (!/receipt\s*:\s*buildReceipt/.test(script)) failures.push('Ritual builders map missing receipt: buildReceipt');
if (!script.includes("modal.classList.add('open')")) failures.push('Ritual open path no longer opens fun modal');
if (!(script.includes('receiptClass') && script.includes('RECEIPT_CLASSES'))) failures.push('ReceiptRenderer missing receipt class generation');
if (!(style.includes('.museum-shell') && style.includes('overflow-y:auto') && style.includes('max-height:calc(100dvh'))) failures.push('museum layout missing max-height/overflow-y');
if (!(style.includes('.museum-tabs') && (style.includes('overflow-x:auto') || style.includes('grid-template-columns')))) failures.push('museum tabs missing overflow-x/responsive layout');
if (!(style.includes('.relic-grid') && style.includes('auto-fit'))) failures.push('relic grid missing responsive auto-fit');
if (!script.includes('echovault_inventory_v1')) failures.push('script.js missing echovault_inventory_v1 key');
if (!script.includes('echovault_quests_v1')) failures.push('script.js missing echovault_quests_v1 key');
if (/\b(chatbot|social feed|leaderboard)\b/i.test(script)) failures.push('Forbidden chatbot/social feed/leaderboard feature detected');



// Phase 2 private game loop checks
[
  ['RelicCrafting exists', 'const RelicCrafting = (() => {'],
  ['listRecipes exists', 'listRecipes'],
  ['canCraft exists', 'canCraft'],
  ['craft exists', 'craft(recipeId)'],
  ['spendMaterials exists', 'spendMaterials'],
  ['hasMaterials exists', 'hasMaterials'],
  ['VaultRooms exists', 'const VaultRooms = (() => {'],
  ['echovault_rooms_v1 exists', 'echovault_rooms_v1'],
  ['Crafting Table exists', 'Crafting Table'],
  ['room unlock rules exist', 'detectNewUnlocks'],
  ['EchoAvatar has level field', 'level'],
  ['EchoAvatar has role_xp field', 'role_xp'],
  ['EchoAvatar has role_title field', 'role_title'],
  ['EchoAvatar has addXP', 'addXP'],
  ['GentleQuests contains relic_crafted', 'relic_crafted'],
  ['GentleQuests contains room_unlocked', 'room_unlocked'],
  ['MaterialEngine.showMaterialBurst exists', 'showMaterialBurst'],
  ['VaultInventory still uses echovault_inventory_v1', 'echovault_inventory_v1'],
  ['ArtifactArchive still uses echovault_artifacts_v1', 'echovault_artifacts_v1'],
  ['Storage still uses echovault_echoes_v2', 'echovault_echoes_v2'],
  ['auth-local-btn still exists', 'auth-local-btn'],
  ['signInWithOtp still exists', 'signInWithOtp'],
  ['beforeinstallprompt still exists', 'beforeinstallprompt']
].forEach(([label, marker]) => { if (!script.includes(marker)) failures.push(`Phase 2 check failed: ${label}`); });
['weather_room','crafting_table','relic_hall','lantern_garden','storm_chamber','soundprint_wall','archive_shelf','society_gate'].forEach((roomId) => {
  if (!script.includes(roomId)) failures.push(`VaultRooms missing room unlock rule: ${roomId}`);
});
if (/\b(chatbot|leaderboard|social feed)\b/i.test(script)) failures.push('Forbidden chatbot/leaderboard/social feed feature detected');
if (Object.keys(deps).some((d) => ['react','vue','angular','next','svelte'].includes(d))) failures.push('Heavy framework dependency added unexpectedly');

// Keep dependency footprint small
if (Object.keys(deps).some((d) => ['react','vue','angular','next','svelte'].includes(d))) {
  failures.push('Heavy framework dependency added unexpectedly');
}

if (failures.length) {
  console.error('Smoke test failed:');
  failures.forEach((f) => console.error('- ' + f));
  process.exit(1);
}

console.log('Smoke test passed.');