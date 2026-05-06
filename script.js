(function EchoVault() {
'use strict';

const APP_VERSION = 'phase-3-echo-society-foundation';
const SW_CACHE_VERSION = 'echovault-v8-phase-3-echo-society';
console.info('[EchoVault]', APP_VERSION, SW_CACHE_VERSION);

const AppEnvironment = (() => {
  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  }
  function applyClasses() {
    document.documentElement.classList.toggle('is-standalone', isStandalone());
    document.documentElement.classList.toggle('is-ios', /iPad|iPhone|iPod/.test(navigator.userAgent));
    document.documentElement.classList.toggle('is-android', /Android/.test(navigator.userAgent));
    document.documentElement.classList.toggle('is-mobile', window.innerWidth < 768);
    document.documentElement.classList.toggle('is-tablet', window.innerWidth >= 768 && window.innerWidth < 1100);
    document.documentElement.classList.toggle('is-desktop', window.innerWidth >= 1100);
  }
  return { isStandalone, applyClasses };
})();

/* ── CONSTANTS ── */
const STORAGE_KEY  = 'echovault_echoes_v2';
const USER_KEY     = 'echoUser';
const OB_KEY       = 'echoOnboarded';


function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
  }[char]));
}

const MOOD_COLORS = {
  calm:'#5b8fa8', chaos:'#c44b4b', reflective:'#7c6fa0',
  anxious:'#c47a3a', joyful:'#7aab6e', empty:'#4a4a5a'
};
const MOOD_EMOJIS = {
  calm:'🌊', chaos:'⚡', reflective:'🌙',
  anxious:'🌀', joyful:'🌸', empty:'🪨'
};
const MOOD_COVER_EMOJI = {
  calm:'🌊', chaos:'⚡', reflective:'🌙', anxious:'🌀', joyful:'🌸', empty:'🌑'
};
const ARCHETYPE_NAMES = {
  calm:'The Still Lake', chaos:'The Electric Storm', reflective:'The Night Wanderer',
  anxious:'The Trembling Compass', joyful:'The Blooming Field', empty:'The Quiet Abyss'
};
const ARCHETYPE_DESCS = {
  calm:'You carry stillness like a gift. People feel safer around you.',
  chaos:'You burn bright. The world feels your electricity.',
  reflective:'You see depths others miss. The inner world is your true home.',
  anxious:'You feel everything twice. That\'s not weakness — it\'s signal.',
  joyful:'Something in you insists on light. Keep that.',
  empty:'You\'ve been in the void. The void knows your name now.'
};
const SOUNDPRINTS = {
  calm:[
    {song:'Motion Picture Soundtrack',artist:'Radiohead',reason:'It drifts like you do right now — in and out of the world.',spotify:'https://open.spotify.com/search/Motion%20Picture%20Soundtrack%20Radiohead',youtube:'https://www.youtube.com/results?search_query=Motion+Picture+Soundtrack+Radiohead'},
    {song:'Holocene',artist:'Bon Iver',reason:'The sound of feeling small in the most beautiful way.',spotify:'https://open.spotify.com/search/Holocene%20Bon%20Iver',youtube:'https://www.youtube.com/results?search_query=Holocene+Bon+Iver'},
    {song:'Gymnopédie No.1',artist:'Erik Satie',reason:'Pure stillness, distilled into notes.',spotify:'https://open.spotify.com/search/Gymnopedie%20Satie',youtube:'https://www.youtube.com/results?search_query=Gymnop%C3%A9die+No+1+Satie'}
  ],
  chaos:[
    {song:'Idioteque',artist:'Radiohead',reason:'Controlled collapse. Beautiful and frantic, like you.',spotify:'https://open.spotify.com/search/Idioteque%20Radiohead',youtube:'https://www.youtube.com/results?search_query=Idioteque+Radiohead'},
    {song:'Running with the Wolves',artist:'Aurora',reason:'The electric sprint of feeling too much.',spotify:'https://open.spotify.com/search/Running%20with%20the%20Wolves%20Aurora',youtube:'https://www.youtube.com/results?search_query=Running+with+the+Wolves+Aurora'},
    {song:'Violent Shaking',artist:'Arca',reason:'Chaos doesn\'t need to make sense. Neither does this.',spotify:'https://open.spotify.com/search/Arca',youtube:'https://www.youtube.com/results?search_query=Arca+Violent+Shaking'}
  ],
  reflective:[
    {song:'Skinny Love',artist:'Bon Iver',reason:'The archaeology of self — digging through what was.',spotify:'https://open.spotify.com/search/Skinny%20Love%20Bon%20Iver',youtube:'https://www.youtube.com/results?search_query=Skinny+Love+Bon+Iver'},
    {song:'Silhouette',artist:'Aquilo',reason:'Memory wearing a coat of blue light.',spotify:'https://open.spotify.com/search/Silhouette%20Aquilo',youtube:'https://www.youtube.com/results?search_query=Silhouette+Aquilo'},
    {song:'Lua',artist:'Bright Eyes',reason:'Honest. A little broken. Deeply awake.',spotify:'https://open.spotify.com/search/Lua%20Bright%20Eyes',youtube:'https://www.youtube.com/results?search_query=Lua+Bright+Eyes'}
  ],
  anxious:[
    {song:'Portions for Foxes',artist:'Rilo Kiley',reason:'That restless frequency you can\'t name — this does.',spotify:'https://open.spotify.com/search/Portions%20for%20Foxes',youtube:'https://www.youtube.com/results?search_query=Portions+for+Foxes+Rilo+Kiley'},
    {song:'An Eagle in Your Mind',artist:'Boards of Canada',reason:'Loops within loops. Worry as soundscape.',spotify:'https://open.spotify.com/search/Boards%20of%20Canada',youtube:'https://www.youtube.com/results?search_query=An+Eagle+in+Your+Mind+Boards+of+Canada'},
    {song:'Dog Days Are Over',artist:'Florence + Machine',reason:'Panic and release held in the same breath.',spotify:'https://open.spotify.com/search/Dog%20Days%20Are%20Over',youtube:'https://www.youtube.com/results?search_query=Dog+Days+Are+Over+Florence+Machine'}
  ],
  joyful:[
    {song:'Dog Days Are Over',artist:'Florence + Machine',reason:'Joy that runs. Joy that doesn\'t apologize.',spotify:'https://open.spotify.com/search/Dog%20Days%20Are%20Over',youtube:'https://www.youtube.com/results?search_query=Dog+Days+Are+Over+Florence+Machine'},
    {song:'Sprawl II',artist:'Arcade Fire',reason:'Ecstasy as architecture. You live here now.',spotify:'https://open.spotify.com/search/Sprawl%20II%20Arcade%20Fire',youtube:'https://www.youtube.com/results?search_query=Sprawl+II+Arcade+Fire'},
    {song:"Can't Help Falling in Love",artist:'Kina Grannis',reason:'Gentle joy. The kind that stays.',spotify:'https://open.spotify.com/search/Kina%20Grannis%20Cant%20Help%20Falling',youtube:'https://www.youtube.com/results?search_query=Kina+Grannis+Cant+Help+Falling+in+Love'}
  ],
  empty:[
    {song:'Naked as We Came',artist:'Iron & Wine',reason:"Empty doesn't mean nothing. This song knows.",spotify:'https://open.spotify.com/search/Naked%20as%20We%20Came',youtube:'https://www.youtube.com/results?search_query=Naked+as+We+Came+Iron+Wine'},
    {song:'Street Spirit',artist:'Radiohead',reason:'The beautiful weight of feeling gone quiet.',spotify:'https://open.spotify.com/search/Street%20Spirit%20Radiohead',youtube:'https://www.youtube.com/results?search_query=Street+Spirit+Radiohead'},
    {song:'The Night Will Always Win',artist:'Manchester Orchestra',reason:'For when the hollow feeling has its own gravity.',spotify:'https://open.spotify.com/search/Manchester%20Orchestra',youtube:'https://www.youtube.com/results?search_query=The+Night+Will+Always+Win+Manchester+Orchestra'}
  ]
};

const PatternEngine = (() => {
  const WEATHER_MAP = { calm:'slow blue weather', chaos:'electric pressure', reflective:'moonlit drift', anxious:'restless wind', joyful:'soft bloom', empty:'quiet fog' };
  function analyze(echoes = []) {
    const totalEchoes = echoes.length;
    if (!totalEchoes) return { totalEchoes:0, oneLineInsight:'No echoes yet. The universe is quiet — not empty.' };
    const moodCounts = {}; let intensitySum = 0; let silenceSum = 0; let voidCount = 0; let moodChanges = 0; let intDelta = 0;
    echoes.forEach((e, i) => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      intensitySum += Number(e.intensity || 0); silenceSum += Number(e.silence || 0); if (e.void) voidCount++;
      if (i > 0) { if (echoes[i - 1].mood !== e.mood) moodChanges++; intDelta += Math.abs((echoes[i - 1].intensity || 0) - (e.intensity || 0)); }
    });
    const dominantMood = Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;
    const moodPercentages = Object.fromEntries(Object.entries(moodCounts).map(([k,v]) => [k, Math.round((v / totalEchoes) * 100)]));
    const averageIntensity = +(intensitySum / totalEchoes).toFixed(1);
    const averageSilence = +(silenceSum / totalEchoes).toFixed(1);
    const voidPercentage = Math.round((voidCount / totalEchoes) * 100);
    const mostRecentMood = echoes[0]?.mood || null;
    const previousMood = echoes[1]?.mood || null;
    const recentShift = previousMood && mostRecentMood !== previousMood ? `${previousMood} → ${mostRecentMood}` : 'steady';
    const volatilityScore = Math.round(Math.min(100, ((moodChanges / Math.max(1, totalEchoes - 1)) * 60 + (intDelta / Math.max(1, totalEchoes - 1)) * 4)));
    const trend = (field) => {
      if (totalEchoes < 6) return 'steady';
      const latest = echoes.slice(0,5).reduce((a,e)=>a + (e[field] || 0),0) / Math.min(5,totalEchoes);
      const prev = echoes.slice(5,10).reduce((a,e)=>a + (e[field] || 0),0) / Math.max(1, Math.min(5, totalEchoes - 5));
      if (latest > prev + 0.5) return 'rising'; if (latest < prev - 0.5) return 'falling'; return 'steady';
    };
    const intensityTrend = trend('intensity');
    const silenceTrend = trend('silence');
    let currentStreakMood = mostRecentMood; let currentStreakCount = 0;
    for (const e of echoes) { if (e.mood === currentStreakMood) currentStreakCount++; else break; }
    const emotionalWeather = Object.keys(moodCounts).length >= 4 ? 'shifting sky' : (WEATHER_MAP[dominantMood] || 'shifting sky');
    let oneLineInsight = 'You kept returning. That counts.';
    if (silenceTrend === 'rising' && intensityTrend !== 'rising') oneLineInsight = 'Your echoes are getting quieter, but not weaker.';
    else if (volatilityScore > 65) oneLineInsight = 'You are not chaotic all the time. You spike, then disappear.';
    else if (averageSilence >= 7) oneLineInsight = 'You have been carrying more than you are saying.';
    else if (dominantMood === 'calm' && averageSilence >= 5) oneLineInsight = 'Your calm is returning, but your silence is still high.';
    return { totalEchoes, dominantMood, moodCounts, moodPercentages, averageIntensity, averageSilence, voidCount, voidPercentage, mostRecentMood, previousMood, recentShift, volatilityScore, intensityTrend, silenceTrend, currentStreakMood, currentStreakCount, emotionalWeather, oneLineInsight };
  }
  return { analyze };
})();

const ArchetypeEngine = (() => {
  function compute(patterns) {
    if (!patterns?.totalEchoes) return { archetypeKey:'unknown', archetypeName:'The Unknown', archetypeDescription:'Create echoes to discover your archetype.', archetypeAura:'dim', archetypeQuote:'Begin anywhere.', dominantFactors:[] };
    const p = patterns; let key = p.dominantMood || 'balanced';
    if (Object.keys(p.moodCounts || {}).length >= 4) key = 'shiftingSky';
    if (p.dominantMood === 'calm' && p.volatilityScore < 30) key = 'stillLake';
    if (p.dominantMood === 'chaos' && p.averageIntensity >= 7) key = 'electricStorm';
    if (p.dominantMood === 'reflective' && p.averageSilence >= 6) key = 'nightArchivist';
    if (p.dominantMood === 'anxious' && p.volatilityScore > 55) key = 'tremblingCompass';
    if (p.dominantMood === 'joyful' && p.currentStreakCount >= 2) key = 'bloomingField';
    if (p.dominantMood === 'empty' && p.averageSilence >= 7 && p.voidPercentage >= 35) key = 'quietAbyss';
    if (p.averageSilence >= 7 && p.intensityTrend === 'rising') key = 'signalFire';
    if (p.averageIntensity >= 8 && p.volatilityScore >= 65) key = 'glassComet';
    if (p.averageIntensity <= 4 && p.averageSilence >= 6) key = 'softWitness';
    const defs = {
      stillLake:['The Still Lake','Quiet force, low turbulence, steady depth.','silver blue','Still water remembers every star.'],
      electricStorm:['The Electric Storm','High voltage feeling moving through fast skies.','violet gold','You spark, then re-form.'],
      nightArchivist:['The Night Archivist','You keep meaning in the dark and file it carefully.','moon ink','Your silence has memory.'],
      tremblingCompass:['The Trembling Compass','Sensitive to every shift, always searching true north.','amber static','Even shaking, you still point forward.'],
      bloomingField:['The Blooming Field','Joy returns with consistency, even after rough weather.','rose dawn','Light is becoming your habit.'],
      quietAbyss:['The Quiet Abyss','Low signal, deep quiet, vast interior gravity.','charcoal indigo','Even quiet can be a language.'],
      shiftingSky:['The Shifting Sky','Your emotional world moves wide and alive across moods.','prism dusk','You were not inconsistent. You were weather.'],
      signalFire:['The Signal Fire','You are speaking again from a quiet season.','ember night','Still here is still a signal.'],
      glassComet:['The Glass Comet','Intense arcs and sudden turns — luminous and fragile.','crystal flame','You burn bright, then breathe.'],
      softWitness:['The Soft Witness','Gentle intensity, deep noticing, patient reflection.','mist gold','You do not force meaning. You witness it.']
    };
    const legacyName = ARCHETYPE_NAMES[p.dominantMood] || 'The Shifting Sky';
    const [archetypeName, archetypeDescription, archetypeAura, archetypeQuote] = defs[key] || [legacyName, ARCHETYPE_DESCS[p.dominantMood] || 'Still becoming.', 'muted dusk', 'Keep listening.'];
    return { archetypeKey:key, archetypeName, archetypeDescription, archetypeAura, archetypeQuote, dominantFactors:[p.dominantMood, `intensity ${p.averageIntensity}`, `silence ${p.averageSilence}`, `volatility ${p.volatilityScore}`].filter(Boolean) };
  }
  return { compute };
})();

/* ── STATE ── */
let state = {
  echoes: [],
  selectedMood: null,
  voidMode: false,
  wrappedPeriod: 'week',
  currentView: 'home',
  focusedBubble: null,
  idleTimer: null,
  lastInteraction: Date.now(),
  tabHidden: false,
  lsWriteTimer: null
};

/* ── STORAGE ── */
const Storage = (() => {
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch(e) { return []; }
  }
  function save(echoes) {
    clearTimeout(state.lsWriteTimer);
    state.lsWriteTimer = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(echoes)); }
      catch(e) { if (e.name==='QuotaExceededError') Toast.show('Storage full.', 3500); }
    }, 300);
  }
  function exportVault(echoes) {
    try {
      const blob = new Blob([JSON.stringify({version:2,echoes}, null, 2)], {type:'application/json'});
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'echovault-backup.json';
      a.click(); URL.revokeObjectURL(url);
      Toast.show('Vault exported ✓');
    } catch(e) { Toast.show('Export failed.'); }
  }
  function importVault(file, onSuccess) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const arr  = data.echoes || data;
        if (!Array.isArray(arr)) throw new Error('Invalid format');
        onSuccess(arr);
        Toast.show(`Imported ${arr.length} echoes ✓`);
      } catch(err) { Toast.show('Import failed — invalid file.'); }
    };
    reader.readAsText(file);
  }
  return {load, save, exportVault, importVault};
})();

/* ── TOAST ── */
const Toast = (() => {
  const el = document.getElementById('toast');
  let timer;
  function show(msg, duration = 2200) {
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove('show'), duration);
  }
  return {show};
})();

const ProfileStore = (() => {
  const KEY = 'echovault_profile_v1';
  function read() {
    let profile = {};
    try { profile = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch {}
    const legacy = localStorage.getItem(USER_KEY);
    if (legacy && !profile.display_name) {
      profile = { ...profile, display_name: legacy };
      localStorage.setItem(KEY, JSON.stringify({ ...profile, updated_at:new Date().toISOString() }));
    }
    return profile;
  }
  function write(profile) { localStorage.setItem(KEY, JSON.stringify({...read(), ...profile, updated_at:new Date().toISOString()})); }
  return { read, write };
})();

const Auth = (() => {
  const config = window.ECHOVAULT_CONFIG || {};
  const SUPABASE_URL = config.SUPABASE_URL;
  const SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY;
  const SUPABASE_AVATAR_BUCKET = config.SUPABASE_AVATAR_BUCKET || 'avatars';
  const hasSupabase = Boolean(window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY);
  const client = hasSupabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } }) : null;
  let mode = hasSupabase ? 'supabase' : 'local';
  let user = null;
  async function init(){
    if (!client) return;
    try {
      const {data,error} = await client.auth.getSession();
      if (error) throw error;
      user = data?.session?.user || null;
      client.auth.onAuthStateChange((_e, s)=>{ user = s?.user || null; UserChip.refresh(); });
    } catch (error) {
      console.warn('Supabase auth unavailable; falling back to local mode behavior.', error);
      user = null;
    }
  }
  async function signIn(email,password){ if(!client) return {ok:false,error:'Supabase is not configured — local mode only.'}; const {data,error}=await client.auth.signInWithPassword({email,password}); if(error)return {ok:false,error:error.message}; user=data.user; return {ok:true,data}; }
  async function sendEmailOtp(email){ if(!client) return {ok:false,error:'Supabase is not configured — local mode only.'}; const {error}=await client.auth.signInWithOtp({email,options:{shouldCreateUser:true,emailRedirectTo:getAuthRedirectUrl()}}); if(error) return {ok:false,error:error.message}; return {ok:true}; }
  async function verifyEmailOtp(email,token){ if(!client) return {ok:false,error:'Supabase is not configured — local mode only.'}; const {data,error}=await client.auth.verifyOtp({email,token,type:'email'}); if(error) return {ok:false,error:error.message}; user=data?.user||data?.session?.user||null; return {ok:true,data}; }
  async function signUp(email,password,displayName){ if(!client) return {ok:false,error:'Supabase is not configured — local mode only.'}; const {data,error}=await client.auth.signUp({email,password,options:{data:{display_name:displayName||undefined},emailRedirectTo:getAuthRedirectUrl()}}); if(error)return {ok:false,error:error.message}; user=data.user||null; return {ok:true,data}; }
  async function signOut(){ if(client) await client.auth.signOut(); user=null; localStorage.removeItem(USER_KEY); }
  async function fetchProfile(){ if(!client||!user) return null; const {data}=await client.from('profiles').select('*').eq('id',user.id).maybeSingle(); return data||null; }
  async function upsertProfile(profile){
    ProfileStore.write(profile);
    if(!client||!user) return {ok:true};
    const payload={id:user.id,display_name:profile.display_name||null,username:profile.username||null,bio:profile.bio||null,location:profile.location||null,avatar_url:profile.avatar_url||null,emotional_archetype:profile.emotional_archetype||null,updated_at:new Date().toISOString()};
    const {error}=await client.from('profiles').upsert(payload,{onConflict:'id'});
    if(error){Toast.show('Profile sync failed; kept local copy.'); return {ok:false,error:error.message};}
    return {ok:true};
  }
  function isLocalMode(){ return !client || !user; }
  return { init, signIn, signUp, sendEmailOtp, verifyEmailOtp, signOut, hasSupabase, fetchProfile, upsertProfile, client, SUPABASE_AVATAR_BUCKET, getAuthRedirectUrl, isLocalMode, get user(){return user;}, get mode(){return mode;} };
})();

/* ── NAVIGATION ── */
const Nav = (() => {
  const views   = ['home','entry','timeline','wrapped','fun'];
  const navBtns = {}, viewEls = {};
  views.forEach(v => {
    navBtns[v] = document.getElementById('nav-' + v);
    viewEls[v] = document.getElementById('view-' + v);
    if (navBtns[v]) {
      navBtns[v].addEventListener('click', () => {
        show(v);
        if (v === 'wrapped' && typeof CinematicWrapped !== 'undefined' && CinematicWrapped?.open) {
          CinematicWrapped.open();
        }
      });
    }
  });
  function show(name) {
    views.forEach(v => {
      viewEls[v]?.classList.toggle('active', v === name);
      navBtns[v]?.classList.toggle('active',  v === name);
    });
    state.currentView = name;
    if (name === 'timeline') { Timeline.render(); setTimeout(ConnectionCanvas.render, 60); }
    if (name === 'wrapped')  Wrapped.render();
    if (name === 'home')     IdentityCore.update();
    // Smooth scroll to top of the view content, then to the active section
    window.scrollTo({top:0, behavior:'smooth'});
    // After the scroll, ensure the view's first meaningful content is in focus
    setTimeout(() => {
      const activeView = viewEls[name];
      if (!activeView) return;
      const firstFocusable = activeView.querySelector('.view-title, h2, .hero-title, .fun-grid, #bubble-field, #wrapped-content, .wrapped-card, .entry-container');
      if (firstFocusable) {
        const rect = firstFocusable.getBoundingClientRect();
        if (rect.top < 0 || rect.top > window.innerHeight * 0.3) {
          firstFocusable.scrollIntoView({behavior:'smooth', block:'start'});
        }
      }
    }, 80);
  }
  return {show};
})();


/* ══════════════════════════════════════════
   SETTINGS — profile, avatar, bio, stats
══════════════════════════════════════════ */
const Settings = (() => {
  const overlay = document.getElementById('settings-overlay');
  function open() {
    overlay?.setAttribute('aria-hidden','false');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    populateStats();
    populateArchetype();
    populateEchoAvatar();
    populateSocietyPrivacy();
  }
  function close() {
    overlay?.classList.remove('open');
    overlay?.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  function populateStats() {
    const grid = document.getElementById('settings-stats'); if (!grid) return;
    const p = PatternEngine.analyze(state.echoes);
    const total = p.totalEchoes || 0;
    const avgInt = total ? p.averageIntensity : '—';
    const voidCnt = p.voidCount || 0;
    const dom = p.dominantMood;
    const daysSince = total ? Math.floor((Date.now()-new Date(state.echoes[state.echoes.length-1].date))/86400000) : 0;
    grid.innerHTML = [
      {val:total,label:'echoes'},{val:avgInt,label:'avg intensity'},{val:voidCnt,label:'void entries'},
      {val:dom||'—',label:'dominant mood',color:MOOD_COLORS[dom]},{val:daysSince,label:'days journaling'},{val: total ? (p.averageSilence || '—') : '—', label:'avg silence'}
    ].map(s=>`<div class="settings-stat"><div class="settings-stat-val" ${s.color?`style="color:${s.color}"`:''}>${s.val}</div><div class="settings-stat-label">${s.label}</div></div>`).join('');
  }
  function populateArchetype() {
    const p = PatternEngine.analyze(state.echoes.slice(0,30));
    const arch = ArchetypeEngine.compute(p);
    const dom = p.dominantMood;
    const nameEl = document.getElementById('archetype-name-display');
    const descEl = document.getElementById('archetype-desc-display');
    const orbEl  = document.getElementById('archetype-orb');
    if (nameEl) nameEl.textContent = arch.archetypeName;
    if (descEl) descEl.textContent = `${arch.archetypeDescription} · ${p.emotionalWeather || 'shifting sky'}`;
    if (orbEl && dom) orbEl.style.background = `radial-gradient(circle at 38% 35%,${MOOD_COLORS[dom]},${MOOD_COLORS[dom]}44)`;
  }
  function populateEchoAvatar() {
    const mount = document.getElementById('settings-echo-avatar');
    if (!mount) return;
    mount.innerHTML = EchoAvatar.render();
    EchoAvatar.bind();
  }
  function populateSocietyPrivacy() {
    const status = document.getElementById('society-consent-status');
    if (!status || typeof SocietySignals === 'undefined') return;
    const signals = SocietySignals.listLocalSignals();
    const reactions = SocietySignals.listReactions();
    const localReactionCount = Object.values(reactions).flat().length;
    const synced = signals.filter((signal) => signal.synced).length;
    const cloud = SocietySync.isAvailable() ? 'logged in · cloud consent sync available' : 'not logged in · local preview';
    status.innerHTML = `Society consent local status: <b>${SocietySignals.getConsent() ? 'joined' : 'not joined'}</b><br>Cloud consent status: <b>${cloud}</b><br>Local signal count: <b>${signals.length}</b> · uploaded/synced signal count: <b>${synced}</b><br>Local reactions count: <b>${localReactionCount}</b><br>Current mode: <b>${SocietySync.isAvailable() ? 'Live Society' : 'Local Preview'}</b><br>Alam AI mode: <b>${AlamAI.isRemoteAvailable() ? 'Remote endpoint if configured' : 'Local only'}</b>`;
    const latest = document.getElementById('alam-include-latest-setting');
    if (latest) latest.checked = AlamPrivacy.shouldIncludeLatestEcho();
  }
  async function init() {
    const profile = ProfileStore.read();
    document.getElementById('settings-display-name').value = profile.display_name || localStorage.getItem(USER_KEY) || '';
    document.getElementById('settings-username').value = profile.username || '';
    document.getElementById('settings-bio').value = profile.bio || '';
    document.getElementById('settings-location').value = profile.location || '';
    document.getElementById('bio-chars').textContent = (profile.bio || '').length;
    document.getElementById('settings-close-btn')?.addEventListener('click', close);
    overlay?.addEventListener('click', e => { if (e.target===overlay) close(); });
    document.getElementById('settings-bio')?.addEventListener('input', (e) => {
      document.getElementById('bio-chars').textContent = e.target.value.length;
    });
    const avatarInput = document.getElementById('avatar-file-input');
    document.getElementById('avatar-zone')?.addEventListener('click', () => avatarInput?.click());
    document.getElementById('avatar-zone')?.addEventListener('keydown', (e) => { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); avatarInput?.click(); }});
    avatarInput?.addEventListener('change', async (e) => {
      const f = e.target.files?.[0]; if (!f) return;
      if (!['image/jpeg','image/png','image/webp','image/gif'].includes(f.type) || f.size > 2*1024*1024) { Toast.show('Avatar must be jpeg/png/webp/gif under 2MB'); return; }
      const r = new FileReader(); r.onload = async () => { const avatarImg=document.getElementById('avatar-img'); const initials=document.getElementById('avatar-initials'); avatarImg.src = r.result; avatarImg.style.display='block'; initials.style.display='none'; ProfileStore.write({avatar_data_url:r.result}); if (Auth.user && Auth.client) { try { const ext=(f.name.split('.').pop()||'png').toLowerCase(); const path=`${Auth.user.id}/avatar-${Date.now()}.${ext}`; const {error}=await Auth.client.storage.from(Auth.SUPABASE_AVATAR_BUCKET).upload(path,f,{upsert:true}); if (error) throw error; const {data} = Auth.client.storage.from(Auth.SUPABASE_AVATAR_BUCKET).getPublicUrl(path); const profile={...ProfileStore.read(), avatar_url:data.publicUrl}; ProfileStore.write(profile); await Auth.upsertProfile(profile); } catch(err){ Toast.show('Avatar upload failed; kept local preview.'); } } UserChip.refresh(); e.target.value=''; }; r.readAsDataURL(f);
    });
    document.getElementById('settings-save-btn')?.addEventListener('click', () => {
      const payload = {
        display_name: document.getElementById('settings-display-name').value.trim(),
        username: document.getElementById('settings-username').value.trim(),
        bio: document.getElementById('settings-bio').value.trim(),
        location: document.getElementById('settings-location').value.trim()
      };
      ProfileStore.write(payload);
      localStorage.setItem(USER_KEY, payload.display_name || payload.username || localStorage.getItem(USER_KEY) || 'you');
      UserChip.refresh();
  VaultPulse.set(Auth.user ? "synced" : "local", Auth.user ? "Profile Synced" : "Local Vault");
      const status = document.getElementById('settings-save-status');
      if (status) { status.textContent = '✓ saved to your universe'; status.classList.add('show'); setTimeout(() => status.classList.remove('show'), 2500); }
    });
    document.getElementById('refresh-app-cache-btn')?.addEventListener('click', async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      location.reload();
    } catch (e) { Toast.show('Cache refresh failed.'); }
  });
  document.getElementById('clear-local-session-btn')?.addEventListener('click', () => {
    ['echoUser','echoOnboarded','echovault_profile_v1','ev_auth_mode'].forEach((k) => localStorage.removeItem(k));
    Toast.show('Local session cleared.');
  });
  document.getElementById('settings-export-btn')?.addEventListener('click', () => Storage.exportVault(state.echoes));
    document.getElementById('society-join-btn')?.addEventListener('click', () => { SocietySignals.setConsent(true); populateSocietyPrivacy(); updateSocietyConsentUI({ privateState:false }); Toast.show('EchoSociety joined. Raw echoes remain private.'); });
    document.getElementById('society-revoke-consent-btn')?.addEventListener('click', () => { SocietySignals.revokeConsent(); populateSocietyPrivacy(); updateSocietyConsentUI({ privateState:true }); Toast.show('EchoSociety consent revoked.'); });
    document.getElementById('society-sync-signals-btn')?.addEventListener('click', async () => { await SocietySync.syncLocalSignals(); populateSocietyPrivacy(); });
    document.getElementById('society-clear-signals-btn')?.addEventListener('click', () => { if (!confirm('Clear local EchoSociety signals and reactions? Your echoes stay untouched.')) return; SocietySignals.clearLocalSignals(); populateSocietyPrivacy(); Toast.show('Local society signals cleared.'); });
    document.getElementById('society-export-signals-btn')?.addEventListener('click', () => SocietySignals.exportSignals());
    document.getElementById('alam-clear-chat-btn')?.addEventListener('click', () => { AlamAI.clearChat(); populateSocietyPrivacy(); });
    document.getElementById('alam-include-latest-setting')?.addEventListener('change', (event) => { writeLocalJSON('echovault_alam_ai_settings_v1', { ...readLocalJSON('echovault_alam_ai_settings_v1', {}), includeLatestEcho:event.target.checked }); Toast.show(event.target.checked ? 'Alam can include latest echo summary when you ask.' : 'Alam latest echo sharing is off.'); });


  document.getElementById('settings-clear-btn')?.addEventListener('click', () => {
      if (!window.confirm('This will permanently delete all your echoes. This cannot be undone.')) return;
      state.echoes = []; Storage.save([]);
      Toast.show('All echoes cleared.', 3000);
      close();
      refreshEchoDependentUI();
    });
    document.addEventListener('keydown', e => { if (e.key==='Escape'&&overlay?.classList.contains('open')) close(); });
    document.getElementById('nav-logo-btn')?.addEventListener('contextmenu', e => { e.preventDefault(); open(); });
  }
  init(); return { open, close };
})();

/* ── LOGIN SYSTEM ── */
const Login = (() => {
  const screen   = document.getElementById('login-screen');
  const lsOrb    = document.getElementById('ls-orb');
  const lsBreath = document.getElementById('ls-breath');
  const lsName   = document.getElementById('ls-name');
  const lsReturn = document.getElementById('ls-return');
  const stressOrb= document.getElementById('stress-orb');
  const nameInput= document.getElementById('name-input');
  const authEmail = document.getElementById('auth-email');
  const authOtp = document.getElementById('auth-otp');
  const authPassword = document.getElementById('auth-password');
  const authSendCode = document.getElementById('auth-send-code-btn');
  const authVerifyCode = document.getElementById('auth-verify-code-btn');
  const authResendCode = document.getElementById('auth-resend-code-btn');
  const authTogglePassword = document.getElementById('auth-toggle-password-btn');
  const authSignIn = document.getElementById('auth-signin-btn');
  const authSignUp = document.getElementById('auth-signup-btn');
  const authLocal = document.getElementById('auth-local-btn');
  const authModeNote = document.getElementById('auth-mode-note');

  let otpCooldownUntil = 0;
  let signupCooldownUntil = 0;
  let authUiMode = 'otp';

  const normalizeAuthError = (msg='') => {
    const lower = msg.toLowerCase();
    if (lower.includes('429') || lower.includes('rate') || lower.includes('security purposes')) return 'Too many attempts. Wait about a minute before trying again.';
    if (lower.includes('email not confirmed')) return 'Email not confirmed. Use the code/link from your email first.';
    if (lower.includes('invalid login credentials')) return 'Invalid details. Try the email code flow or check your password.';
    return msg || 'Something went wrong. Please try again.';
  };

  function showStep(el){ [lsOrb,lsBreath,lsName,lsReturn].forEach(s => s.classList.remove('active')); el.classList.add('active'); }
  function enterApp(){ screen.classList.add('hidden'); setTimeout(() => { screen.style.display='none'; if (!localStorage.getItem(OB_KEY)) Onboarding.start(); }, 950); }
  function setButtonLoading(btn, loading, idleText, busyText){ if(!btn) return; btn.disabled=loading; btn.textContent=loading?busyText:idleText; }
  function setOtpUiStep(codeSent){
    authOtp.style.display = codeSent ? 'block' : 'none';
    authVerifyCode.style.display = codeSent ? 'inline-flex' : 'none';
    authResendCode.style.display = codeSent ? 'inline-flex' : 'none';
  }
  function setAuthMode(mode){
    authUiMode = mode;
    const passwordMode = mode === 'password';
    authPassword.style.display = passwordMode ? 'block' : 'none';
    nameInput.style.display = passwordMode ? 'block' : 'none';
    authSignIn.style.display = passwordMode ? 'inline-flex' : 'none';
    authSignUp.style.display = passwordMode ? 'inline-flex' : 'none';
    authSendCode.style.display = passwordMode ? 'none' : 'inline-flex';
    authTogglePassword.textContent = passwordMode ? 'Use email code instead' : 'Use password instead';
    setOtpUiStep(false);
    authModeNote.textContent = passwordMode ? 'Password mode enabled. Email + password required.' : 'Code shown? Enter it below. Link shown? Open it to unlock your vault.';
  }
  function startOtpCooldown(seconds=60){ otpCooldownUntil = Date.now() + seconds*1000; tickCooldown(); }
  function tickCooldown(){
    if (!authResendCode || authResendCode.style.display === 'none') return;
    const remaining = Math.max(0, Math.ceil((otpCooldownUntil - Date.now())/1000));
    authResendCode.disabled = remaining > 0;
    authResendCode.textContent = remaining > 0 ? `Resend email (${remaining}s)` : 'Resend email';
    if (remaining > 0) setTimeout(tickCooldown, 250);
  }

  async function sendEmailOtp(email){
    if (!email || !/.+@.+\..+/.test(email)) return Toast.show('Enter a valid email.');
    setButtonLoading(authSendCode, true, 'Send Vault Code', 'Sending…');
    const res = await Auth.sendEmailOtp(email);
    setButtonLoading(authSendCode, false, 'Send Vault Code', 'Sending…');
    if (!res.ok) return Toast.show(normalizeAuthError(res.error), 4200);
    setOtpUiStep(true);
    Toast.show('Email sent — use the code if shown, or open the magic link.', 4600);
    if (authModeNote) authModeNote.innerHTML = 'Code shown? Enter it below. Link shown? Open it to unlock your vault.<br><small>To receive a visible 6-digit code, the Supabase Magic Link template must include {{ .Token }}.</small>';
    startOtpCooldown(60);
  }

  async function verifyEmailOtp(email, token){
    if (!email || !/.+@.+\..+/.test(email)) return Toast.show('Enter a valid email.');
    if (!token || !/^\d{6}$/.test(token)) return Toast.show('Enter the 6-digit code.');
    setButtonLoading(authVerifyCode, true, 'Verify Code', 'Verifying…');
    const res = await Auth.verifyEmailOtp(email, token);
    setButtonLoading(authVerifyCode, false, 'Verify Code', 'Verifying…');
    if (!res.ok) return Toast.show('Invalid or expired code. If your email only has a magic link, open that link instead.', 4200);
    if (!res.data?.session) return Toast.show('Session not created. If your email has a magic link, open it instead.', 4200);
    const profile = await Auth.fetchProfile(); if (profile) ProfileStore.write(profile);
    await Auth.upsertProfile({ ...ProfileStore.read(), display_name: nameInput.value.trim() || ProfileStore.read().display_name });
    UserChip.refresh();
  VaultPulse.set(Auth.user ? "synced" : "local", Auth.user ? "Profile Synced" : "Local Vault"); Toast.show('Vault unlocked. Welcome back.'); enterApp();
  }

  async function resendEmailOtp(email){
    const remaining = Math.max(0, Math.ceil((otpCooldownUntil - Date.now())/1000));
    if (remaining > 0) return Toast.show(`Please wait ${remaining}s before resending.`);
    await sendEmailOtp(email);
  }

  function init() {
    const savedUser = localStorage.getItem(USER_KEY);
    if (Auth.user) { UserChip.refresh(); enterApp(); return; }
    if (!Auth.hasSupabase && authModeNote) authModeNote.textContent = 'Supabase is not configured — local mode only.';
    if (savedUser && !Auth.hasSupabase) { document.getElementById('return-name').textContent = savedUser; showStep(lsReturn); document.getElementById('return-enter-btn').addEventListener('click', () => enterApp()); return; }

    stressOrb.addEventListener('pointerdown', () => stressOrb.classList.add('pressed'));
    ['pointerup','pointerleave'].forEach(ev => stressOrb.addEventListener(ev, () => stressOrb.classList.remove('pressed')));
    let pressStart = 0;
    stressOrb.addEventListener('pointerdown', () => { pressStart = Date.now(); });
    stressOrb.addEventListener('pointerup', () => { if (Date.now() - pressStart > 80) { showStep(lsBreath); BreathAnim.start(); setTimeout(() => { showStep(lsName); setAuthMode('otp'); setTimeout(() => authEmail?.focus(), 300); }, 4200); } });

    authLocal?.addEventListener('click', () => { const name = nameInput.value.trim() || localStorage.getItem(USER_KEY) || 'local voyager'; localStorage.setItem(USER_KEY, name); ProfileStore.write({ display_name: name }); UserChip.refresh(); enterApp(); });
    authTogglePassword?.addEventListener('click', () => setAuthMode(authUiMode === 'otp' ? 'password' : 'otp'));
    authSendCode?.addEventListener('click', () => sendEmailOtp(authEmail.value.trim()));
    authVerifyCode?.addEventListener('click', () => verifyEmailOtp(authEmail.value.trim(), authOtp.value.trim()));
    authResendCode?.addEventListener('click', () => resendEmailOtp(authEmail.value.trim()));

    authSignIn?.addEventListener('click', async () => {
      const email=authEmail.value.trim(); const password=authPassword.value;
      if (!email || !/.+@.+\..+/.test(email)) return Toast.show('Enter a valid email.');
      if (!password) return Toast.show('Password is required.');
      setButtonLoading(authSignIn, true, 'Sign in', 'Signing in…'); authSignUp.disabled=true;
      const res = await Auth.signIn(email,password);
      setButtonLoading(authSignIn, false, 'Sign in', 'Signing in…'); authSignUp.disabled=false;
      if (!res.ok) return Toast.show(normalizeAuthError(res.error), 4200);
      const profile = await Auth.fetchProfile(); if (profile) ProfileStore.write(profile);
      UserChip.refresh();
  VaultPulse.set(Auth.user ? "synced" : "local", Auth.user ? "Profile Synced" : "Local Vault"); enterApp();
    });

    authSignUp?.addEventListener('click', async () => {
      const remaining = Math.max(0, Math.ceil((signupCooldownUntil - Date.now())/1000));
      if (remaining > 0) return Toast.show(`Please wait ${remaining}s before creating another account.`);
      const email=authEmail.value.trim(); const password=authPassword.value; const displayName=nameInput.value.trim();
      if (!email || !/.+@.+\..+/.test(email)) return Toast.show('Enter a valid email.');
      if (!password) return Toast.show('Password is required.');
      if (password.length < 6) return Toast.show('Password must be at least 6 characters.');
      setButtonLoading(authSignUp, true, 'Create account', 'Creating…'); authSignIn.disabled=true;
      const res = await Auth.signUp(email,password,displayName);
      setButtonLoading(authSignUp, false, 'Create account', 'Creating…'); authSignIn.disabled=false;
      signupCooldownUntil = Date.now() + 60000;
      if (!res.ok) return Toast.show(normalizeAuthError(res.error), 4200);
      await Auth.upsertProfile({ ...ProfileStore.read(), display_name: displayName || ProfileStore.read().display_name });
      if (res.data?.session) { UserChip.refresh(); enterApp(); } else { Toast.show('Account created. Check your email to confirm, or use Email Code.', 5000); }
    });
  }

  return {init};
})();

const PWAInstall = (() => {
  let deferredInstallPrompt = null;
  const banner = document.getElementById('pwa-banner');
  const installBtn = document.getElementById('pwa-install-btn');
  const dismissBtn = document.getElementById('pwa-dismiss-btn');
  const DISMISS_KEY = 'echovault_pwa_dismissed';
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  function syncStandaloneClass() {
    document.documentElement.classList.toggle('is-standalone', Boolean(isStandalone()));
  }
  function hide() { banner?.classList.remove('show'); }
  function show() { if (!localStorage.getItem(DISMISS_KEY) && !isStandalone() && deferredInstallPrompt) banner?.classList.add('show'); }
  function init() {
    syncStandaloneClass();
    AppEnvironment.applyClasses();
    window.matchMedia('(display-mode: standalone)').addEventListener?.('change', syncStandaloneClass);
    window.addEventListener('resize', AppEnvironment.applyClasses);
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstallPrompt = e; show(); });
    installBtn?.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      hide();
      deferredInstallPrompt = null;
    });
    dismissBtn?.addEventListener('click', () => { localStorage.setItem(DISMISS_KEY, '1'); hide(); });
    window.addEventListener('appinstalled', () => { hide(); deferredInstallPrompt = null; });
    if (isStandalone()) hide();
  }
  return { init };
})();

/* ── BREATH ANIMATION (login) ── */
const BreathAnim = (() => {
  const canvas = document.getElementById('breath-anim-canvas');
  const ctx    = canvas.getContext('2d');
  let phase = 0, raf = null, running = false;

  function start() {
    if (running) return;
    running = true;
    phase = 0;
    tick();
  }

  function tick() {
    if (!running) return;
    ctx.clearRect(0,0,200,200);
    phase += 0.018;
    const cx=100, cy=100;
    const baseR = 38;
    const pulsed = baseR + Math.sin(phase) * 18;
    const alpha  = 0.25 + Math.abs(Math.sin(phase)) * 0.35;

    // Outer soft ring
    for (let i=3; i>=0; i--) {
      const r = pulsed + i*18;
      const a = alpha * (1 - i*0.22);
      const grd = ctx.createRadialGradient(cx,cy,0,cx,cy,r);
      grd.addColorStop(0,'transparent');
      grd.addColorStop(0.7,`rgba(201,168,76,${a*0.5})`);
      grd.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
      ctx.fillStyle = grd; ctx.fill();
    }

    // Core orb
    const cg = ctx.createRadialGradient(cx-10,cy-10,0,cx,cy,pulsed);
    cg.addColorStop(0,`rgba(201,168,76,${0.7+Math.sin(phase)*.2})`);
    cg.addColorStop(0.6,`rgba(201,168,76,${0.35})`);
    cg.addColorStop(1,'transparent');
    ctx.beginPath(); ctx.arc(cx,cy,pulsed,0,Math.PI*2);
    ctx.fillStyle=cg; ctx.fill();

    raf = requestAnimationFrame(tick);
  }

  return {start};
})();

/* ── ONBOARDING ── */
const Onboarding = (() => {
  const overlay = document.getElementById('onboarding');
  const iconEl  = document.getElementById('ob-icon');
  const titleEl = document.getElementById('ob-title');
  const bodyEl  = document.getElementById('ob-body');
  const nextBtn = document.getElementById('ob-next');
  const backBtn = document.getElementById('ob-back');
  const skipBtn = document.getElementById('ob-skip');
  const dots    = [0,1,2,3].map(i => document.getElementById('ob-d'+i));

  const steps = [
    {
      icon:'🌌',
      title:'This is your universe.',
      body:'Everything you feel becomes a memory orb — floating in your own private cosmos. <strong>Nothing is too small. Nothing is too much.</strong>'
    },
    {
      icon:'🫧',
      title:'These are your memories.',
      body:'Each orb holds a feeling, a moment, an intensity. <strong>Tap any orb</strong> to reveal what\'s inside. Drag them around — they drift like emotions do.'
    },
    {
      icon:'✦',
      title:'Tap here to create your first echo.',
      body:'Hit <strong>+ Echo</strong> in the nav above. Choose your mood, set your intensity, write a thought if you want. Or just feel it in silence.'
    },
    {
      icon:'🎭',
      title:'Rituals await you.',
      body:'Explore <strong>Rituals & Artifacts</strong> — your mood receipt, emotion DNA, crash report, and a stress ball for when it all gets too much. This universe is yours.'
    }
  ];

  let current = 0;

  function render() {
    const s = steps[current];
    iconEl.textContent  = s.icon;
    titleEl.textContent = s.title;
    bodyEl.innerHTML    = s.body;
    dots.forEach((d,i) => {
      d.classList.toggle('active', i === current);
      d.classList.toggle('done',   i < current);
    });
    backBtn.style.display = current > 0 ? 'block' : 'none';
    nextBtn.textContent   = current === steps.length-1 ? 'Enter Universe ✦' : 'Next →';
  }

  function start() {
    overlay.classList.add('open');
    current = 0;
    render();
  }

  function finish() {
    overlay.classList.remove('open');
    localStorage.setItem(OB_KEY, '1');
  }

  nextBtn.addEventListener('click', () => {
    if (current < steps.length-1) { current++; render(); }
    else finish();
  });
  backBtn.addEventListener('click', () => {
    if (current > 0) { current--; render(); }
  });
  skipBtn.addEventListener('click', finish);

  return {start};
})();

/* ── COSMOS CANVAS ── */
const Cosmos = (() => {
  const canvas = document.getElementById('cosmos-canvas');
  const ctx    = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function init() {
    resize();
    const max   = window.innerWidth < 600 ? 30 : 52;
    const count = Math.min(max, Math.floor(canvas.width * canvas.height / 20000));
    particles   = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + .35,
        vx:(Math.random()-.5) * .1,
        vy:(Math.random()-.5) * .1,
        a: Math.random() * .5 + .15,
        c: ['#5b8fa8','#7c6fa0','#c9a84c','#7aab6e'][Math.floor(Math.random()*4)]
      });
    }
  }

  function draw() {
    if (state.tabHidden) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellSize = 100;
    const grid = {};
    particles.forEach((p, i) => {
      p.x = (p.x + p.vx + canvas.width)  % canvas.width;
      p.y = (p.y + p.vy + canvas.height) % canvas.height;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.c + Math.floor(p.a*255).toString(16).padStart(2,'0');
      ctx.fill();
      const gx = Math.floor(p.x / cellSize), gy = Math.floor(p.y / cellSize);
      for (let dx=-1;dx<=1;dx++) for (let dy=-1;dy<=1;dy++) {
        const key = `${gx+dx},${gy+dy}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(i);
      }
    });

    const checked = new Set();
    particles.forEach((p1, i) => {
      const gx = Math.floor(p1.x / cellSize), gy = Math.floor(p1.y / cellSize);
      const nearby = grid[`${gx},${gy}`] || [];
      nearby.forEach(j => {
        if (j <= i) return;
        const pk = i + '_' + j;
        if (checked.has(pk)) return;
        checked.add(pk);
        const p2 = particles[j];
        const dx = p1.x - p2.x, dy = p1.y - p2.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          const a = (1 - dist/100) * .05;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(201,168,76,${a})`;
          ctx.lineWidth = .4; ctx.stroke();
        }
      });
    });

    requestAnimationFrame(draw);
  }

  return {init, draw, resize};
})();

/* ── RIPPLE CANVAS ── */
const Ripple = (() => {
  const canvas = document.getElementById('ripple-canvas');
  const ctx    = canvas.getContext('2d');
  let rings = [];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

  function spawn(x, y, color, isVoid = false, intensity = 5) {
    const count = isVoid ? 4 : Math.ceil(intensity / 3);
    for (let i = 0; i < count; i++) {
      rings.push({
        x, y, r: i * 8,
        maxR: isVoid ? 220 + i * 30 : 120 + intensity * 8 + i * 20,
        color, a: 1 - i * 0.15,
        speed: (isVoid ? 1.1 : 1.8 + intensity * 0.08) - i * 0.1,
        isVoid, delay: i * 3
      });
    }
  }

  function tick() {
    if (state.tabHidden) { requestAnimationFrame(tick); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rings = rings.filter(r => r.a > 0.01);
    rings.forEach(ring => {
      if (ring.delay > 0) { ring.delay--; return; }
      ring.r += ring.speed;
      ring.a = Math.max(0, (1 - ring.r / ring.maxR) * (ring.isVoid ? 0.6 : 0.7));
      if (ring.isVoid) {
        for (let i=0; i<3; i++) {
          const rr = ring.r - i * 20;
          if (rr < 0) continue;
          ctx.beginPath(); ctx.arc(ring.x, ring.y, rr, 0, Math.PI*2);
          ctx.strokeStyle = `rgba(74,74,90,${ring.a * .55})`;
          ctx.lineWidth = 1; ctx.stroke();
        }
      } else {
        ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI*2);
        ctx.strokeStyle = ring.color + Math.floor(ring.a * 90).toString(16).padStart(2,'0');
        ctx.lineWidth = 1; ctx.stroke();
      }
    });
    requestAnimationFrame(tick);
  }

  resize(); tick();
  return {spawn, resize};
})();

/* ── CONNECTION CANVAS — glowing lines between similar orbs ── */
const ConnectionCanvas = (() => {
  const canvas = document.getElementById('connection-canvas');
  const ctx    = canvas.getContext('2d');
  let orbData  = [];
  let phase    = 0;
  let animActive = false;

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

  function setOrbs(data) { orbData = data; }

  function render() {
    if (state.currentView !== 'timeline') { animActive = false; return; }
    animActive = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    phase += 0.012;

    const field = document.getElementById('bubble-field');
    if (!field) return;
    const fieldRect = field.getBoundingClientRect();

    for (let i=0; i<orbData.length; i++) {
      for (let j=i+1; j<orbData.length; j++) {
        const a = orbData[i], b = orbData[j];
        if (a.mood !== b.mood) continue;
        const ax = a.x + fieldRect.left, ay = a.y + fieldRect.top;
        const bx = b.x + fieldRect.left, by = b.y + fieldRect.top;
        const dx = ax-bx, dy = ay-by;
        const dist = Math.sqrt(dx*dx+dy*dy);
        const maxDist = 220;
        if (dist > maxDist) continue;
        const alpha = (1 - dist/maxDist) * .22 * (0.7 + 0.3*Math.sin(phase + i));
        const color = MOOD_COLORS[a.mood];
        const grad = ctx.createLinearGradient(ax,ay,bx,by);
        grad.addColorStop(0, color + '00');
        grad.addColorStop(.5, color + Math.floor(alpha*255).toString(16).padStart(2,'0'));
        grad.addColorStop(1, color + '00');
        ctx.beginPath();
        ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4; ctx.stroke();
      }
    }
    requestAnimationFrame(() => { if(state.currentView==='timeline' && !state.tabHidden) render(); else animActive=false; });
  }

  resize();
  return {setOrbs, render, resize};
})();

/* ── BREATHING ── */
const Breathing = (() => {
  let phase = 0;
  function tick() {
    if (!state.tabHidden) {
      phase += 0.008;
      const intensity = state.echoes[0]?.intensity || 5;
      const amp = 0.008 + (intensity / 10) * 0.012;
      const scale = 1 + Math.sin(phase) * amp;
      document.documentElement.style.setProperty('--breath-scale', scale);
    }
    requestAnimationFrame(tick);
  }
  function start() { tick(); }
  return {start};
})();

/* ── WHIP CANVAS ── */
const Whip = (() => {
  const canvas = document.getElementById('whip-canvas');
  const ctx    = canvas.getContext('2d');
  const label  = document.getElementById('whip-idle-label');
  let running  = false;
  let idleMs   = 0, lastTime = Date.now();

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

  function resetIdle() {
    idleMs = 0; running = false;
    label.classList.remove('visible');
    canvas.style.opacity = '0';
  }

  function trigger() {
    if (running) return;
    running = true;
    canvas.style.opacity = '1';
    const cx = canvas.width/2, cy = canvas.height/2;
    let t = 0;
    function frame() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const progress = t/80;
      const alpha = Math.sin(progress*Math.PI) * .6;
      const waveAmp = 40 * Math.sin(progress*Math.PI);
      ctx.beginPath();
      for (let x=0; x<canvas.width; x+=4) {
        const y = cy + Math.sin((x/canvas.width)*Math.PI*4 + t*.1) * waveAmp;
        x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.strokeStyle = `rgba(201,168,76,${alpha*.7})`;
      ctx.lineWidth = 1;
      ctx.shadowColor = 'rgba(201,168,76,.4)'; ctx.shadowBlur = 8;
      ctx.stroke(); ctx.shadowBlur = 0;
      const grd = ctx.createRadialGradient(cx,cy,0,cx,cy,120);
      grd.addColorStop(0,`rgba(201,168,76,${alpha*.08})`); grd.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.arc(cx,cy,120,0,Math.PI*2);
      ctx.fillStyle = grd; ctx.fill();
      t++;
      if (t < 90) requestAnimationFrame(frame);
      else {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        canvas.style.opacity = '0'; running = false;
        setTimeout(resetIdle, 2000);
      }
    }
    frame();
  }

  resize(); resetIdle();
  ['mousemove','keydown','touchstart','click','scroll'].forEach(ev =>
    document.addEventListener(ev, resetIdle, {passive:true}));
  return {trigger, resize};
})();

/* ── SILENCE PARTICLES ── */
const SilenceParticles = (() => {
  const layer = document.getElementById('silence-layer');
  function spawn(silenceLevel) {
    const count = Math.floor(silenceLevel * 2.2);
    for (let i=0; i<count; i++) {
      setTimeout(() => {
        const p = document.createElement('div');
        p.className = 'sil-particle';
        const size = Math.random()*4+1;
        const hue = silenceLevel > 7 ? '124,111,160' : '124,111,160';
        const opacity = 0.4 + (silenceLevel/10)*0.4;
        p.style.cssText = `
          width:${size}px;height:${size}px;
          background:rgba(${hue},${opacity});
          left:${Math.random()*100}%;
          bottom:${Math.random()*40}%;
          animation-duration:${3.5+Math.random()*4}s;
          animation-delay:${Math.random()*0.8}s;
        `;
        layer.appendChild(p);
        setTimeout(() => p.remove(), 8000);
      }, i * 90);
    }
  }
  return {spawn};
})();

/* ── CURSOR AURA (desktop only) ── */
const CursorAura = (() => {
  if (window.innerWidth < 768 || !window.matchMedia('(pointer:fine)').matches) return {update:()=>{}};
  const aura = document.createElement('div');
  aura.style.cssText = `
    position:fixed;width:280px;height:280px;border-radius:50%;
    pointer-events:none;z-index:1;
    background:radial-gradient(circle,rgba(201,168,76,.018) 0%,transparent 70%);
    transform:translate(-50%,-50%);
    transition:background .8s ease, opacity .4s;
    will-change:transform;opacity:0;
  `;
  document.body.appendChild(aura);
  let mx=0,my=0,ax=0,ay=0,raf=null,visible=false;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; if (!visible) { aura.style.opacity='1'; visible=true; } }, {passive:true});
  document.addEventListener('mouseleave', () => { aura.style.opacity='0'; visible=false; });
  function tick() { ax += (mx-ax) * 0.08; ay += (my-ay) * 0.08; aura.style.transform = `translate(${ax-140}px,${ay-140}px)`; raf = requestAnimationFrame(tick); }
  tick();
  function update(mood) { if (!mood) return; const c = MOOD_COLORS[mood]; aura.style.background = `radial-gradient(circle,${c}18 0%,transparent 70%)`; }
  return {update};
})();

/* ── GHOST LAYER ── */
const GhostLayer = (() => {
  const layer = document.getElementById('ghost-layer');
  function spawn(echo) {
    const color = MOOD_COLORS[echo.mood];
    const size  = 60 + echo.intensity * 18;
    const ghost = document.createElement('div');
    ghost.className = 'ghost-memory';
    const dur = 18 + Math.random() * 22;
    const blurAmt = size / 3.5 + echo.intensity * 1.5;
    const baseOpacity = 0.04 + (echo.intensity / 10) * 0.05;
    ghost.style.cssText = `
      left:${Math.random()*80+10}%;
      width:${size}px;height:${size}px;
      background:${color};
      filter:blur(${blurAmt}px);
      opacity:0;
      animation:tideFloat ${dur}s linear infinite;
      animation-delay:${Math.random()*6}s;
      --ghost-opacity:${baseOpacity};
    `;
    layer.appendChild(ghost);
    setTimeout(() => ghost.remove(), (dur+8)*1000);
  }
  function initFromEchoes(echoes) {
    echoes.slice(0,7).forEach((e,i) => setTimeout(() => spawn(e), i*1800));
  }
  return {spawn, initFromEchoes};
})();

/* ── RESIDUE & VOID PULSE ── */
function spawnResidue(x, y, color) {
  const r = document.createElement('div');
  const size = 60 + Math.random()*40;
  r.className = 'residue';
  r.style.cssText = `
    width:${size}px;height:${size}px;
    left:${x-size/2}px;top:${y-size/2}px;
    border:1.5px solid ${color}66;box-shadow:0 0 14px ${color}33;
  `;
  document.body.appendChild(r);
  setTimeout(() => r.remove(), 1500);
}

function spawnVoidPulse(x, y) {
  const size = 80, p = document.createElement('div');
  p.className = 'void-pulse';
  p.style.cssText = `width:${size}px;height:${size}px;left:${x-size/2}px;top:${y-size/2}px;`;
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 2200);
}

/* ── SPARKLE TRAIL ── */
function spawnSparkle(x, y, color) {
  const s = document.createElement('div');
  s.className = 'sparkle';
  const size = 3 + Math.random()*5;
  s.style.cssText = `
    width:${size}px;height:${size}px;
    left:${x-size/2}px;top:${y-size/2}px;
    background:${color};box-shadow:0 0 7px ${color};
  `;
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 800);
}

/* ── PARTICLE BURST ── */
function spawnBurst(x, y, color) {
  for (let i=0; i<14; i++) {
    const el = document.createElement('div');
    el.className = 'residue';
    const angle = (i/14)*Math.PI*2;
    const dist  = 30 + Math.random()*45;
    const size  = 4 + Math.random()*8;
    el.style.cssText = `
      width:${size}px;height:${size}px;
      left:${x + Math.cos(angle)*dist - size/2}px;
      top:${y + Math.sin(angle)*dist - size/2}px;
      background:${color};box-shadow:0 0 12px ${color};
      animation-duration:.9s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
}

/* ── DISSOLVE PARTICLES (orb collapse) ── */
function spawnDissolve(x, y, color) {
  for (let i=0; i<16; i++) {
    const el = document.createElement('div');
    el.className = 'dissolve-particle';
    const angle = (i/16)*Math.PI*2 + Math.random()*.3;
    const dist  = 40 + Math.random()*60;
    const size  = 3 + Math.random()*6;
    const dx = Math.cos(angle)*dist + (Math.random()-.5)*20;
    const dy = Math.sin(angle)*dist + (Math.random()-.5)*20;
    el.style.cssText = `
      width:${size}px;height:${size}px;
      left:${x-size/2}px;top:${y-size/2}px;
      background:${color};box-shadow:0 0 8px ${color}88;
      --dx:${dx}px;--dy:${dy}px;
      animation-duration:${.8+Math.random()*.5}s;
      animation-delay:${Math.random()*.12}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
}

/* ── IDENTITY CORE ── */
const IdentityCore = (() => {
  const canvas = document.getElementById('identity-core-canvas');
  const ctx    = canvas.getContext('2d');
  let phase    = 0, particles = [], rafId = null;

  function update() {
    const w = canvas.width, h = canvas.height;
    const cx = w/2, cy = h/2;

    if (!particles.length || Math.random() < .02) {
      particles = [];
      const mc = {};
      state.echoes.slice(0,20).forEach(e => { mc[e.mood] = (mc[e.mood]||0)+1; });
      const total = state.echoes.length || 1;
      Object.entries(mc).forEach(([mood, count], gi) => {
        const baseAngle = (gi / Object.keys(mc).length) * Math.PI*2;
        for (let k=0; k<Math.min(count*2, 10); k++) {
          const angle = baseAngle + (k/10) * Math.PI*.8 - Math.PI*.4;
          const r     = 30 + (count/total)*40 + Math.random()*25;
          particles.push({
            angle, r, baseAngle, mood,
            speed: 0.004 + Math.random()*0.003,
            size: 1.5 + Math.random()*2.5,
            alpha: 0.55 + Math.random()*.4
          });
        }
      });
      for (let i=0; i<8; i++) {
        const angle = (i/8)*Math.PI*2;
        particles.push({
          angle, r: 8+Math.random()*12, baseAngle:angle, mood:'gold',
          speed:0.008+Math.random()*0.006, size:1+Math.random()*1.5, alpha:.45+Math.random()*.3
        });
      }
    }

    if (state.tabHidden) { rafId = requestAnimationFrame(update); return; }

    ctx.clearRect(0,0,w,h);
    phase += 0.005;

    const domMood = state.echoes.length ? (() => {
      const mc2 = {};
      state.echoes.slice(0,12).forEach(e => mc2[e.mood]=(mc2[e.mood]||0)+1);
      return Object.entries(mc2).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'calm';
    })() : 'calm';
    const domColor = MOOD_COLORS[domMood];
    const grd = ctx.createRadialGradient(cx,cy,0,cx,cy,22);
    grd.addColorStop(0,'rgba(201,168,76,.65)');
    grd.addColorStop(.5,domColor + '44');
    grd.addColorStop(1,'transparent');
    ctx.beginPath(); ctx.arc(cx,cy,22,0,Math.PI*2);
    ctx.fillStyle = grd; ctx.fill();

    const halo = ctx.createRadialGradient(cx,cy,18,cx,cy,28);
    halo.addColorStop(0,'rgba(201,168,76,.1)');
    halo.addColorStop(1,'transparent');
    ctx.beginPath(); ctx.arc(cx,cy,28,0,Math.PI*2);
    ctx.fillStyle = halo; ctx.fill();

    particles.forEach(p => {
      p.angle += p.speed;
      const px = cx + Math.cos(p.angle) * p.r;
      const py = cy + Math.sin(p.angle) * p.r;
      const color = p.mood === 'gold' ? '#c9a84c' : MOOD_COLORS[p.mood] || '#c9a84c';
      ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI*2);
      ctx.fillStyle = color + Math.floor(p.alpha*255).toString(16).padStart(2,'0');
      ctx.fill();
    });

    rafId = requestAnimationFrame(update);
  }

  update();
  return {update};
})();

/* ── IDENTITY ORB ── */
const IdentityOrb = (() => {
  const canvas = document.getElementById('identity-orb');
  const ctx    = canvas.getContext('2d');
  let phase    = 0;

  function update() {
    const w = canvas.width, h = canvas.height, cx = w/2, cy = h/2;
    ctx.clearRect(0,0,w,h);
    if (!state.echoes.length) {
      const grd = ctx.createRadialGradient(cx,cy,0,cx,cy,30);
      grd.addColorStop(0,'rgba(201,168,76,.4)'); grd.addColorStop(1,'rgba(201,168,76,0)');
      ctx.beginPath(); ctx.arc(cx,cy,30,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
      return;
    }
    const mc = {};
    state.echoes.slice(0,12).forEach(e => { mc[e.mood]=(mc[e.mood]||0)+1; });
    Object.entries(mc).forEach(([mood,count],i) => {
      const color = MOOD_COLORS[mood];
      const angle = (i/Object.keys(mc).length)*Math.PI*2 + phase;
      const ox = cx + Math.cos(angle)*7, oy = cy + Math.sin(angle)*7;
      const r  = 18 + count*4;
      const grd = ctx.createRadialGradient(ox,oy,0,ox,oy,r);
      grd.addColorStop(0,color+'cc'); grd.addColorStop(1,color+'00');
      ctx.beginPath(); ctx.arc(ox,oy,r,0,Math.PI*2);
      ctx.fillStyle=grd; ctx.fill();
    });
    phase += .003;
  }

  function tick() {
    if (!state.tabHidden) update();
    requestAnimationFrame(tick);
  }
  tick();
  return {update};
})();

/* ── INTERACTIVE ORBS (physics + drift + collapse) ── */
const OrbInteraction = (() => {
  let orbs = [];
  let dragOrb = null;
  let dragOffX = 0, dragOffY = 0;
  let animId = null;

  function register(el, x, y, size, color, id) {
    const orb = { el, x, y, vx:(Math.random()-.5)*.4, vy:(Math.random()-.5)*.4,
      baseX:x, baseY:y, size, color, id, held:false, lastTap:0, tapCount:0,
      scale:1, targetScale:1, pressed:false,
      driftPhase: Math.random()*Math.PI*2,
      driftSpeed: 0.003 + Math.random()*0.003 };
    orbs.push(orb);

    el.addEventListener('pointerdown', e => onDown(e, orb), {passive:true});
    el.addEventListener('dblclick',    e => onDblClick(e, orb));
    return orb;
  }

  function onDown(e, orb) {
    dragOrb = orb;
    dragOffX = e.clientX - orb.x;
    dragOffY = e.clientY - orb.y;
    orb.held = true;
    orb.pressed = true;
    orb.targetScale = 0.87;
    orb.vx = 0; orb.vy = 0;
    el_setTransform(orb);

    orb._holdTimer = setTimeout(() => {
      if (orb.held) { orb.targetScale = 0.72; }
    }, 400);

    const upFn = () => {
      clearTimeout(orb._holdTimer);
      orb.held = false; orb.pressed = false;
      dragOrb = null;
      const now = Date.now();
      if (now - orb.lastTap < 300) { orb.tapCount++; } else { orb.tapCount = 1; }
      orb.lastTap = now;
      orb.targetScale = 1.14;
      setTimeout(() => { orb.targetScale = 1; }, 220);
      const angle = Math.atan2(orb.vy, orb.vx) || Math.random()*Math.PI*2;
      orb.vx += Math.cos(angle)*1.5;
      orb.vy += Math.sin(angle)*1.5;
      document.removeEventListener('pointerup', upFn);
      document.removeEventListener('pointermove', moveFn);
    };
    const moveFn = (ev) => {
      if (!orb.held) return;
      const tx = ev.clientX - dragOffX;
      const ty = ev.clientY - dragOffY;
      orb.vx += (tx - orb.x) * 0.18;
      orb.vy += (ty - orb.y) * 0.18;
      orb.vx *= 0.6; orb.vy *= 0.6;
      if (Math.random() < .15) spawnSparkle(ev.clientX, ev.clientY, orb.color);
    };
    document.addEventListener('pointerup',   upFn,   {once:true});
    document.addEventListener('pointermove', moveFn, {passive:true});
  }

  function onDblClick(e, orb) {
    const rect = orb.el.getBoundingClientRect();
    spawnBurst(rect.left+rect.width/2, rect.top+rect.height/2, orb.color);
    orb.targetScale = 1.28;
    setTimeout(() => orb.targetScale = 1, 360);
  }

  function el_setTransform(orb) {
    orb.el.style.left = (orb.x - orb.size/2) + 'px';
    orb.el.style.top  = (orb.y - orb.size/2) + 'px';
    const bubble = orb.el.querySelector('.echo-bubble');
    if (bubble) {
      bubble.style.transform = `scale(${orb.scale})`;
      bubble.style.transition = orb.held ? 'transform .1s' : 'transform .35s var(--ease)';
    }
  }

  function checkMerge() {
    for (let i=0; i<orbs.length; i++) {
      for (let j=i+1; j<orbs.length; j++) {
        const a = orbs[i], b = orbs[j];
        if (a.held || b.held) continue;
        const dx = a.x-b.x, dy = a.y-b.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        const minD = (a.size+b.size)*0.3;
        if (dist < minD) {
          const force = (minD-dist)/minD * 0.8;
          const nx = dx/dist||0, ny = dy/dist||0;
          a.vx += nx*force; a.vy += ny*force;
          b.vx -= nx*force; b.vy -= ny*force;
        }
      }
    }
  }

  function tick() {
    const field = document.getElementById('bubble-field');
    if (!field || state.currentView !== 'timeline') {
      animId = requestAnimationFrame(tick); return;
    }
    const fw = field.offsetWidth, fh = field.offsetHeight;
    const rect = field.getBoundingClientRect();

    if (!state.tabHidden) {
      const t = Date.now() * 0.0005;
      orbs.forEach(orb => {
        if (orb.held) return;
        orb.vx *= 0.97; orb.vy *= 0.97;
        // Gentle drift using per-orb phase
        orb.driftPhase += orb.driftSpeed;
        orb.vx += Math.sin(orb.driftPhase * 0.7) * 0.014;
        orb.vy += Math.cos(orb.driftPhase * 0.5) * 0.014;
        orb.x += orb.vx; orb.y += orb.vy;
        const r = orb.size/2 + 4;
        if (orb.x - r < 0)     { orb.x = r;    orb.vx *= -.55; }
        if (orb.x + r > fw)    { orb.x = fw-r; orb.vx *= -.55; }
        if (orb.y - r < 0)     { orb.y = r;    orb.vy *= -.55; }
        if (orb.y + r > fh)    { orb.y = fh-r; orb.vy *= -.55; }
        orb.scale += (orb.targetScale - orb.scale) * 0.15;
        el_setTransform(orb);
      });
      checkMerge();
      ConnectionCanvas.setOrbs(orbs.map(o => ({x:o.x, y:o.y, mood:o._mood})));
    }
    animId = requestAnimationFrame(tick);
  }

  function clear() { orbs = []; if(animId) cancelAnimationFrame(animId); }
  function start() { tick(); }

  start();
  return {register, clear};
})();

/* ── ENTRY FORM ── */
const EntryForm = (() => {
  let voidMode = false, selectedMood = null;
  const intensitySlider = document.getElementById('intensity-slider');
  const intensityVal    = document.getElementById('intensity-val');
  const silenceSlider   = document.getElementById('silence-slider');
  const silenceVal      = document.getElementById('silence-val');
  const thoughtInput    = document.getElementById('thought-input');
  const voidToggle      = document.getElementById('void-toggle');
  const formWrap        = document.getElementById('entry-form-wrap');
  const confirmEl       = document.getElementById('echo-confirm');

  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedMood = btn.dataset.mood;
      CursorAura.update(selectedMood);
      const rect = btn.getBoundingClientRect();
      spawnResidue(rect.left+rect.width/2, rect.top+rect.height/2, MOOD_COLORS[selectedMood]);
    });
  });

  intensitySlider.addEventListener('input', function() {
    intensityVal.textContent = this.value;
    this.setAttribute('aria-valuenow', this.value);
  });
  silenceSlider.addEventListener('input', function() {
    silenceVal.textContent = this.value;
    this.setAttribute('aria-valuenow', this.value);
    if (parseInt(this.value) >= 7) SilenceParticles.spawn(parseInt(this.value));
  });

  function toggleVoid() {
    voidMode = !voidMode;
    voidToggle.classList.toggle('active', voidMode);
    voidToggle.setAttribute('aria-checked', voidMode);
    thoughtInput.disabled = voidMode;
    thoughtInput.style.opacity = voidMode ? '.3' : '1';
    if (voidMode) thoughtInput.value = '';
  }
  voidToggle.addEventListener('click', toggleVoid);
  voidToggle.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleVoid();}});

  document.getElementById('submit-btn').addEventListener('click', submit);

  function submit() {
    if (!selectedMood) {
      const grid = document.querySelector('.mood-grid');
      grid.style.transition = 'none';
      grid.style.transform  = 'translateX(-5px)';
      setTimeout(() => { grid.style.transform = 'translateX(5px)'; setTimeout(() => { grid.style.transform=''; grid.style.transition=''; }, 80); }, 80);
      Toast.show('Choose an emotional resonance first.');
      return;
    }
    const echo = {
      id: Date.now(),
      mood: selectedMood,
      intensity: parseInt(intensitySlider.value),
      silence:   parseInt(silenceSlider.value),
      thought:   voidMode ? null : thoughtInput.value.trim() || null,
      void:      voidMode,
      date:      new Date().toISOString()
    };
    state.echoes.unshift(echo);
    Storage.save(state.echoes);
    const discoveredMaterials = MaterialEngine.generateForEcho(echo);
    VaultInventory.addMaterials(discoveredMaterials);
    MaterialEngine.toast(discoveredMaterials);
    MaterialEngine.showMaterialBurst(discoveredMaterials);
    EchoAvatar.addXP?.(5, 'create echo');
    GentleQuests.evaluate('echo_created', echo);
    VaultRooms.evaluate?.();

    const cx = window.innerWidth/2, cy = window.innerHeight/2;
    Ripple.spawn(cx, cy, MOOD_COLORS[echo.mood], echo.void, echo.intensity);
    if (echo.void) spawnVoidPulse(cx, cy);
    spawnBurst(cx, cy, MOOD_COLORS[echo.mood]);
    GhostLayer.spawn(echo);
    SilenceParticles.spawn(echo.silence);
    refreshEchoDependentUI();
    RandomReflection.maybeSurface();

    const confirmCanvas = document.getElementById('confirm-orb');
    const cCtx = confirmCanvas.getContext('2d');
    const cc = 50, color = MOOD_COLORS[echo.mood];
    cCtx.clearRect(0,0,100,100);
    const grd = cCtx.createRadialGradient(cc,cc,0,cc,cc,cc);
    grd.addColorStop(0,color+'ee'); grd.addColorStop(1,color+'00');
    cCtx.beginPath(); cCtx.arc(cc,cc,cc,0,Math.PI*2);
    cCtx.fillStyle = grd; cCtx.fill();
    document.getElementById('confirm-sub').textContent = {
      calm:'A pocket of stillness, preserved forever.',
      chaos:'Your electric charge — crystallized.',
      reflective:'A mirror of your inner world, kept safe.',
      anxious:'The trembling, held gently in glass.',
      joyful:'Sunlight, caught and kept.',
      empty:'The silence, honored and real.'
    }[echo.mood] || 'Your feeling has been woven into the universe.';

    formWrap.style.display = 'none';
    confirmEl.classList.add('show');
  }

  function reset() {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    selectedMood = null; voidMode = false;
    intensitySlider.value = '5'; intensityVal.textContent = '5';
    silenceSlider.value   = '3'; silenceVal.textContent   = '3';
    thoughtInput.value = ''; thoughtInput.disabled = false; thoughtInput.style.opacity = '1';
    voidToggle.classList.remove('active'); voidToggle.setAttribute('aria-checked','false');
    formWrap.style.display = 'block'; confirmEl.classList.remove('show');
  }

  document.getElementById('new-echo-btn').addEventListener('click', () => { reset(); Nav.show('entry'); });
  return {reset};
})();

/* ── TIMELINE / BUBBLE SYSTEM ── */
const Timeline = (() => {
  const field    = document.getElementById('bubble-field');
  const emptyEl  = document.getElementById('timeline-empty');
  const subtitle = document.getElementById('timeline-subtitle');
  let focusedId  = null;

  function render() {
    field.innerHTML = '';
    OrbInteraction.clear();

    if (!state.echoes.length) {
      emptyEl.style.display = 'block'; field.style.display = 'none'; return;
    }
    emptyEl.style.display = 'none'; field.style.display = 'block';
    subtitle.textContent = `${state.echoes.length} echo${state.echoes.length!==1?'s':''} in your cosmos`;

    const fieldW = field.offsetWidth || window.innerWidth - 64;
    const fieldH = Math.max(560, state.echoes.length * 34);
    field.style.height = fieldH + 'px';

    const placed = [];

    state.echoes.forEach((echo, i) => {
      const color    = MOOD_COLORS[echo.mood];
      const baseSize = 74 + echo.intensity * 5;
      const ageFactor = Math.max(.5, 1 - i * .025);
      const size     = Math.round(baseSize * ageFactor);

      let x, y, tries = 0;
      do {
        x = Math.random() * (fieldW - size - 12) + size/2;
        y = Math.random() * (fieldH - size - 12) + size/2;
        tries++;
      } while (tries < 30 && placed.some(p => {
        const dx = p.x-x, dy = p.y-y;
        return Math.sqrt(dx*dx+dy*dy) < (p.r+size/2+14);
      }));
      placed.push({x, y, r:size/2, mood:echo.mood});

      // Gravity ring for top 3
      if (i < 3) {
        const ring = document.createElement('div');
        ring.className = 'gravity-ring';
        ring.style.cssText = `
          width:${size*2.3}px;height:${size*2.3}px;
          left:${x-size*1.15}px;top:${y-size*1.15}px;
          animation-delay:${i*.4}s;
        `;
        field.appendChild(ring);
      }

      const wrap = document.createElement('div');
      wrap.className = 'bubble-wrap';
      wrap.dataset.id = echo.id;
      wrap.style.cssText = `left:${x-size/2}px;top:${y-size/2}px;width:${size}px;height:${size}px;`;

      const shadow = document.createElement('div');
      shadow.className = 'bubble-shadow';
      shadow.style.background = `radial-gradient(circle, ${color}66, transparent 70%)`;

      const bubble = document.createElement('div');
      bubble.className = 'echo-bubble';
      const floatIdx = i % 3;
      const opacity  = Math.max(.45, ageFactor);
      const depthScale = 0.87 + (ageFactor * 0.13);
      bubble.style.cssText = `
        width:${size}px;height:${size}px;
        background:radial-gradient(circle at 32% 32%, ${color}e0, ${color}60);
        box-shadow:0 0 ${echo.intensity*5}px ${color}55,inset 0 1px 0 rgba(255,255,255,.22);
        opacity:${opacity};
        animation:bubbleFloat${floatIdx} ${3+i%3}s ease-in-out infinite;
        animation-delay:${(i%8)*.25}s;
        transform:scale(${depthScale});
        transform-origin:center;
      `;
      if (i > 8) bubble.style.filter = `blur(${Math.min(2,(i-8)*.22)}px)`;

      bubble.innerHTML = `
        <div class="node-int">${echo.intensity}</div>
        <div class="node-mood">${echo.mood}</div>
        <div class="node-date">${formatDateShort(echo.date)}</div>
      `;

      wrap.appendChild(shadow);
      wrap.appendChild(bubble);

      wrap.addEventListener('click', (e) => {
        if (Math.abs(e.movementX||0) > 5 || Math.abs(e.movementY||0) > 5) return;
        const rect = wrap.getBoundingClientRect();
        spawnResidue(rect.left+rect.width/2, rect.top+rect.height/2, color);
        if (echo.void) spawnVoidPulse(rect.left+rect.width/2, rect.top+rect.height/2);
        openDetail(echo);
        handleFocus(wrap);
      });

      field.appendChild(wrap);

      const orb = OrbInteraction.register(wrap, x, y, size, color, echo.id);
      orb._mood = echo.mood;
    });

    // Feed connection canvas
    ConnectionCanvas.setOrbs(placed.map(p => ({x:p.x, y:p.y, mood:p.mood})));
    ConnectionCanvas.render();

    document.getElementById('timeline-tide-label').textContent =
      (() => { const h = new Date().getHours(); return (h>=22||h<5)?'🌊 memory tide active':''; })();
  }

  function handleFocus(clickedWrap) {
    const allWraps = field.querySelectorAll('.bubble-wrap');
    if (focusedId === clickedWrap.dataset.id) {
      allWraps.forEach(w => w.classList.remove('faded','focused'));
      focusedId = null;
    } else {
      allWraps.forEach(w => {
        w.classList.toggle('faded',  w !== clickedWrap);
        w.classList.toggle('focused', w === clickedWrap);
      });
      focusedId = clickedWrap.dataset.id;
    }
  }

  function openDetail(echo) {
    const panel = document.getElementById('node-detail');
    const color = MOOD_COLORS[echo.mood];
    document.getElementById('detail-badge').textContent = `${MOOD_EMOJIS[echo.mood]} ${echo.mood}`;
    document.getElementById('detail-badge').style.background = color;
    document.getElementById('detail-int').textContent = echo.intensity;
    document.getElementById('detail-int').style.color = color;
    const thoughtEl = document.getElementById('detail-thought');
    if (echo.void || !echo.thought) {
      thoughtEl.innerHTML = '<span class="detail-void-note">[ void entry — no words, only feeling ]</span>';
    } else {
      thoughtEl.textContent = `"${echo.thought}"`;
    }
    const silence = echo.silence || 1;
    document.getElementById('detail-meta').innerHTML = `
      ${formatDate(echo.date)}<br>
      Silence level: ${silence}/10 · ${echo.void ? 'void mode' : 'spoken'}
    `;
    panel.classList.add('open');
  }

  return {render};
})();

/* ── WRAPPED ── */
const Wrapped = (() => {
  const contentEl = document.getElementById('wrapped-content');
  const emptyEl   = document.getElementById('wrapped-empty');

  function filterEchoes() {
    if (state.wrappedPeriod==='week')  return state.echoes.filter(e=>Date.now()-new Date(e.date)<7*86400000);
    if (state.wrappedPeriod==='month') return state.echoes.filter(e=>Date.now()-new Date(e.date)<30*86400000);
    return state.echoes;
  }

  function render() {
    const filtered = filterEchoes();
    if (!filtered.length) {
      emptyEl.style.display='block'; contentEl.style.display='none'; return;
    }
    emptyEl.style.display='none'; contentEl.style.display='block';
    const patterns = PatternEngine.analyze(filtered);
    const archetype = ArchetypeEngine.compute(patterns);
    const moodCounts = patterns.moodCounts || {};
    const sorted = Object.entries(moodCounts).sort((a,b)=>b[1]-a[1]);
    const dominant = patterns.dominantMood || sorted[0]?.[0] || 'reflective';
    const chaos = Math.round(((moodCounts.chaos||0)+(moodCounts.anxious||0))/Math.max(1,filtered.length)*100);

    contentEl.innerHTML = `
      <div class="wrapped-card">
        <div class="wrapped-card-title">Emotional Palette</div>
        <div class="palette-wrap">
          ${sorted.map(([mood,count])=>`
            <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
              <div class="palette-swatch" style="background:${MOOD_COLORS[mood]}"></div>
              <div style="font-family:var(--font-mono);font-size:8px;color:var(--muted);text-transform:uppercase;margin-top:22px">${mood}</div>
              <div style="font-family:var(--font-mono);font-size:8px;color:var(--gold)">${count}×</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="wrapped-card">
        <div class="wrapped-card-title">By The Numbers</div>
        <div class="stat-row">
          <div class="stat-item"><div class="stat-value">${filtered.length}</div><div class="stat-label">Echoes</div></div>
          <div class="stat-item"><div class="stat-value">${patterns.averageIntensity}</div><div class="stat-label">Avg Intensity</div></div>
          <div class="stat-item"><div class="stat-value">${patterns.averageSilence}</div><div class="stat-label">Avg Silence</div></div>
          <div class="stat-item"><div class="stat-value" style="color:${MOOD_COLORS[dominant]};font-size:20px">${dominant}</div><div class="stat-label">Dominant</div></div>
          <div class="stat-item"><div class="stat-value">${patterns.voidCount}</div><div class="stat-label">Void Entries</div></div>
        </div>
      </div>
      <div class="wrapped-card">
        <div class="wrapped-card-title">Stability / Chaos Balance</div>
        <div class="balance-bar"><div class="balance-fill" style="width:${chaos}%"></div></div>
        <div class="balance-labels"><span>stability ${100-chaos}%</span><span>${chaos}% chaos</span></div>
        <p style="font-size:15px;font-style:italic;color:var(--muted);margin-top:14px;line-height:1.7">
          ${chaos<20?'You moved through this period with quiet steadiness.':
            chaos<50?'A balanced mix of turbulence and calm.':
            chaos<75?'The winds were strong. You stayed upright.':
            "Storms and more storms. You're still here. That's everything."}
        </p>
      </div>
      <div class="wrapped-card">
        <div class="wrapped-card-title">Recurring Patterns · ${patterns.emotionalWeather}</div>
        <ul class="pattern-list">
          ${sorted.slice(0,5).map(([mood,count])=>`
            <li class="pattern-item">
              <div class="pattern-dot" style="background:${MOOD_COLORS[mood]}"></div>
              <div class="pattern-name">${MOOD_EMOJIS[mood]} ${mood}</div>
              <div class="pattern-count">${count} time${count!==1?'s':''}</div>
            </li>`).join('')}
        </ul>
      </div>
      <div class="wrapped-card" style="text-align:center">
        <div class="wrapped-card-title">Identity Snapshot</div>
        <div style="font-family:var(--font-editorial);font-size:28px;color:var(--gold);margin-bottom:8px">${getArchetype(moodCounts)}</div>
        <p style="font-size:15px;font-style:italic;color:var(--muted);line-height:1.7">${archetype.archetypeDescription}</p>
        <p style="font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">streak: ${patterns.currentStreakMood || '—'} × ${patterns.currentStreakCount || 0} · volatility ${patterns.volatilityScore}</p>
        <p style="font-size:14px;color:var(--text);margin-top:8px">${patterns.oneLineInsight || 'You kept returning. That counts.'}</p>
      </div>`;
  }

  return {render};
})();

/* ── WEATHER ── */
const Weather = (() => {
  function update() {
    const h = new Date().getHours();
    const recent = state.echoes.slice(0,7);
    if (!recent.length) {
      const tw = h<6?['🌑','The void hour. Deep stillness.']:h<12?['🌤','Morning potential.']:h<17?['☀️','Midday clarity.']:h<21?['🌆','Golden hour feelings.']:['🌙','Night reflections.'];
      document.getElementById('weather-emoji').textContent = tw[0];
      document.getElementById('weather-text').textContent  = tw[1];
      return;
    }
    const mc = {}; let si = 0;
    recent.forEach(e => { mc[e.mood]=(mc[e.mood]||0)+1; si+=e.intensity; });
    const dom = Object.entries(mc).sort((a,b)=>b[1]-a[1])[0][0];
    const avg = si/recent.length;
    const map = {
      calm: avg>7 ? ['🌊','Deep ocean calm — an almost sacred stillness.']
                  : avg>4 ? ['🌫️','Soft fog. The kind that muffles the world kindly.']
                  : ['🌤','Quiet skies. Your breathing is the loudest thing.'],
      chaos: avg>7 ? ['⛈️',"Full electrical storm. You're magnificent in it."]
                   : avg>4 ? ['🌩️','Thunder thinking. The static before the strike.']
                   : ['💨','Restless air. Something is circling.'],
      reflective: avg>6 ? ['🌘','Deep lunar. The kind of night made for becoming.']
                        : ['🌙','Reflective skies. The inward horizon is clear.'],
      anxious: avg>7 ? ['🌀','Spiraling turbulence. You are weathering this.']
                     : avg>4 ? ['🫁','Shallow air. Your body knows before your mind does.']
                     : ['💨','A low restlessness. Present, but manageable.'],
      joyful: avg>7 ? ['✨','Radiant skies. Light bending just for you today.']
                    : ['🌸','Warm and flowering. A rare atmospheric softness.'],
      empty: avg>6 ? ['🌑','The absolute dark. Curiously weightless in it.']
                   : ['🌒','The edge of the void. Moon barely showing.']
    };
    const w = map[dom]||['☁️','Processing…'];
    document.getElementById('weather-emoji').textContent = w[0];
    document.getElementById('weather-text').textContent  = w[1];
  }
  return {update};
})();

/* ── RANDOM REFLECTION DROP ── */
const RandomReflection = (() => {
  let el = null;

  function maybeSurface() {
    if (!state.echoes.length || state.echoes.length < 2) return;
    if (Math.random() > 0.4) return;
    const latest = state.echoes[0];
    const similar = state.echoes.slice(1).filter(e => e.mood === latest.mood);
    if (!similar.length) return;
    const past = similar[Math.floor(Math.random()*similar.length)];
    show(past);
  }

  function show(echo) {
    remove();
    el = document.createElement('div');
    el.className = 'reflection-drop';
    el.innerHTML = `
      <button class="reflection-drop-close" aria-label="Dismiss">×</button>
      <div class="reflection-drop-label">✦ past resonance — ${formatDateShort(echo.date)}</div>
      <div class="reflection-drop-text">${echo.thought ? `"${echo.thought.substring(0,80)}${echo.thought.length>80?'…':''}"` : `A ${echo.mood} moment, intensity ${echo.intensity}.`}</div>
    `;
    document.body.appendChild(el);
    el.querySelector('.reflection-drop-close').addEventListener('click', remove);
    el.addEventListener('click', () => { Nav.show('timeline'); remove(); });
    setTimeout(remove, 8000);
  }

  function remove() {
    if (el) { el.remove(); el = null; }
  }

  return {maybeSurface};
})();

/* ── MIDNIGHT MODE ── */
const MidnightMode = (() => {
  const hintEl = document.getElementById('midnight-hint');
  function check() {
    const h = new Date().getHours();
    const on = h >= 22 || h < 4;
    document.body.classList.toggle('midnight', on);
    hintEl.textContent = on ? '🌙 midnight mind — the honest hour' : '';
  }
  check(); setInterval(check, 60000);
  return {check};
})();

/* ── SHATTER SOFTLY ── */
const ShatterSoftly = (() => {
  let canvas, ctx, cracks = [], shattered = false, tapCount = 0;
  const W = 240, H = 240;

  function init() {
    canvas = document.getElementById('shatter-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    cracks = []; shattered = false; tapCount = 0;
    draw();

    canvas.addEventListener('pointerdown', onTap);
    canvas.addEventListener('touchstart', e => e.preventDefault(), {passive:false});

    document.getElementById('shatter-reset-btn')?.addEventListener('click', () => {
      cracks = []; shattered = false; tapCount = 0;
      document.getElementById('shatter-aftermath').classList.remove('show');
      document.getElementById('shatter-hint').style.display = '';
      draw();
    });
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    // Object surface — ceramic plate look
    const progress = Math.min(tapCount / 12, 1);
    const surfaceAlpha = 0.92 - progress * 0.3;

    // Background glow
    const glow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.52);
    glow.addColorStop(0, `rgba(200,190,255,${0.06 - progress*0.04})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Main plate
    const plateGrd = ctx.createRadialGradient(W/2 - 20, H/2 - 20, 0, W/2, H/2, W * 0.44);
    plateGrd.addColorStop(0, `rgba(230,225,245,${surfaceAlpha})`);
    plateGrd.addColorStop(0.55, `rgba(200,195,225,${surfaceAlpha * 0.9})`);
    plateGrd.addColorStop(1, `rgba(160,150,200,${surfaceAlpha * 0.7})`);
    ctx.beginPath();
    ctx.ellipse(W/2, H/2, 90, 85, -0.1, 0, Math.PI * 2);
    ctx.fillStyle = plateGrd;
    ctx.fill();

    // Plate rim
    ctx.beginPath();
    ctx.ellipse(W/2, H/2, 90, 85, -0.1, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${0.35 - progress * 0.2})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner highlight
    ctx.beginPath();
    ctx.ellipse(W/2 - 18, H/2 - 18, 38, 32, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.18 - progress * 0.12})`;
    ctx.fill();

    // Draw cracks
    cracks.forEach(crack => {
      drawCrack(crack);
    });

    // Shatter dissolve
    if (shattered) {
      drawShatter();
    }
  }

  function drawCrack(crack) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(crack.x, crack.y);
    let cx = crack.x, cy = crack.y;
    crack.segments.forEach(seg => {
      cx += seg.dx; cy += seg.dy;
      ctx.lineTo(cx, cy);
    });
    const alpha = 0.6 + crack.depth * 0.2;
    ctx.strokeStyle = `rgba(80,60,120,${alpha})`;
    ctx.lineWidth = 0.8 + crack.depth * 0.4;
    ctx.shadowColor = 'rgba(100,80,160,0.5)';
    ctx.shadowBlur = 3;
    ctx.stroke();
    ctx.restore();

    // Branch cracks
    if (crack.branches) {
      crack.branches.forEach(b => drawCrack(b));
    }
  }

  function drawShatter() {
    const progress = Math.min((Date.now() - shattered) / 2200, 1);
    // Fragments drifting and fading
    cracks.slice(0, 8).forEach((crack, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const drift = progress * (30 + i * 8);
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - progress * 1.3);
      ctx.translate(
        W/2 + Math.cos(angle) * drift,
        H/2 + Math.sin(angle) * drift
      );
      ctx.rotate(angle * 0.3 + progress * 0.5);
      const size = 18 - progress * 14;
      if (size > 0) {
        const fg = ctx.createRadialGradient(0,0,0,0,0,size);
        fg.addColorStop(0, 'rgba(210,205,240,0.9)');
        fg.addColorStop(1, 'rgba(180,170,220,0.3)');
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fillStyle = fg;
        ctx.fill();
      }
      ctx.restore();
    });
    if (progress < 1) requestAnimationFrame(draw);
  }

  function makeCrack(ox, oy, depth, spread) {
    const segs = [];
    let angle = Math.random() * Math.PI * 2;
    const len = 18 + Math.random() * 24;
    const steps = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < steps; i++) {
      angle += (Math.random() - 0.5) * 0.7;
      const segLen = len / steps;
      segs.push({ dx: Math.cos(angle) * segLen, dy: Math.sin(angle) * segLen });
    }
    const crack = { x: ox, y: oy, segments: segs, depth: depth || 1 };
    if (depth < 2 && Math.random() > 0.4) {
      const branchCount = 1 + Math.floor(Math.random() * 2);
      crack.branches = [];
      for (let b = 0; b < branchCount; b++) {
        const prog = Math.floor(Math.random() * segs.length);
        let bx = ox, by = oy;
        for (let s = 0; s < prog; s++) { bx += segs[s].dx; by += segs[s].dy; }
        crack.branches.push(makeCrack(bx, by, depth + 1, spread * 0.6));
      }
    }
    return crack;
  }

  function onTap(e) {
    if (shattered) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Only crack within the plate area
    const dx = px - W/2, dy = py - H/2;
    const inPlate = (dx*dx)/(90*90) + (dy*dy)/(85*85) <= 1.2;

    if (!inPlate) {
      // Still add a crack from center direction
      const angle = Math.atan2(dy, dx);
      const ex = W/2 + Math.cos(angle) * 60, ey = H/2 + Math.sin(angle) * 60;
      cracks.push(makeCrack(ex, ey, 1));
    } else {
      cracks.push(makeCrack(px, py, 1));
      // Extra cracks from center for held taps
      if (tapCount > 4) {
        const angle2 = Math.random() * Math.PI * 2;
        const r = Math.random() * 50;
        cracks.push(makeCrack(W/2 + Math.cos(angle2)*r, H/2 + Math.sin(angle2)*r, 1));
      }
    }

    tapCount++;
    const hint = document.getElementById('shatter-hint');
    if (hint) {
      if (tapCount === 1) hint.textContent = 'keep going…';
      else if (tapCount < 5) hint.textContent = 'let it crack…';
      else if (tapCount < 10) hint.textContent = 'almost…';
      else hint.textContent = 'one more…';
    }

    draw();

    if (tapCount >= 12) {
      triggerShatter();
    }
  }

  function triggerShatter() {
    shattered = Date.now();
    const hint = document.getElementById('shatter-hint');
    if (hint) hint.style.display = 'none';
    draw();
    setTimeout(() => {
      ctx.clearRect(0, 0, W, H);
      const aftermath = document.getElementById('shatter-aftermath');
      if (aftermath) aftermath.classList.add('show');
      // Show song suggestion
      const songEl = document.getElementById('shatter-song-here');
      if (songEl) {
        const mood = state.echoes[0]?.mood || 'reflective';
        const tracks = SOUNDPRINTS[mood];
        const track = tracks[Math.floor(Math.random() * tracks.length)];
        const color = MOOD_COLORS[mood];
        songEl.innerHTML = `
          <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin-bottom:14px;opacity:.8">✦ something to listen to</div>
          <div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;overflow:hidden;display:flex;align-items:stretch;max-width:380px;margin:0 auto">
            <div style="width:64px;flex-shrink:0;background:linear-gradient(135deg,${color}55,${color}18);display:flex;align-items:center;justify-content:center;font-size:28px">${MOOD_COVER_EMOJI[mood]}</div>
            <div style="padding:14px 16px;flex:1;text-align:left">
              <div style="font-size:15px;color:var(--text);font-weight:600;margin-bottom:2px">${track.song}</div>
              <div style="font-family:var(--font-mono);font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">${track.artist}</div>
              <div style="display:flex;gap:8px">
                <a href="${track.spotify}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:20px;font-family:var(--font-mono);font-size:9px;text-decoration:none;letter-spacing:.08em;color:#1db954;border:1px solid rgba(29,185,84,.45);background:rgba(29,185,84,.1)">▶ Spotify</a>
                <a href="${track.youtube}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:20px;font-family:var(--font-mono);font-size:9px;text-decoration:none;letter-spacing:.08em;color:#ff5555;border:1px solid rgba(255,68,68,.4);background:rgba(255,68,68,.08)">▶ YouTube</a>
              </div>
            </div>
          </div>`;
      }
    }, 2200);
  }

  return { init };
})();

const ReceiptRenderer = (() => {
  const RECEIPT_CLASSES = {
    calm:'Stillwater Class', chaos:'Storm Class', reflective:'Moon Archive Class',
    anxious:'Compass Class', joyful:'Bloom Class', empty:'Void Class'
  };
  function makeBarcode(seed='') {
    return seed.split('').map((c,i)=>(c.charCodeAt(0)+i)%2?'|':'¦').join('').padEnd(26,'|').slice(0,26);
  }
  function vaultHolderName() {
    try {
      const profileName = ProfileStore.read()?.display_name;
      const emailPrefix = Auth.user?.email ? Auth.user.email.split('@')[0] : '';
      const localName = localStorage.getItem(USER_KEY);
      return [profileName, emailPrefix, localName].map(v => String(v || '').trim()).find(Boolean) || 'Local Voyager';
    } catch(e) {
      return 'Local Voyager';
    }
  }
  function syncState() {
    if (Auth.user) return 'Profile Synced';
    const canSync = typeof Auth.hasSupabase === 'function' ? Auth.hasSupabase() : Boolean(Auth.hasSupabase);
    return canSync ? 'Sync Ready' : 'Local Vault';
  }
  function getData(mode='latest') {
    const safeMode = mode === 'weekly' ? 'weekly' : 'latest';
    const fallbackP = {
      dominantMood:'reflective', averageIntensity:0, averageSilence:0, totalEchoes:0,
      emotionalWeather:'shifting sky', voidCount:0, oneLineInsight:'You kept returning. That counts.'
    };
    const echoes = Array.isArray(state.echoes) ? state.echoes : [];
    let p = fallbackP;
    let a = { archetypeName:'The Unknown' };
    let latest = echoes[0] || {};
    try { p = { ...fallbackP, ...(PatternEngine.analyze(echoes) || {}) }; } catch(e) { p = fallbackP; }
    try { a = { archetypeName:'The Unknown', ...(ArchetypeEngine.compute(p) || {}) }; } catch(e) { a = { archetypeName:'The Unknown' }; }
    if (!latest || typeof latest !== 'object') latest = {};
    const mood = safeMode === 'weekly' ? (p.dominantMood || 'reflective') : (latest.mood || p.dominantMood || 'reflective');
    const intensity = Number(safeMode === 'weekly' ? p.averageIntensity : (latest.intensity ?? 0)) || 0;
    const silence = Number(safeMode === 'weekly' ? p.averageSilence : (latest.silence ?? 0)) || 0;
    const date = new Date();
    const receiptId = `EV-${Date.now().toString().slice(-6)}` || 'EV-000000';
    const echoId = latest.id || 'no-echo';
    const coordinates = `EV-${String(mood || 'reflective').toUpperCase()}-I${String(Math.round(intensity)).padStart(2,'0')}-S${String(Math.round(silence)).padStart(2,'0')}` || 'EV-REFLECTIVE-I00-S00';
    const receiptClass = RECEIPT_CLASSES[mood] || 'Moon Archive Class';
    let latestMaterials = [];
    let latestCrafted = null;
    let avatar = {};
    let latestUnlocked = null;
    try { latestMaterials = MaterialEngine.generateForEcho(latest).filter(m => latest.id); } catch(e) { latestMaterials = []; }
    try { latestCrafted = ArtifactArchive.listArtifacts().find(item => item.source === 'crafted' || item.recipe_id) || null; } catch(e) { latestCrafted = null; }
    try { avatar = EchoAvatar.load?.() || {}; } catch(e) { avatar = {}; }
    try { latestUnlocked = VaultRooms.getUnlockedRooms?.().slice(-1)[0] || null; } catch(e) { latestUnlocked = null; }
    const syncLabel = syncState() || 'Local Vault';
    const safeString = `${mood || 'reflective'}:${p.totalEchoes || 0}:${safeMode}:${receiptId || 'EV-000000'}:${echoId || 'no-echo'}`;
    return {
      mode: safeMode || 'latest',
      timestamp: date.toLocaleString(),
      date: date.toLocaleDateString(),
      vaultHolder: vaultHolderName() || 'Local Voyager',
      echoId: echoId || 'no-echo',
      receiptId: receiptId || 'EV-000000',
      receiptNumber: receiptId || 'EV-000000',
      receiptClass: receiptClass || 'Moon Archive Class',
      coordinates: coordinates || 'EV-REFLECTIVE-I00-S00',
      mood: mood || 'reflective',
      intensity,
      silence,
      weather: p.emotionalWeather || 'shifting sky',
      archetype: a.archetypeName || 'The Unknown',
      voidStatus: safeMode === 'weekly' ? `${Number(p.voidCount) || 0} void entries` : (latest.void ? 'Void Signal' : 'Spoken Signal'),
      insight: p.oneLineInsight || 'You kept returning. That counts.',
      syncLabel,
      materialsDiscovered: latestMaterials.length ? latestMaterials.map(m => `+${m.qty} ${m.name}`).join(' · ') : '',
      craftedRelic: latestCrafted?.title || '',
      avatarRole: avatar.role ? `${avatar.role} · ${avatar.role_title || ''}`.trim() : '',
      roomUnlocked: latestUnlocked?.name || '',
      barcode: makeBarcode(safeString)
    };
  }
  return { RECEIPT_CLASSES, getData, openLatest:()=>getData('latest'), openWeekly:()=>getData('weekly') };
})();


function isReceiptDebugMode() {
  try { return new URLSearchParams(window.location.search).get('debug') === '1'; } catch(e) { return false; }
}

function safeGetReceiptData(mode = 'latest') {
  try {
    return mode === 'weekly'
      ? ReceiptRenderer.openWeekly()
      : ReceiptRenderer.openLatest();
  } catch (error) {
    console.warn('Receipt failed to render', error);
    Toast.show('Receipt failed to open. Your echoes are still safe.');
    return null;
  }
}

/* ── FUN RITUALS ── */


const CoordinateEngine = (() => ({
  generate(e={}) {
    const mood = String(e.mood||'reflective').toUpperCase();
    const i = String(Math.round(e.intensity||0)).padStart(2,'0');
    const sl = String(Math.round(e.silence||0)).padStart(2,'0');
    const vh = e.isVoid?'YES':'NO';
    return { code:`EV-${mood}-I${i}-S${sl}`, geo:`N ${i}° INTENSITY / W ${sl}° SILENCE`, orbit:`ORBIT ${(new Date(e.date||Date.now()).getDate()%12+1).toString().padStart(2,'0')} / MOOD ${mood} / VOID ${vh}` };
  }
}))();

const RelicEngine = (() => {
  const make=(title,type,e,rarity='rare',desc='A preserved emotional fragment.')=>({id:`relic_${type}_${e?.id||Date.now()}`,title,type,mood:e?.mood||'reflective',rarity,sourceEchoId:e?.id||null,description:desc,coordinates:CoordinateEngine.generate(e).code,created_at:new Date().toISOString(),visualSeed:Math.random().toString(36).slice(2)});
  function fromEchoes(echoes=[]) {
    if (!echoes.length) return [];
    const first=echoes[echoes.length-1], latest=echoes[0], high=[...echoes].sort((a,b)=>(b.intensity||0)-(a.intensity||0))[0], silence=[...echoes].sort((a,b)=>(b.silence||0)-(a.silence||0))[0];
    return [
      make('The First Signal','first',first,'luminous','A fragment from the first feeling that entered your orbit.'),
      make('The Glass Comet','latest',latest,'rare','A bright trace from your latest emotional weather.'),
      make('The Storm Fragment','intensity',high,'haunted','A storm compressed into something small enough to hold.'),
      make('The Loudest Quiet','silence',silence,'mythic','Formed from a silence louder than the words around it.')
    ];
  }
  return { fromEchoes };
})();

const ArtifactArchive = (() => {
  const KEY='echovault_artifacts_v1';
  const listArtifacts=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
  const save=(arr)=>localStorage.setItem(KEY,JSON.stringify(arr));
  const saveArtifact=(artifact)=>{const arr=listArtifacts();arr.unshift({...artifact,id:artifact.id||`art_${Date.now()}`,created_at:new Date().toISOString()});save(arr);EchoAvatar.addXP?.(8, 'save artifact');GentleQuests?.evaluate?.('artifact_saved', artifact);return arr[0];};
  const deleteArtifact=(id)=>save(listArtifacts().filter(a=>a.id!==id));
  const toggleFavorite=(id)=>save(listArtifacts().map(a=>a.id===id?{...a,favorite:!a.favorite}:a));
  return {KEY,saveArtifact,listArtifacts,deleteArtifact,toggleFavorite};
})();


const MaterialEngine = (() => {
  const moodMaterials = {
    calm:'Calm Shard', chaos:'Storm Spark', reflective:'Moon Thread', anxious:'Compass Dust', joyful:'Bloom Seed', empty:'Void Stone'
  };
  const materialMeta = {
    'Calm Shard':{ icon:'◇', mood:'calm', description:'A steady fragment from softened waters.' },
    'Storm Spark':{ icon:'ϟ', mood:'chaos', description:'A charged fleck from intense weather.' },
    'Moon Thread':{ icon:'☾', mood:'reflective', description:'A silver strand from reflective nights.' },
    'Compass Dust':{ icon:'⌖', mood:'anxious', description:'Restless powder that still points somewhere.' },
    'Bloom Seed':{ icon:'✿', mood:'joyful', description:'A small beginning that remembers light.' },
    'Void Stone':{ icon:'●', mood:'empty', description:'Quiet material gathered from spacious silence.' },
    'Silence Glass':{ icon:'◌', mood:'empty', description:'Transparent pressure from things almost said.' },
    'Pressure Ember':{ icon:'◆', mood:'chaos', description:'Heat left behind by a feeling at its edge.' },
    'Void Core':{ icon:'◉', mood:'empty', description:'A rare center from wordless signal.' }
  };
  function generateForEcho(echo={}) {
    const out = [];
    const add = (name, qty=1) => out.push({ name, qty });
    add(moodMaterials[echo.mood] || 'Moon Thread', echo.intensity >= 7 ? 2 : 1);
    if ((echo.silence || 0) >= 7) add('Silence Glass', 1);
    if ((echo.intensity || 0) >= 8) add('Pressure Ember', 1);
    if (echo.void) add('Void Core', 1);
    return out;
  }
  function toast(materials=[]) {
    if (!materials.length) return;
    Toast.show(materials.map(m => `+${m.qty} ${m.name}${m.qty > 1 ? 's' : ''}`).join(' · '), 2800);
  }
  function showMaterialBurst(materials=[]) {
    if (!materials.length || !document?.body) return toast(materials);
    const burst = document.createElement('div');
    burst.className = 'material-burst';
    burst.setAttribute('role','status');
    burst.innerHTML = materials.map(m => {
      const meta = materialMeta[m.name] || { icon:'✦', mood:'reflective' };
      return `<span class="material-burst-chip mood-${escapeHTML(meta.mood)}"><b>${escapeHTML(meta.icon)}</b> +${escapeHTML(m.qty)} ${escapeHTML(m.name)}${m.qty > 1 ? 's' : ''}</span>`;
    }).join('');
    document.body.appendChild(burst);
    setTimeout(()=>burst.classList.add('show'), 20);
    setTimeout(()=>burst.remove(), 3200);
  }
  return { generateForEcho, toast, showMaterialBurst, materialMeta };
})();

const VaultInventory = (() => {
  const KEY = 'echovault_inventory_v1';
  function normalize(inv){
    const clean = {};
    if (!inv || typeof inv !== 'object' || Array.isArray(inv)) return clean;
    Object.entries(inv).forEach(([name, qty]) => {
      const n = Number(qty);
      if (name && Number.isFinite(n) && n > 0) clean[name] = Math.floor(n);
    });
    return clean;
  }
  function load(){ try { return normalize(JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { return {}; } }
  function save(inv){ localStorage.setItem(KEY, JSON.stringify(normalize(inv))); return normalize(inv); }
  function addMaterials(materials=[]) {
    const inv = load();
    materials.forEach(({name, qty=1}) => { const q = Math.max(0, Math.floor(Number(qty) || 0)); if (name && q) inv[name] = (inv[name] || 0) + q; });
    save(inv);
    return inv;
  }
  function getMaterialCount(name){ return load()[name] || 0; }
  function missingFor(cost=[]){ return cost.map(({name, qty=1}) => ({ name, qty:Math.max(0, Math.floor(Number(qty) || 0)), have:getMaterialCount(name) })).filter(m => m.have < m.qty).map(m => ({ name:m.name, qty:m.qty - m.have, have:m.have, required:m.qty })); }
  function hasMaterials(cost=[]){ return missingFor(cost).length === 0; }
  function spendMaterials(cost=[]) {
    const inv = load();
    const missing = cost.map(({name, qty=1}) => ({ name, qty:Math.max(0, Math.floor(Number(qty) || 0)), have:inv[name] || 0 })).filter(m => m.have < m.qty).map(m => ({ name:m.name, qty:m.qty - m.have, have:m.have, required:m.qty }));
    if (missing.length) return { ok:false, missing };
    cost.forEach(({name, qty=1}) => { inv[name] = Math.max(0, (inv[name] || 0) - Math.floor(Number(qty) || 0)); if (!inv[name]) delete inv[name]; });
    return { ok:true, inventory:save(inv) };
  }
  function getTotals(){ return load(); }
  function clearInventoryForTestingOnly(){ localStorage.removeItem(KEY); }
  return { KEY, load, save, addMaterials, getTotals, getMaterialCount, hasMaterials, spendMaterials, clearInventoryForTestingOnly };
})();

const RelicCrafting = (() => {
  const recipes = [
    { id:'void_lantern', title:'Void Lantern', description:'A small light made from quiet material.', artifactType:'lantern', cost:[{name:'Void Stone',qty:3},{name:'Moon Thread',qty:1}] },
    { id:'storm_jar', title:'Storm Jar', description:'Sparks contained before they become weather.', artifactType:'stormjar', cost:[{name:'Storm Spark',qty:4},{name:'Pressure Ember',qty:1}] },
    { id:'bloom_token', title:'Bloom Token', description:'A small proof that light returned.', artifactType:'bloom_token', cost:[{name:'Bloom Seed',qty:3},{name:'Calm Shard',qty:1}] },
    { id:'moon_compass', title:'Moon Compass', description:'A direction finder for reflective nights.', artifactType:'moon_compass', cost:[{name:'Compass Dust',qty:2},{name:'Moon Thread',qty:2}] },
    { id:'silence_bell', title:'Silence Bell', description:'A bell made from things almost said.', artifactType:'silence_bell', cost:[{name:'Silence Glass',qty:3}] },
    { id:'glass_comet', title:'Glass Comet', description:'A bright fragment from intense quiet.', artifactType:'glass_comet', cost:[{name:'Storm Spark',qty:2},{name:'Silence Glass',qty:2}] }
  ];
  const listRecipes=()=>recipes.map(r=>({...r,cost:r.cost.map(c=>({...c}))}));
  const getRecipe=(recipeId)=>listRecipes().find(r=>r.id===recipeId) || null;
  const getMissingMaterials=(recipeId)=>{ const r=getRecipe(recipeId); return r ? r.cost.map(c=>({ ...c, have:VaultInventory.getMaterialCount(c.name) })).filter(c=>c.have<c.qty).map(c=>({ name:c.name, qty:c.qty-c.have, have:c.have, required:c.qty })) : []; };
  const canCraft=(recipeId)=>{ const r=getRecipe(recipeId); return Boolean(r && VaultInventory.hasMaterials(r.cost)); };
  function craft(recipeId){
    const recipe = getRecipe(recipeId);
    if (!recipe) return { ok:false, missing:[], error:'Recipe not found' };
    const missing = getMissingMaterials(recipeId);
    if (missing.length) return { ok:false, missing };
    const spent = VaultInventory.spendMaterials(recipe.cost);
    if (!spent.ok) return spent;
    const artifact = ArtifactArchive.saveArtifact({ type:recipe.artifactType, recipe_id:recipe.id, title:recipe.title, subtitle:recipe.description, description:recipe.description, created_at:new Date().toISOString(), source:'crafted', data:{ recipe_id:recipe.id, cost:recipe.cost } });
    Toast.show(`Crafted: ${recipe.title}`);
    GentleQuests.evaluate('relic_crafted', artifact);
    EchoAvatar.addXP?.(12, 'craft relic');
    VaultRooms.evaluate?.();
    return { ok:true, artifact };
  }
  return { listRecipes, getRecipe, canCraft, getMissingMaterials, craft };
})();

const VaultRooms = (() => {
  const KEY = 'echovault_rooms_v1';
  const rooms = [
    { id:'weather_room', name:'Weather Room', reason:'Requires at least 1 echo.', test:()=>state.echoes.length >= 1 },
    { id:'crafting_table', name:'Crafting Table', reason:'Requires at least 3 total materials.', test:()=>Object.values(VaultInventory.getTotals()).reduce((a,b)=>a+Number(b||0),0) >= 3 },
    { id:'relic_hall', name:'Relic Hall', reason:'Requires at least 1 crafted artifact.', test:()=>ArtifactArchive.listArtifacts().some(a=>a.source==='crafted' || a.recipe_id) },
    { id:'lantern_garden', name:'Lantern Garden', reason:'Requires crafted Void Lantern.', test:()=>ArtifactArchive.listArtifacts().some(a=>a.recipe_id==='void_lantern' || (a.source==='crafted' && a.type==='lantern')) },
    { id:'storm_chamber', name:'Storm Chamber', reason:'Requires crafted Storm Jar.', test:()=>ArtifactArchive.listArtifacts().some(a=>a.recipe_id==='storm_jar' || (a.source==='crafted' && a.type==='stormjar')) },
    { id:'soundprint_wall', name:'Soundprint Wall', reason:'Requires at least 3 echoes.', test:()=>state.echoes.length >= 3 },
    { id:'archive_shelf', name:'Archive Shelf', reason:'Requires at least 3 saved artifacts.', test:()=>ArtifactArchive.listArtifacts().length >= 3 },
    { id:'society_gate', name:'Society Gate', reason:'Requires Echo Avatar + 5 echoes + 1 saved or crafted artifact.', test:()=>Object.keys(EchoAvatar.load()).length > 0 && state.echoes.length >= 5 && ArtifactArchive.listArtifacts().length >= 1 }
  ];
  function load(){ try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { return {}; } }
  function getRooms(){ const saved=load(); return rooms.map(r=>({ id:r.id, name:r.name, unlocked:Boolean(saved[r.id]?.unlocked || r.test()), reason:r.reason })); }
  function getUnlockedRooms(){ return getRooms().filter(r=>r.unlocked); }
  function isUnlocked(roomId){ return Boolean(getRooms().find(r=>r.id===roomId)?.unlocked); }
  function getUnlockReason(roomId){ return rooms.find(r=>r.id===roomId)?.reason || 'Keep building your private vault.'; }
  function detectNewUnlocks(previousState={}){ return rooms.filter(r=>r.test() && !previousState[r.id]?.unlocked).map(r=>({ id:r.id, name:r.name })); }
  function saveUnlockState(){ const out={}; rooms.forEach(r=>{ out[r.id]={ unlocked:Boolean(r.test()), checked_at:new Date().toISOString() }; }); localStorage.setItem(KEY, JSON.stringify(out)); return out; }
  function evaluate(){ const prev=load(); const newly=detectNewUnlocks(prev); const saved=saveUnlockState(); newly.forEach(r=>{ Toast.show(`${r.name} awakened.`); GentleQuests.evaluate('room_unlocked', r); EchoAvatar.addXP?.(15, 'unlock room'); }); return saved; }
  return { KEY, getRooms, getUnlockedRooms, isUnlocked, getUnlockReason, detectNewUnlocks, saveUnlockState, evaluate };
})();

const GentleQuests = (() => {
  const KEY = 'echovault_quests_v1';
  const catalog = [
    { id:'void_echo', text:'Create one echo without words.', reward:{ name:'Void Stone', qty:1 }, xp:0, test:(event, data)=>event==='echo_created' && data?.void },
    { id:'save_artifact', text:'Save one artifact.', reward:{ name:'Moon Thread', qty:1 }, xp:0, test:(event)=>event==='artifact_saved' },
    { id:'light_lantern', text:'Light the Void Lantern once.', reward:{ name:'Moon Thread', qty:1 }, xp:0, test:(event)=>event==='lantern_lit' },
    { id:'visit_weather', text:'Visit the Weather Room.', reward:{ name:'Calm Shard', qty:1 }, xp:0, test:(event)=>event==='weather_room_visited' },
    { id:'low_intensity', text:'Create one low-intensity echo.', reward:{ name:'Silence Glass', qty:1 }, xp:0, test:(event, data)=>event==='echo_created' && (data?.intensity || 0) <= 3 },
    { id:'export_receipt', text:'Export a receipt.', reward:{ name:'Bloom Seed', qty:1 }, xp:0, test:(event)=>event==='receipt_exported' },
    { id:'craft_one_relic', text:'Craft one relic.', reward:{ name:'Bloom Seed', qty:1 }, xp:5, test:(event)=>event==='relic_crafted' },
    { id:'visit_crafting_table', text:'Visit the Crafting Table.', reward:{ name:'Compass Dust', qty:1 }, xp:3, test:(event)=>event==='crafting_table_visited' },
    { id:'save_crafted_artifact', text:'Save one crafted artifact.', reward:{ name:'Calm Shard', qty:1 }, xp:5, test:(event, data)=>event==='artifact_saved' && (data?.source==='crafted' || data?.recipe_id) },
    { id:'unlock_one_room', text:'Unlock one room.', reward:{ name:'Moon Thread', qty:1 }, xp:8, test:(event)=>event==='room_unlocked' },
    { id:'generate_avatar', text:'Generate your Echo Avatar.', reward:{ name:'Silence Glass', qty:1 }, xp:5, test:(event)=>event==='avatar_generated' }
  ];
  function todayKey(date = new Date()) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }
  function completionKey(id, dateKey = todayKey()) { return `${id}:${dateKey}`; }
  function load(){
    let data;
    try { data = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { data = {}; }
    let migrated = false;
    Object.entries(data || {}).forEach(([key, value]) => {
      if (!key.includes(':') && value?.completed) {
        const dateKey = value.completed_at ? todayKey(new Date(value.completed_at)) : todayKey();
        const dailyKey = completionKey(key, dateKey);
        if (!data[dailyKey]) data[dailyKey] = { ...value, completed:true, completed_at:value.completed_at || new Date().toISOString(), migrated_from:key };
        delete data[key];
        migrated = true;
      }
    });
    if (migrated) save(data);
    return data || {};
  }
  function save(data){ localStorage.setItem(KEY, JSON.stringify(data || {})); return data || {}; }
  function todayId(){ return catalog[new Date().getDate() % catalog.length].id; }
  function current(){ const q = catalog.find(x => x.id === todayId()) || catalog[0]; const data = load(); const key = completionKey(q.id); return { ...q, todayKey:todayKey(), completionKey:key, completed: Boolean(data[key]?.completed) }; }
  function evaluate(event, data) {
    const saved = load();
    const q = catalog.find(item => item.test(event, data) && !saved[completionKey(item.id)]);
    if (!q) return false;
    const key = completionKey(q.id);
    saved[key] = { completed:true, completed_at:new Date().toISOString(), todayKey:todayKey(), event };
    save(saved);
    VaultInventory.addMaterials([q.reward]);
    if (q.xp && EchoAvatar.addXP) EchoAvatar.addXP(q.xp, `quest:${q.id}`);
    Toast.show(`Gentle Quest complete · +${q.reward.qty} ${q.reward.name}${q.xp ? ` · +${q.xp} XP` : ''}`, 3200);
    return true;
  }
  return { KEY, catalog, todayKey, completionKey, current, evaluate, load, save };
})();

const EchoAvatar = (() => {
  const KEY = 'echovault_avatar_v1';
  const roleMap = {
    stillLake:['Lantern Keeper','blue-gold stillwater','hooded coat with lantern seams','🏮'],
    electricStorm:['Stormwright','rose lightning','glasswork jacket with copper lines','⚡'],
    nightArchivist:['Moon Archivist','violet moon haze','ink cloak with silver pockets','🌙'],
    tremblingCompass:['Weather Cartographer','amber wind-ring','soft field coat with compass thread','🧭'],
    bloomingField:['Bloom Tender','green dawn bloom','garden wrap with seed charms','🌸'],
    quietAbyss:['Void Keeper','indigo eclipse','dark mantle with quiet stars','🌑'],
    shiftingSky:['Signal Courier','prism skyglow','runner scarf with signal beads','✦'],
    glassComet:['Relic Runner','crystal ember trail','comet boots and relic satchel','☄️'],
    softWitness:['Archive Witness','mist gold aura','warm shawl with archive pins','👁️']
  };
  const thresholds = [
    { xp:300, title:'Mythbearer', accessory:'mythic mantle trim' },
    { xp:150, title:'Cartographer', accessory:'coordinate sash' },
    { xp:75, title:'Archivist', accessory:'archive pin' },
    { xp:25, title:'Keeper', accessory:'small lantern charm' },
    { xp:0, title:'Initiate', accessory:'first vault thread' }
  ];
  function getLevelTitle(xp=0){ return thresholds.find(t => xp >= t.xp)?.title || 'Initiate'; }
  function getLevelNumber(xp=0){ return thresholds.slice().reverse().filter(t => xp >= t.xp).length; }
  function getNextUnlock(){ const avatar=load(); const xp=Number(avatar.role_xp || 0); return thresholds.slice().reverse().find(t => t.xp > xp) || null; }
  function normalize(avatar={}){
    const xp = Math.max(0, Number(avatar.role_xp || 0));
    return { ...avatar, level:avatar.level || getLevelNumber(xp), role_xp:xp, role_title:avatar.role_title || getLevelTitle(xp), unlocked_accessories:Array.isArray(avatar.unlocked_accessories)?avatar.unlocked_accessories:[], last_progress_at:avatar.last_progress_at || avatar.updated_at || avatar.created_at || new Date().toISOString() };
  }
  function load(){ try { return normalize(JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { return normalize({}); } }
  function save(avatar){ localStorage.setItem(KEY, JSON.stringify(normalize(avatar))); return normalize(avatar); }
  function build() {
    const arch = ArchetypeEngine.compute(PatternEngine.analyze(state.echoes));
    const profile = ProfileStore.read();
    const key = arch.archetypeKey || 'shiftingSky';
    const [role, aura, outfit_hint, companion_symbol] = roleMap[key] || roleMap.shiftingSky;
    const previous = load();
    const xp = Number(previous.role_xp || 0);
    const avatar = save({ ...previous, avatar_name: profile.display_name || previous.avatar_name || 'Echo Voyager', archetype_key:key, role, aura, outfit_hint, companion_symbol, level:getLevelNumber(xp), role_xp:xp, role_title:getLevelTitle(xp), created_at:previous.created_at || new Date().toISOString(), updated_at:new Date().toISOString(), last_progress_at:previous.last_progress_at || new Date().toISOString() });
    GentleQuests.evaluate('avatar_generated', avatar);
    VaultRooms.evaluate?.();
    return avatar;
  }
  function regenerateRole(){ return build(); }
  function addXP(amount=0, reason='progress'){
    const current = Object.keys(load()).length ? load() : build();
    const beforeTitle = getLevelTitle(current.role_xp || 0);
    const nextXp = Math.max(0, Number(current.role_xp || 0) + Number(amount || 0));
    const nextTitle = getLevelTitle(nextXp);
    const unlocked_accessories = new Set(current.unlocked_accessories || []);
    thresholds.filter(t => nextXp >= t.xp).forEach(t => unlocked_accessories.add(t.accessory));
    const saved = save({ ...current, role_xp:nextXp, level:getLevelNumber(nextXp), role_title:nextTitle, unlocked_accessories:[...unlocked_accessories], last_progress_at:new Date().toISOString(), last_progress_reason:reason });
    if (nextTitle !== beforeTitle) Toast.show(`Echo Avatar evolved: ${nextTitle}`);
    return saved;
  }
  function getProgress(){ const avatar=load(); const xp=Number(avatar.role_xp || 0); const current=thresholds.find(t=>xp>=t.xp) || thresholds[thresholds.length-1]; const next=getNextUnlock(); const span=next ? next.xp-current.xp : 1; const pct=next ? Math.max(4, Math.min(100, ((xp-current.xp)/span)*100)) : 100; return { xp, level:avatar.level, role_title:avatar.role_title || getLevelTitle(xp), current, next, percent:pct }; }
  function renderProgress(){ const p=getProgress(); return `<div class="avatar-progress"><div class="avatar-progress-head"><span>${escapeHTML(p.role_title)}</span><b>${escapeHTML(p.xp)} XP</b></div><div class="avatar-progress-bar"><i style="width:${p.percent}%"></i></div><small>${p.next ? `Next unlock: ${escapeHTML(p.next.title)} at ${p.next.xp} XP · accessory: ${escapeHTML(p.next.accessory)}` : 'All current avatar milestones awakened.'}</small></div>`; }
  function render(){
    const avatar = Object.keys(load()).length ? load() : build();
    const arch = ArchetypeEngine.compute(PatternEngine.analyze(state.echoes));
    const next = getNextUnlock();
    const latestAccessory = (avatar.unlocked_accessories || []).slice(-1)[0] || 'first vault thread';
    const safe = {
      symbol: escapeHTML(avatar.companion_symbol),
      name: escapeHTML(avatar.avatar_name),
      role: escapeHTML(avatar.role),
      roleTitle: escapeHTML(avatar.role_title || getLevelTitle(avatar.role_xp)),
      aura: escapeHTML(avatar.aura),
      outfit: escapeHTML(avatar.outfit_hint),
      archetype: escapeHTML(arch.archetypeName),
      accessory: escapeHTML(latestAccessory)
    };
    const recommendedDistrict = escapeHTML(getSocietyDistrictSuggestion(avatar.role || ''));
    const gateReady = Boolean(state.echoes.length >= 5 && ArtifactArchive.listArtifacts().length >= 1);
    return `<div class="echo-avatar-card"><div class="echo-avatar-orb"><span>${safe.symbol}</span></div><div class="echo-avatar-kicker">Echo Avatar</div><h4>${safe.name}</h4><div class="echo-avatar-role" data-society-role="${safe.role}">${safe.role} · ${safe.roleTitle}</div>${renderProgress()}<p>Aura: ${safe.aura}</p><p>Archetype: ${safe.archetype}</p><p>Companion symbol: ${safe.symbol}</p><p class="echo-avatar-outfit">${safe.outfit}</p><p class="avatar-accessory-hint">Accessory hint: ${safe.accessory}</p><p class="avatar-next-hint">${next ? `Next unlock: ${escapeHTML(next.title)} at ${next.xp} XP.` : 'Your current path is fully awakened.'}</p><div class="phase-two-note">Society role: <b>${safe.role}</b> · Recommended district: <b>${recommendedDistrict}</b>. ${gateReady ? 'Society Gate can receive you privately.' : 'Society Gate requirement: 5 echoes and 1 saved artifact.'}</div><div class="echo-avatar-actions"><button class="receipt-action-btn" id="avatar-generate-btn">Generate from my profile</button><button class="receipt-action-btn" id="avatar-regenerate-btn">Regenerate role</button><button class="receipt-action-btn" id="avatar-visit-district-btn">Visit my district</button></div></div>`;
  }
  function bind(){ document.getElementById('avatar-generate-btn')?.addEventListener('click',()=>{build(); refreshEchoDependentUI(); Toast.show('Echo Avatar refreshed.');}); document.getElementById('avatar-regenerate-btn')?.addEventListener('click',()=>{regenerateRole(); refreshEchoDependentUI(); Toast.show('Role regenerated locally.');}); document.getElementById('avatar-visit-district-btn')?.addEventListener('click',()=>{ const ok=Rituals.open?.('museum'); setTimeout(()=>{ document.querySelector('[data-room="society"]')?.click(); document.getElementById('society-enter-btn')?.click(); }, 80); Toast.show('Opening your EchoSociety district.'); }); }
  return { KEY, load, save, build, regenerateRole, addXP, getProgress, getLevelTitle, getNextUnlock, renderProgress, render, bind };
})();


const SOCIETY_TABLES = {
  consents:'society_consents',
  signals:'society_signals',
  reactions:'society_reactions',
  publicSignals:'society_signals_public',
  weatherDaily:'society_weather_daily',
  reactionCounts:'society_reaction_counts'
};

const SOCIETY_REACTIONS = {
  witnessed:'🌙 witnessed',
  held:'🕯️ held',
  softened:'🌊 softened',
  bloomed:'🌸 bloomed',
  charged:'⚡ charged'
};

function readLocalJSON(key, fallback) {
  try { const parsed = JSON.parse(localStorage.getItem(key) || ''); return parsed ?? fallback; } catch { return fallback; }
}
function writeLocalJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); return value; }
function dayKey(date = new Date()) { return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,10); }

function sanitizeSocietySignal(signal = {}) {
  const allowed = ['client_id','mood','intensity_band','silence_band','archetype','signal_type','district','anonymous_label','metadata','day'];
  const forbidden = ['thought','raw_thought','email','display_name','name','profile','full_echo','user_text','archive_line'];
  const detected = forbidden.filter((field) => Object.prototype.hasOwnProperty.call(signal, field));
  if (detected.length && window.__ECHOVAULT_DEBUG__) console.warn('[EchoSociety] stripped unsafe fields', detected);
  const safe = {};
  allowed.forEach((field) => {
    if (signal[field] === undefined || signal[field] === null) return;
    if (field === 'metadata') {
      const meta = { ...(signal.metadata || {}) };
      forbidden.forEach((unsafe) => delete meta[unsafe]);
      safe.metadata = meta;
    } else {
      safe[field] = typeof signal[field] === 'string' ? signal[field].slice(0,120) : signal[field];
    }
  });
  safe.day = safe.day || dayKey();
  safe.client_id = safe.client_id || localStorage.getItem('echovault_client_id_v1') || (() => { const id=`ev_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; localStorage.setItem('echovault_client_id_v1', id); return id; })();
  return safe;
}

const SocietyPrivacy = (() => {
  const forbidden = ['thought','raw_thought','email','display_name','name','profile','full_echo','user_text','archive_line'];
  function stripUnsafeFields(payload = {}) { return sanitizeSocietySignal(payload); }
  function isSafeSignalPayload(payload = {}) { return forbidden.every((field) => !Object.prototype.hasOwnProperty.call(payload, field)); }
  function canContribute() { return SocietySignals.getConsent(); }
  function requireConsent() { if (!canContribute()) { Toast.show('Join EchoSociety first. Your vault is still private.'); return false; } return true; }
  function explainPrivacy() { return 'Raw echoes stay private by default. EchoSociety receives only anonymous symbolic mood, intensity, silence, archetype, district, and day signals after consent.'; }
  return { canContribute, requireConsent, stripUnsafeFields, isSafeSignalPayload, explainPrivacy };
})();

const SocietySignals = (() => {
  const CONSENT_KEY = 'echovault_society_consent_v1';
  const SIGNALS_KEY = 'echovault_society_signals_v1';
  const REACTIONS_KEY = 'echovault_society_reactions_v1';
  const SIGNAL_TYPES = ['weather','lantern','storm','bloom','archive','delivery','alam'];
  const DISTRICTS = { weather:'Weather Tower', lantern:'Lantern District', storm:'Storm Works', bloom:'Bloom Market', archive:'Moon Archive', delivery:'Signal Couriers’ Route', alam:'Alam AI Observatory' };
  const ANON_LABELS = ['Moon Signal','Lantern Wisp','Quiet Comet','Bloom Shade','Storm Mote','Archive Finch','Drift Spark','Soft Witness'];
  function ensureKeys(){ if (localStorage.getItem(CONSENT_KEY) === null) writeLocalJSON(CONSENT_KEY, { consent:false, updated_at:null, cloud_status:'unknown' }); if (localStorage.getItem(SIGNALS_KEY) === null) writeLocalJSON(SIGNALS_KEY, []); if (localStorage.getItem(REACTIONS_KEY) === null) writeLocalJSON(REACTIONS_KEY, {}); }
  function getConsent(){ ensureKeys(); return Boolean(readLocalJSON(CONSENT_KEY, {consent:false})?.consent); }
  function setConsent(consent){ ensureKeys(); const value = { consent:Boolean(consent), updated_at:new Date().toISOString(), local_only:Auth.isLocalMode(), cloud_status:Auth.user ? 'pending' : 'local_preview' }; writeLocalJSON(CONSENT_KEY, value); SocietySync.setConsent?.(Boolean(consent)).catch?.(()=>{}); return value; }
  function revokeConsent(){ const value = { consent:false, updated_at:new Date().toISOString(), local_only:Auth.isLocalMode(), cloud_status:Auth.user ? 'revoked_pending' : 'local_preview' }; writeLocalJSON(CONSENT_KEY, value); SocietySync.revokeConsent?.().catch?.(()=>{}); return value; }
  function requireConsent(){ return SocietyPrivacy.requireConsent(); }
  function latestEcho(){ return state.echoes?.[0] || {}; }
  function band(value, lowLabel, midLabel, highLabel){ const n = Number(value || 0); if (n >= 8) return highLabel; if (n >= 4) return midLabel; return lowLabel; }
  function resolveArchetype(){ try { return ArchetypeEngine.compute(PatternEngine.analyze(state.echoes)).archetypeName; } catch { return 'The Unknown'; } }
  function normalizeType(type){ return SIGNAL_TYPES.includes(type) ? type : 'weather'; }
  function baseSignal(type='weather', source={}){
    const signalType = normalizeType(type);
    const echo = source.echo || latestEcho();
    return {
      id: source.id || `soc_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      mood: source.mood || echo.mood || PatternEngine.analyze(state.echoes).dominantMood || 'empty',
      intensity_band: source.intensity_band || band(source.intensity ?? echo.intensity, 'low', 'medium', 'high'),
      silence_band: source.silence_band || band(source.silence ?? echo.silence, 'soft', 'hushed', 'deep'),
      archetype: source.archetype || resolveArchetype(),
      signal_type: signalType,
      district: source.district || DISTRICTS[signalType],
      created_at: source.created_at || new Date().toISOString(),
      day: source.day || dayKey(),
      anonymous_label: source.anonymous_label || ANON_LABELS[Math.floor(Math.random()*ANON_LABELS.length)],
      metadata: source.metadata || {}
    };
  }
  function createSignal(type='weather', source={}){
    ensureKeys();
    if (!requireConsent()) return null;
    const signal = baseSignal(type, source);
    const safe = sanitizeSocietySignal(signal);
    const local = { ...signal, ...safe, synced:false, raw_echo_shared:false };
    const arr = listLocalSignals(); arr.unshift(local); writeLocalJSON(SIGNALS_KEY, arr.slice(0,160));
    SocietySync.uploadSignal(local).then((res)=>{ if(res?.ok) markSynced(local.id); }).catch(()=>{});
    return local;
  }
  function listLocalSignals(){ ensureKeys(); const arr = readLocalJSON(SIGNALS_KEY, []); return Array.isArray(arr) ? arr : []; }
  function markSynced(id){ const arr=listLocalSignals().map((s)=>s.id===id?{...s,synced:true,synced_at:new Date().toISOString()}:s); writeLocalJSON(SIGNALS_KEY, arr); }
  function clearLocalSignals(){ writeLocalJSON(SIGNALS_KEY, []); writeLocalJSON(REACTIONS_KEY, {}); }
  function exportSignals(){ ensureKeys(); const blob = new Blob([JSON.stringify({ version:2, privacy:SocietyPrivacy.explainPrivacy(), consent:readLocalJSON(CONSENT_KEY,{}), signals:listLocalSignals().map(sanitizeSocietySignal), reactions:listReactions() }, null, 2)], {type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='echovault-society-signals.json'; a.click(); URL.revokeObjectURL(url); }
  function listReactions(){ ensureKeys(); const obj = readLocalJSON(REACTIONS_KEY, {}); return obj && typeof obj === 'object' ? obj : {}; }
  function addReaction(signalId, reactionType){ if (!SocietyPrivacy.requireConsent()) return null; if(!SOCIETY_REACTIONS[reactionType]) return null; const all=listReactions(); const key=String(signalId || 'local-preview'); const current=Array.isArray(all[key]) ? all[key] : []; if(!current.includes(reactionType)) current.push(reactionType); all[key]=current; writeLocalJSON(REACTIONS_KEY, all); SocietySync.addReaction(signalId, reactionType).catch(()=>{}); return current; }
  const contributeWeather=()=>createSignal('weather');
  const contributeLantern=()=>createSignal('lantern', { mood: latestEcho().mood || 'empty', silence: latestEcho().silence ?? 9 });
  const contributeStorm=()=>createSignal('storm', { mood: latestEcho().mood || 'chaos', intensity: latestEcho().intensity ?? 9 });
  const contributeBloom=()=>createSignal('bloom', { mood: latestEcho().mood || 'joyful', intensity: latestEcho().intensity ?? 4 });
  const contributeArchiveLine=(optionalLine='')=>createSignal('archive', { metadata:{ archive_marker:Boolean(String(optionalLine).trim()) } });
  const contributeDelivery=(mission)=>createSignal('delivery', { district:mission?.to || 'Signal Couriers’ Route', metadata:{ delivery_item:mission?.item || 'signal', mission_id:mission?.id || 'delivery' } });
  const contributeAlam=()=>createSignal('alam', { metadata:{ portal:'observatory' } });
  function isSupabaseSocietyAvailable(){ return SocietySync.isAvailable(); }
  function maybePrepareFutureSync(signal){ return { ok:isSupabaseSocietyAvailable(), signal:sanitizeSocietySignal(signal), raw_echo_shared:false }; }
  ensureKeys();
  return { CONSENT_KEY, SIGNALS_KEY, REACTIONS_KEY, SIGNAL_TYPES, DISTRICTS, createSignal, listLocalSignals, markSynced, contributeWeather, contributeLantern, contributeStorm, contributeBloom, contributeArchiveLine, contributeDelivery, contributeAlam, getConsent, setConsent, revokeConsent, clearLocalSignals, exportSignals, listReactions, addReaction, isSupabaseSocietyAvailable, maybePrepareFutureSync, requireConsent };
})();

const SocietySync = (() => {
  function isAvailable(){ return Boolean(Auth.client && Auth.user && !Auth.isLocalMode()); }
  async function getConsent(){ if(!isAvailable()) return readLocalJSON(SocietySignals.CONSENT_KEY, {consent:false}); try { const {data,error}=await Auth.client.from(SOCIETY_TABLES.consents).select('*').eq('user_id',Auth.user.id).maybeSingle(); if(error) throw error; return data || readLocalJSON(SocietySignals.CONSENT_KEY, {consent:false}); } catch(err){ if(window.__ECHOVAULT_DEBUG__) console.warn('[EchoSociety] consent fetch failed', err); return readLocalJSON(SocietySignals.CONSENT_KEY, {consent:false}); } }
  async function setConsent(consent){ if(!isAvailable()) return {ok:false, mode:'local'}; const payload={ user_id:Auth.user.id, consent:Boolean(consent), updated_at:new Date().toISOString() }; try { const {error}=await Auth.client.from(SOCIETY_TABLES.consents).upsert(payload,{onConflict:'user_id'}); if(error) throw error; const stored=readLocalJSON(SocietySignals.CONSENT_KEY,{}); writeLocalJSON(SocietySignals.CONSENT_KEY,{...stored, cloud_status:consent?'synced':'revoked'}); return {ok:true}; } catch(err){ if(window.__ECHOVAULT_DEBUG__) console.warn('[EchoSociety] consent sync failed', err); return {ok:false, error:err}; } }
  async function revokeConsent(){ return setConsent(false); }
  async function uploadSignal(signal){ if(!isAvailable() || !SocietySignals.getConsent()) return {ok:false, mode:'local_preview'}; const payload=sanitizeSocietySignal(signal); if(!SocietyPrivacy.isSafeSignalPayload(payload)) return {ok:false, error:'unsafe_payload'}; try { const {error}=await Auth.client.from(SOCIETY_TABLES.signals).insert(payload); if(error) throw error; return {ok:true}; } catch(err){ if(window.__ECHOVAULT_DEBUG__) console.warn('[EchoSociety] signal upload failed', err); return {ok:false, error:err}; } }
  async function syncLocalSignals(){ if(!isAvailable() || !SocietySignals.getConsent()) { Toast.show('Sync Local Signals requires consent and login.'); return {ok:false}; } const pending=SocietySignals.listLocalSignals().filter((s)=>!s.synced); let count=0; for (const signal of pending) { const res=await uploadSignal(signal); if(res.ok){ SocietySignals.markSynced(signal.id); count++; } } Toast.show(`${count} symbolic signals synced.`); return {ok:true, count}; }
  async function fetchPublicSignals(){ if(!isAvailable()) return SocietySignals.listLocalSignals(); try { const {data,error}=await Auth.client.from(SOCIETY_TABLES.publicSignals).select('*').order('created_at',{ascending:false}).limit(24); if(error) throw error; return data || []; } catch(err){ return SocietySignals.listLocalSignals(); } }
  async function fetchDailyWeather(){ if(!isAvailable()) return null; try { const {data,error}=await Auth.client.from(SOCIETY_TABLES.weatherDaily).select('*').eq('day',dayKey()).maybeSingle(); if(error) throw error; return data || null; } catch(err){ return null; } }
  async function addReaction(signalId, reactionType){ if(!isAvailable() || !SocietySignals.getConsent()) return {ok:false, mode:'local'}; if(!SOCIETY_REACTIONS[reactionType]) return {ok:false}; try { const {error}=await Auth.client.from(SOCIETY_TABLES.reactions).insert({ signal_id:signalId, reaction_type:reactionType, day:dayKey() }); if(error) throw error; return {ok:true}; } catch(err){ return {ok:false, error:err}; } }
  async function fetchReactionCounts(){ if(!isAvailable()) return {}; try { const {data,error}=await Auth.client.from(SOCIETY_TABLES.reactionCounts).select('*').limit(100); if(error) throw error; return data || []; } catch(err){ return {}; } }
  return { isAvailable, getConsent, setConsent, revokeConsent, uploadSignal, syncLocalSignals, fetchPublicSignals, fetchDailyWeather, addReaction, fetchReactionCounts };
})();

const SocietyWeather = (() => {
  const phrases = { calm:'Blue weather over the Lantern District', chaos:'Electric pressure in the Storm Works', reflective:'Moonlit drift through the Archive', anxious:'Restless wind around the Weather Tower', joyful:'Soft bloom across the market', empty:'Quiet fog around the Society Gate', mixed:'Shifting sky over EchoSociety' };
  function countBy(signals, field){ return signals.reduce((acc, s)=>{ const k=s[field] || 'unknown'; acc[k]=(acc[k]||0)+1; return acc; }, {}); }
  function top(counts, fallback='empty'){ const entries=Object.entries(counts).sort((a,b)=>b[1]-a[1]); if(entries.length>1 && entries[0][1]===entries[1][1]) return 'mixed'; return entries[0]?.[0] || fallback; }
  function reactionTotals(){ const local=SocietySignals.listReactions(); return Object.values(local).flat().reduce((acc,r)=>{ acc[r]=(acc[r]||0)+1; return acc; }, {}); }
  function compute(){
    const signals=SocietySignals.listLocalSignals().filter((s)=>s.day===dayKey() || String(s.created_at||'').startsWith(dayKey()));
    const patterns=PatternEngine.analyze(state.echoes);
    const moodCounts=countBy(signals,'mood');
    if(patterns.dominantMood && !signals.length) moodCounts[patterns.dominantMood]=1;
    const dominant=top(moodCounts, signals.length ? 'mixed' : 'empty');
    const types=countBy(signals,'signal_type');
    const reactions=reactionTotals();
    const live=SocietySync.isAvailable();
    return { label:live?'Live Society Weather':'Local Preview Weather', total:signals.length, dominant_mood:dominant, lanterns_lit:types.lantern||0, storms_contained:types.storm||0, blooms_planted:types.bloom||0, archive_signals:types.archive||0, reaction_totals:reactions, phrase:phrases[dominant]||phrases.mixed, connected:live };
  }
  function render(){ const w=compute(); const reactionText=Object.entries(SOCIETY_REACTIONS).map(([key,label])=>`${label}: ${w.reaction_totals[key]||0}`).join(' · '); return `<section class="society-weather-card"><span>${escapeHTML(w.label)}</span><h4>${escapeHTML(w.phrase)}</h4><p>${escapeHTML(w.total)} anonymous signals today. ${w.connected ? 'Using Supabase when available.' : 'This is a local preview, not real global data.'}</p><div class="society-weather-grid"><b>${escapeHTML(w.dominant_mood)}</b><small>dominant mood</small><b>${w.lanterns_lit}</b><small>lanterns lit</small><b>${w.storms_contained}</b><small>storms contained</small><b>${w.blooms_planted}</b><small>blooms planted</small><b>${w.archive_signals}</b><small>archive signals</small><b>${Object.values(w.reaction_totals).reduce((a,b)=>a+b,0)}</b><small>reaction totals</small></div><small>${escapeHTML(reactionText)}</small></section>`; }
  return { compute, render };
})();

function getSocietyDistrictSuggestion(role='') {
  const map = { 'Lantern Keeper':'Lantern District', 'Stormwright':'Storm Works', 'Moon Archivist':'Moon Archive', 'Weather Cartographer':'Weather Tower', 'Bloom Tender':'Bloom Market', 'Signal Courier':'Signal Couriers’ Route', 'Relic Runner':'Signal Couriers’ Route', 'Archive Witness':'Moon Archive', 'Void Keeper':'Lantern District' };
  return map[role] || (role.includes('Storm') ? 'Storm Works' : role.includes('Bloom') ? 'Bloom Market' : role.includes('Archive') ? 'Moon Archive' : role.includes('Courier') ? 'Signal Couriers’ Route' : 'Weather Tower');
}

const EchoWorldRenderer = (() => {
  function prefersReduced(){ return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches; }
  function hasWebGL(){ try { const c=document.createElement('canvas'); return Boolean(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch { return false; } }
  function mode(){ return hasWebGL() && window.THREE ? 'webgl' : 'canvas2d'; }
  function renderCanvas2D(canvas){ if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; const w=canvas.width=canvas.clientWidth||720, h=canvas.height=canvas.clientHeight||220; ctx.clearRect(0,0,w,h); const g=ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,'#070a15'); g.addColorStop(1,'#21132b'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.strokeStyle='rgba(214,179,106,.45)'; ctx.lineWidth=2; [[.16,.55,.38,.32],[.38,.32,.58,.64],[.58,.64,.78,.36],[.38,.32,.78,.36]].forEach(([a,b,c,d])=>{ctx.beginPath();ctx.moveTo(w*a,h*b);ctx.lineTo(w*c,h*d);ctx.stroke();}); ['Lantern','Storm','Bloom','Archive','Weather','Alam'].forEach((label,i)=>{ const x=w*(.14+(i%3)*.32), y=h*(.32+Math.floor(i/3)*.34); ctx.fillStyle='rgba(214,179,106,.9)'; ctx.beginPath(); ctx.arc(x,y,8,0,6.28); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.72)'; ctx.font='11px monospace'; ctx.fillText(label,x+12,y+4); }); }
  function startSocietyBackground(canvas){ renderCanvas2D(canvas); if(prefersReduced()) return; }
  return { mode, hasWebGL, renderCanvas2D, startSocietyBackground, canvas2dFallback:true, webglGuarded:hasWebGL };
})();

const SignalCourierRoute = (() => {
  const missions = [
    {id:'deliver_lantern', label:'Deliver lantern to Lantern District', item:'lantern', to:'Lantern District', reward:{name:'Glow Thread', qty:1}},
    {id:'carry_storm_jar', label:'Carry storm jar to Storm Works', item:'storm jar', to:'Storm Works', reward:{name:'Storm Glass', qty:1}},
    {id:'bring_bloom_seed', label:'Bring bloom seed to Bloom Market', item:'bloom seed', to:'Bloom Market', reward:{name:'Bloom Seed', qty:1}},
    {id:'take_moon_letter', label:'Take moon letter to Moon Archive', item:'moon letter', to:'Moon Archive', reward:{name:'Moon Thread', qty:1}},
    {id:'deliver_weather_report', label:'Deliver weather report to Weather Tower', item:'weather report', to:'Weather Tower', reward:{name:'Compass Dust', qty:1}},
    {id:'carry_alam_note', label:'Carry “Alam’s weird note” to the Observatory', item:'alam note', to:'Alam AI Observatory', reward:{name:'Oracle Static', qty:1}}
  ];
  const nodes = {'Society Gate':[.50,.82], 'Lantern District':[.18,.32], 'Storm Works':[.44,.20], 'Bloom Market':[.74,.31], 'Moon Archive':[.26,.62], 'Weather Tower':[.61,.58], 'Alam AI Observatory':[.82,.68]};
  let open=false, raf=0, avatar={x:.50,y:.82,tx:.50,ty:.82}, active=null;
  function renderModal(){ return `<div class="courier-modal" id="courier-modal" role="dialog" aria-label="Signal Courier Route"><div class="courier-panel"><button class="courier-close" id="courier-close-btn">Close</button><h3>Signal Courier Route</h3><p>A tiny peaceful delivery prototype. No combat, no competitive scoring — just gold paths between districts.</p><div class="courier-layout"><canvas id="courier-canvas" width="680" height="420"></canvas><div class="courier-side"><h4>Delivery missions</h4>${missions.map(m=>`<button class="receipt-action-btn courier-mission" data-mission="${m.id}">${escapeHTML(m.label)}</button>`).join('')}<div class="courier-controls"><button data-move="up">↑</button><button data-move="left">←</button><button data-move="down">↓</button><button data-move="right">→</button></div><small>Tap a destination node or use the arrows.</small></div></div></div></div>`; }
  function openRoute(){ if(!document.getElementById('courier-modal')) document.body.insertAdjacentHTML('beforeend', renderModal()); open=true; document.body.style.overflow='hidden'; bind(); drawLoop(); }
  function closeRoute(){ open=false; cancelAnimationFrame(raf); document.getElementById('courier-modal')?.remove(); document.body.style.overflow=''; }
  function bind(){ const modal=document.getElementById('courier-modal'); document.getElementById('courier-close-btn')?.addEventListener('click', closeRoute); modal?.querySelectorAll('.courier-mission').forEach(btn=>btn.addEventListener('click',()=>{ active=missions.find(m=>m.id===btn.dataset.mission); const [x,y]=nodes[active.to]; avatar.tx=x; avatar.ty=y; Toast.show(`Courier carrying ${active.item}.`); })); modal?.querySelectorAll('[data-move]').forEach(btn=>btn.addEventListener('click',()=>{ const d=btn.dataset.move; avatar.tx=Math.max(.08,Math.min(.92,avatar.tx+(d==='left'?-0.08:d==='right'?0.08:0))); avatar.ty=Math.max(.10,Math.min(.88,avatar.ty+(d==='up'?-0.08:d==='down'?0.08:0))); })); document.getElementById('courier-canvas')?.addEventListener('pointerdown',(e)=>{ const c=e.currentTarget,r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height; let nearest=null,dist=99; Object.entries(nodes).forEach(([name,[nx,ny]])=>{ const d=Math.hypot(nx-x,ny-y); if(d<dist){dist=d;nearest=[name,nx,ny];} }); if(nearest){ avatar.tx=nearest[1]; avatar.ty=nearest[2]; } }); }
  function completeIfArrived(){ if(!active) return; const [x,y]=nodes[active.to]; if(Math.hypot(avatar.x-x,avatar.y-y)<.025){ VaultInventory.addMaterials([active.reward]); EchoAvatar.addXP?.(8, 'delivery_completed'); GentleQuests.evaluate('delivery_completed', active); SocietySignals.contributeDelivery(active); Toast.show(`Delivered ${active.item}. +${active.reward.qty} ${active.reward.name} · +8 XP`); active=null; rerenderSocietyGate(); } }
  function drawLoop(){ if(!open) return; const c=document.getElementById('courier-canvas'); const ctx=c?.getContext('2d'); if(ctx){ const w=c.width, h=c.height; avatar.x += (avatar.tx-avatar.x)*(window.matchMedia('(prefers-reduced-motion: reduce)').matches?1:.08); avatar.y += (avatar.ty-avatar.y)*(window.matchMedia('(prefers-reduced-motion: reduce)').matches?1:.08); ctx.clearRect(0,0,w,h); const g=ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,'#080b17'); g.addColorStop(1,'#21132b'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.strokeStyle='rgba(214,179,106,.36)'; ctx.lineWidth=3; Object.values(nodes).forEach(([x,y])=>{ctx.beginPath();ctx.moveTo(w*.5,h*.82);ctx.lineTo(w*x,h*y);ctx.stroke();}); Object.entries(nodes).forEach(([name,[x,y]])=>{ ctx.fillStyle=name===active?.to?'rgba(143,255,176,.95)':'rgba(214,179,106,.9)'; ctx.beginPath(); ctx.arc(w*x,h*y,10,0,6.28); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.78)'; ctx.font='12px DM Mono, monospace'; ctx.fillText(name,w*x+14,h*y+4); }); ctx.fillStyle='rgba(255,244,190,.98)'; ctx.shadowColor='rgba(214,179,106,.8)'; ctx.shadowBlur=18; ctx.beginPath(); ctx.arc(w*avatar.x,h*avatar.y,12,0,6.28); ctx.fill(); ctx.shadowBlur=0; if(active){ ctx.fillStyle='rgba(214,179,106,.9)'; ctx.fillText(`carrying: ${active.item}`,16,24); } completeIfArrived(); }
    raf=requestAnimationFrame(drawLoop);
  }
  return { missions, openRoute, closeRoute, delivery_completed:true };
})();

const AlamPrivacy = (() => {
  function shouldIncludeLatestEcho(){ return readLocalJSON('echovault_alam_ai_settings_v1', { includeLatestEcho:false }).includeLatestEcho === true; }
  function stripSensitiveContext(context={}){ const copy={...context}; delete copy.thought; delete copy.raw_thought; delete copy.full_echo; delete copy.user_text; delete copy.email; delete copy.display_name; return copy; }
  function buildSafeContext(options={}){ const patterns=PatternEngine.analyze(state.echoes); const arch=ArchetypeEngine.compute(patterns); const avatar=EchoAvatar.load?.() || {}; const context={ dominant_mood:patterns.dominantMood||'empty', emotional_weather:patterns.emotionalWeather||'quiet fog', archetype:arch.archetypeName, average_intensity:patterns.averageIntensity||0, average_silence:patterns.averageSilence||0, echo_count:patterns.totalEchoes||0, current_avatar_role:avatar.role||'Signal Courier', current_society_district:getSocietyDistrictSuggestion(avatar.role||'') };
    if(options.includeSocietyWeather) context.society_weather=SocietyWeather.compute().phrase;
    if(options.includeLatestEcho && shouldIncludeLatestEcho()) { const e=state.echoes?.[0]; context.latest_echo_summary=e?{ mood:e.mood, intensity:e.intensity, silence:e.silence }:null; }
    return stripSensitiveContext(context);
  }
  function canUseRemote(){ return Boolean(window.ECHOVAULT_CONFIG?.ALAM_AI_ENDPOINT); }
  return { buildSafeContext, canUseRemote, shouldIncludeLatestEcho, stripSensitiveContext };
})();

const AlamAI = (() => {
  const CHAT_KEY='echovault_alam_ai_chat_v1';
  const settingsKey='echovault_alam_ai_settings_v1';
  const examples=[
    'bro this is not a crisis arc, it’s weather with bad lighting. log one echo and don’t negotiate with the void.',
    'what in the fiqh is this coping mechanism? still, the signal is there. your silence is doing pushups.',
    'iman check: you’re not empty, you’re buffering. archive the feeling before it turns into mythology.',
    'the vault says: less explaining, more witnessing. put the thought down like a heavy bag.'
  ];
  function isRemoteAvailable(){ return Boolean(window.ECHOVAULT_CONFIG?.ALAM_AI_ENDPOINT); }
  function buildSafeContext(options={}){ return AlamPrivacy.buildSafeContext(options); }
  function localReply(prompt=''){ const lower=prompt.toLowerCase(); if(/self[- ]?harm|suicide|kill myself|hurt myself|dangerous instructions/.test(lower)) return 'I can’t help with harm instructions. Stay with a person, contact local emergency help if danger is near, and put one tiny signal in front of you: breathe, call, wait.'; const ctx=buildSafeContext(); const i=Math.abs((prompt.length + (ctx.echo_count||0) + String(ctx.dominant_mood).length) % examples.length); return examples[i]; }
  function loadChat(){ const arr=readLocalJSON(CHAT_KEY, []); return Array.isArray(arr)?arr.slice(-30):[]; }
  function saveChat(arr){ writeLocalJSON(CHAT_KEY, arr.slice(-30)); }
  function appendMessage(role,text){ const arr=loadChat(); arr.push({role,text:String(text).slice(0,1200),timestamp:new Date().toISOString(),mode:isRemoteAvailable()?'connected mode':'local reflection mode'}); saveChat(arr); const list=document.getElementById('alam-message-list'); if(list) list.insertAdjacentHTML('beforeend', `<div class="alam-msg ${escapeHTML(role)}"><b>${escapeHTML(role)}</b><p>${escapeHTML(text)}</p></div>`); list?.scrollTo(0,list.scrollHeight); }
  async function sendMessage(prompt, options={}){ const clean=String(prompt||'').trim(); if(!clean) return; appendMessage('you', clean); if(isRemoteAvailable()) { try { const body={ prompt:clean, context:buildSafeContext(options), options:{ includeLatestEcho:Boolean(options.includeLatestEcho), includeSocietyWeather:Boolean(options.includeSocietyWeather) } }; const res=await fetch(window.ECHOVAULT_CONFIG.ALAM_AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); if(!res.ok) throw new Error('remote failed'); const data=await res.json(); appendMessage('alam', data.reply || data.text || localReply(clean)); return; } catch(err){ Toast.show('Alam stayed local.'); } } appendMessage('alam', localReply(clean)); }
  function clearChat(){ localStorage.removeItem(CHAT_KEY); renderMessages(); Toast.show('Alam chat cleared.'); }
  function renderMessages(){ const list=document.getElementById('alam-message-list'); if(!list) return; const arr=loadChat(); list.innerHTML=arr.map(m=>`<div class="alam-msg ${escapeHTML(m.role)}"><b>${escapeHTML(m.role)}</b><p>${escapeHTML(m.text)}</p></div>`).join('') || '<p class="society-empty">Ask Alam when the coping mechanism starts asking for credentials.</p>'; }
  function renderPortal(){ const status=isRemoteAvailable()?'connected mode':'local reflection mode'; return `<section class="alam-portal" id="alam-portal"><div class="alam-orb"><span>alam</span></div><div><div class="echo-avatar-kicker">Alam AI Observatory</div><h4>Alam AI</h4><pre>what in the fiqh
is this coping mechanism
asking for my iman</pre><p class="alam-status">${status}</p><p class="alam-privacy-note">Alam AI uses a pattern summary by default. Raw echoes stay private unless you choose to include them.</p><button class="receipt-action-btn" id="alam-open-btn">Ask Alam</button></div></section>`; }
  function openChat(){ if(!document.getElementById('alam-chat-panel')) document.body.insertAdjacentHTML('beforeend', `<div class="alam-chat-panel" id="alam-chat-panel" role="dialog" aria-label="Alam AI chat"><div class="alam-chat-card"><button class="courier-close" id="alam-close-btn">Close</button><h3>Alam AI</h3><pre>what in the fiqh
is this coping mechanism
asking for my iman</pre><p class="alam-privacy-note">Pattern summary is ON. Include latest echo is optional and off by default.</p><div id="alam-message-list" class="alam-message-list"></div><label class="alam-toggle"><input type="checkbox" id="alam-include-latest"> include latest echo summary</label><label class="alam-toggle"><input type="checkbox" id="alam-include-weather" checked> include society weather</label><div class="alam-input-row"><input id="alam-input" maxlength="500" placeholder="ask the weird little oracle…"><button class="receipt-action-btn" id="alam-send-btn">Send</button></div><button class="settings-secondary-btn" id="alam-clear-btn">Clear Alam chat</button></div></div>`); document.body.style.overflow='hidden'; const settings=readLocalJSON(settingsKey,{includeLatestEcho:false}); const latest=document.getElementById('alam-include-latest'); if(latest) latest.checked=Boolean(settings.includeLatestEcho); bindChat(); renderMessages(); }
  function closeChat(){ document.getElementById('alam-chat-panel')?.remove(); document.body.style.overflow=''; }
  function bindChat(){ document.getElementById('alam-close-btn')?.addEventListener('click', closeChat); document.getElementById('alam-clear-btn')?.addEventListener('click', clearChat); document.getElementById('alam-include-latest')?.addEventListener('change',(e)=>{ writeLocalJSON(settingsKey,{...readLocalJSON(settingsKey,{}), includeLatestEcho:e.target.checked}); }); const send=()=>sendMessage(document.getElementById('alam-input')?.value,{includeLatestEcho:document.getElementById('alam-include-latest')?.checked,includeSocietyWeather:document.getElementById('alam-include-weather')?.checked}).then(()=>{ const input=document.getElementById('alam-input'); if(input) input.value=''; }); document.getElementById('alam-send-btn')?.addEventListener('click',send); document.getElementById('alam-input')?.addEventListener('keydown',(e)=>{ if(e.key==='Enter') send(); }); }
  return { CHAT_KEY, isRemoteAvailable, buildSafeContext, localReply, sendMessage, renderPortal, openChat, closeChat, appendMessage, clearChat };
})();

function districtActivityCounts() { const counts={}; SocietySignals.listLocalSignals().forEach((s)=>{ counts[s.district]=(counts[s.district]||0)+1; }); return counts; }
function districtCard({key,title,description,roles,action,id,icon,visual}) { const counts=districtActivityCounts(); return `<article class="society-district ${visual||''}"><canvas class="district-visual" width="180" height="70" aria-hidden="true"></canvas><div class="society-district-icon">${icon}</div><h5>${escapeHTML(title)}</h5><p>${escapeHTML(description)}</p><small>${escapeHTML(counts[title]||0)} current activity · Roles: ${escapeHTML(roles.join(', '))}</small><button class="receipt-action-btn" id="${id}">${escapeHTML(action)}</button></article>`; }

function buildEchoSocietyGate() {
  const avatar = EchoAvatar.load?.() || {};
  const hasAvatar = Boolean(Object.keys(avatar).length && avatar.role);
  const artifactCount = ArtifactArchive.listArtifacts().length;
  const unlocked = hasAvatar && state.echoes.length >= 5 && artifactCount >= 1;
  const consent = SocietySignals.getConsent();
  const district = getSocietyDistrictSuggestion(avatar.role || '');
  const requirements = `<ul class="society-requirements"><li class="${hasAvatar?'met':'missing'}">Create Echo Avatar</li><li class="${state.echoes.length >= 5?'met':'missing'}">Create 5 private echoes</li><li class="${artifactCount >= 1?'met':'missing'}">Save 1 artifact</li></ul>`;
  const echoCircles = `<section class="echo-circles-placeholder"><h4>Echo Circles</h4><p>Small symbolic circles are coming later. No public diary feed. No follower system. No raw echoes.</p></section>`;
  if (!unlocked) return `<section class="echo-society-room society-locked"><div class="echo-avatar-kicker">Society Gate</div><h4>Society Gate is still sealed.</h4><p>EchoSociety opens only after your private vault has enough shape to enter without giving away raw echoes.</p><p>Society role: ${escapeHTML(avatar.role || 'unformed')} · Recommended district: ${escapeHTML(district)}</p><b>Requirements:</b>${requirements}${AlamAI.renderPortal()}${echoCircles}</section>`;
  const privacy = `<section class="society-privacy-panel" id="society-privacy-panel" ${consent ? 'hidden' : ''}><div class="echo-avatar-kicker">Privacy Rules</div><h4>Privacy Rules</h4><p>${escapeHTML(SocietyPrivacy.explainPrivacy())}</p><p>You choose when to contribute. You can revoke consent anytime.</p><div class="society-actions"><button class="receipt-action-btn" id="society-understand-btn">I Understand</button><button class="receipt-action-btn ghost" id="society-stay-private-btn">Stay Private</button></div></section>`;
  const intro = `<section class="echo-society-room"><div class="echo-avatar-kicker">Society Gate</div><h4>Welcome to EchoSociety.</h4><p>A shared city built from anonymous symbolic signals — not a public diary feed.</p><p class="society-recommendation">Society role: <b>${escapeHTML(avatar.role || 'Signal Courier')}</b> · Recommended district: <b>${escapeHTML(district)}</b></p><div class="society-actions"><button class="receipt-action-btn" id="society-enter-btn">Enter Society</button><button class="receipt-action-btn ghost" id="society-private-btn">Stay Private</button><button class="receipt-action-btn" id="society-privacy-btn">Privacy Rules</button></div><small>${consent ? 'Consent stored locally; cloud consent syncs when logged in.' : 'Entry waits for consent; local mode remains fully usable.'}</small></section>`;
  const districts = [
    {title:'Lantern District', description:'Blue lantern balconies for quiet signals and void-safe witnessing.', roles:['Lantern Keeper','Void Keeper'], action:'Light Lantern', id:'society-lantern-btn', icon:'🕯️'},
    {title:'Storm Works', description:'Copper storm engines where intense weather becomes contained sparks.', roles:['Stormwright'], action:'Add Storm Spark', id:'society-storm-btn', icon:'⚡'},
    {title:'Bloom Market', description:'Soft stalls trading bloom seeds, green lamps, and tiny mercies.', roles:['Bloom Tender'], action:'Plant Bloom', id:'society-bloom-btn', icon:'🌸'},
    {title:'Moon Archive', description:'A moonlit shelf for optional symbolic witness marks, not raw diary sharing.', roles:['Moon Archivist','Archive Witness'], action:'Leave Anonymous Line', id:'society-archive-btn', icon:'🌙'},
    {title:'Weather Tower', description:'A high glass compass that turns anonymous signals into shared weather.', roles:['Weather Cartographer'], action:'Contribute Weather', id:'society-weather-btn', icon:'🧭'},
    {title:'Signal Couriers’ Route', description:'Gold paths for peaceful artifact deliveries between districts.', roles:['Signal Courier','Relic Runner'], action:'Start Delivery', id:'society-delivery-btn', icon:'✦'},
    {title:'Alam AI Observatory', description:'A glitchy cosmic terminal where Alam speaks in local reflection mode first.', roles:['Signal Courier','Moon Archivist'], action:'Open Alam AI', id:'society-alam-btn', icon:'🟣'}
  ].map(districtCard).join('');
  const archiveInput = `<div class="society-archive-note"><input class="society-archive-input" id="society-archive-line" maxlength="80" placeholder="optional line, local preview only…"><small>For now the line is not uploaded; only a symbolic archive marker is used.</small></div>`;
  const signals = SocietySignals.listLocalSignals().slice(0,8).map(signal => `<article class="society-signal" data-signal-id="${escapeHTML(signal.id)}"><span>${escapeHTML(signal.anonymous_label)}</span><b>${escapeHTML(signal.signal_type)} · ${escapeHTML(signal.mood)}</b><small>${escapeHTML(signal.district)} · ${escapeHTML(signal.intensity_band)} intensity · ${escapeHTML(signal.silence_band)} silence · ${escapeHTML(signal.archetype)}</small><div class="society-reactions">${Object.entries(SOCIETY_REACTIONS).map(([key,label])=>`<button data-reaction="${key}">${label}</button>`).join('')}</div></article>`).join('') || '<p class="society-empty">No local society signals yet. Contributions stay symbolic.</p>';
  return `${intro}${privacy}<section class="society-private-state" id="society-private-state" hidden><h4>You stayed private.</h4><p>EchoSociety will not receive signals.</p><button class="receipt-action-btn" id="society-private-rules-btn">Review Privacy Rules</button></section><section class="society-city" id="society-city" ${consent ? '' : 'hidden'}><div class="society-city-sky"><canvas id="society-particles-canvas" width="720" height="220" aria-hidden="true"></canvas></div><div class="society-district-grid">${districts}</div>${archiveInput}${SocietyWeather.render()}${AlamAI.renderPortal()}<section class="society-local-signals"><h4>Local symbolic signals</h4>${signals}</section>${echoCircles}</section>`;
}

function updateSocietyConsentUI(options={}) {
  const consent = SocietySignals.getConsent();
  const privacyPanel = document.getElementById('society-privacy-panel');
  const city = document.getElementById('society-city');
  const privatePanel = document.getElementById('society-private-state');
  if (city) { city.hidden = !consent; city.querySelectorAll('button,input,textarea,select').forEach((el) => { el.disabled = !consent; }); }
  if (privacyPanel) privacyPanel.hidden = consent || Boolean(options.privateState);
  if (privatePanel) privatePanel.hidden = !(options.privateState && !consent);
  if (consent) setTimeout(()=>EchoWorldRenderer.startSocietyBackground(document.getElementById('society-particles-canvas')), 60);
}
function rerenderSocietyGate() { const panel = document.querySelector('[data-room-panel="society"]'); if (!panel) return false; panel.innerHTML = buildEchoSocietyGate(); bindEchoSocietyGate(); return true; }
function bindEchoSocietyGate() {
  const showPrivacy = () => { document.getElementById('society-privacy-panel')?.removeAttribute('hidden'); document.getElementById('society-private-state')?.setAttribute('hidden',''); updateSocietyConsentUI({ privateState:false }); };
  const stayPrivate = () => { SocietySignals.revokeConsent(); updateSocietyConsentUI({ privateState:true }); Toast.show('EchoSociety will not receive signals.'); };
  document.getElementById('society-privacy-btn')?.addEventListener('click', showPrivacy);
  document.getElementById('society-private-rules-btn')?.addEventListener('click', showPrivacy);
  document.getElementById('society-enter-btn')?.addEventListener('click', () => SocietySignals.getConsent() ? updateSocietyConsentUI({ privateState:false }) : showPrivacy());
  document.getElementById('society-private-btn')?.addEventListener('click', stayPrivate);
  document.getElementById('society-stay-private-btn')?.addEventListener('click', stayPrivate);
  document.getElementById('society-understand-btn')?.addEventListener('click', () => { SocietySignals.setConsent(true); Toast.show('EchoSociety consent saved.'); rerenderSocietyGate() || updateSocietyConsentUI({ privateState:false }); });
  const contribute = (fn, msg) => { const signal = fn(); if (!signal) { updateSocietyConsentUI({ privateState:true }); return; } Toast.show(msg); rerenderSocietyGate(); };
  document.getElementById('society-lantern-btn')?.addEventListener('click', () => contribute(SocietySignals.contributeLantern, 'Anonymous lantern lit.'));
  document.getElementById('society-storm-btn')?.addEventListener('click', () => contribute(SocietySignals.contributeStorm, 'Storm spark contained.'));
  document.getElementById('society-bloom-btn')?.addEventListener('click', () => contribute(SocietySignals.contributeBloom, 'Bloom seed planted.'));
  document.getElementById('society-weather-btn')?.addEventListener('click', () => contribute(SocietySignals.contributeWeather, 'Weather signal added.'));
  document.getElementById('society-archive-btn')?.addEventListener('click', () => contribute(() => SocietySignals.contributeArchiveLine(document.getElementById('society-archive-line')?.value || ''), 'Moon Archive symbolic marker saved.'));
  document.getElementById('society-delivery-btn')?.addEventListener('click', () => { if(!SocietyPrivacy.requireConsent()) return; SignalCourierRoute.openRoute(); });
  document.getElementById('society-alam-btn')?.addEventListener('click', () => { SocietySignals.contributeAlam(); AlamAI.openChat(); });
  document.getElementById('alam-open-btn')?.addEventListener('click', AlamAI.openChat);
  document.querySelectorAll('.society-reactions button').forEach(btn => btn.addEventListener('click', () => { const id=btn.closest('.society-signal')?.dataset.signalId; const reaction = SocietySignals.addReaction(id, btn.dataset.reaction); if (!reaction) { updateSocietyConsentUI({ privateState:true }); return; } btn.classList.add('active'); Toast.show(`${btn.textContent.trim()} symbol recorded.`); }));
  updateSocietyConsentUI({ privateState:false });
}

function startSocietyParticles() { EchoWorldRenderer.startSocietyBackground(document.getElementById('society-particles-canvas')); }

const CinematicCardRenderer = (() => {
  const MOOD_AURA = { calm:'#6ba2d0', chaos:'#cf5a74', reflective:'#8f79d8', anxious:'#c8935a', joyful:'#8bc97f', empty:'#7f8798' };
  function drawGrain(ctx, width, height) { for (let i=0;i<2200;i++){const a=Math.random()*.09;ctx.fillStyle=`rgba(255,255,255,${a})`;ctx.fillRect(Math.random()*width,Math.random()*height,1,1);} }
  function drawMoodAura(ctx, mood, x, y, radius){const c=MOOD_AURA[mood]||MOOD_AURA.reflective;const g=ctx.createRadialGradient(x,y,0,x,y,radius);g.addColorStop(0,`${c}66`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,radius,0,6.28);ctx.fill();}
  function drawEchoVaultMark(ctx){ctx.fillStyle='rgba(214,179,106,.9)';ctx.font='500 24px "DM Mono"';ctx.fillText('ECHOVAULT',80,1275);ctx.strokeStyle='rgba(214,179,106,.4)';ctx.beginPath();ctx.moveTo(80,1248);ctx.lineTo(1000,1248);ctx.stroke();}
  function base(title,subtitle,mood='reflective',type='artifact'){const c=document.createElement('canvas');c.width=1080;c.height=1350;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,1080,1350);g.addColorStop(0,'#0b1021');g.addColorStop(1,'#160f1d');x.fillStyle=g;x.fillRect(0,0,1080,1350);drawMoodAura(x,mood,540,520,420);drawGrain(x,1080,1350);x.fillStyle='#d6b36a';x.font='700 62px "Playfair Display"';x.fillText(title,80,148);x.strokeStyle='rgba(214,179,106,.35)';x.beginPath();x.moveTo(80,182);x.lineTo(1000,182);x.stroke();x.fillStyle='#cfd2dc';x.font='32px "Cormorant Garamond"';x.fillText(subtitle||'',80,244);x.fillStyle='rgba(255,255,255,.74)';x.font='500 20px "DM Mono"';x.fillText(type.toUpperCase(),80,292);x.fillText(new Date().toLocaleDateString(),860,292);drawEchoVaultMark(x);return c;}
  const renderRelicCard=(r)=>{const c=base(r.title,`${r.rarity} · ${r.coordinates}`,r.mood,'relic');const x=c.getContext('2d');x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.arc(540,710,110,0,6.28);x.fill();x.fillStyle='rgba(12,14,18,.9)';x.beginPath();x.arc(540,710,76,0,6.28);x.fill();return c;};
  const renderWeatherCard=(w)=>{const c=base('Weather Room',`${w.name} · ${w.summary}`,w.mood,'weather');const x=c.getContext('2d');for(let i=0;i<14;i++){x.strokeStyle='rgba(255,255,255,.2)';x.beginPath();x.arc(540,720,120+i*22,0,6.28);x.stroke();}return c;};
  const renderArchetypeCard=(a)=>base('Archetype Hall',`${a.name||a.archetypeName||'Unknown'}`,a.dominantMood||'reflective','archetype');
  const renderSoundprintCard=(s)=>{const c=base('Soundprint Wall',`${s.mood||'reflective'} resonance`,s.mood||'reflective','soundprint');const x=c.getContext('2d');x.fillStyle='rgba(20,22,28,.85)';x.fillRect(300,560,480,480);x.strokeStyle='rgba(214,179,106,.5)';x.strokeRect(300,560,480,480);return c;};
  const downloadCanvas=(canvas,filename='echovault-card.png')=>{const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download=filename;a.click();};
  const saveCardAsArtifact=(type,data,imageDataUrl)=>ArtifactArchive.saveArtifact({type,title:data.title||type,subtitle:data.description||'',data,imageDataUrl,favorite:false});
  return {renderRelicCard,renderWeatherCard,renderArchetypeCard,renderSoundprintCard,downloadCanvas,saveCardAsArtifact};
})();

const WeatherMap = (() => {
  const WEATHER_COPY = {
    calm: ['Calm Tides','Blue rings drift in steady breath.'],
    chaos: ['Chaos Front','Electric fractures move through the atmosphere.'],
    reflective: ['Reflective Night','Moon arcs and orbit trails hold a thoughtful sky.'],
    anxious: ['Restless Wind','Amber spirals circle with alert motion.'],
    joyful: ['Bloom Current','Petals and rising light open brighter air.'],
    empty: ['Quiet Haze','Soft fog stretches into spacious silence.']
  };
  function compute(echoes=[]) {
    const recent = echoes.slice(0,14);
    const patterns = PatternEngine.analyze(recent);
    const mood = patterns?.dominantMood || recent[0]?.mood || 'empty';
    const [name, summary] = WEATHER_COPY[mood] || WEATHER_COPY.empty;
    return { name, summary, mood, intensity: patterns.averageIntensity||0, silence: patterns.averageSilence||0, density: Math.max(10, recent.length*6), total: recent.length };
  }
  function render(canvas, data) {
    if (!canvas || !data) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = Math.max(280, canvas.clientWidth || 320);
    const h = canvas.height = Math.max(190, canvas.clientHeight || 220);
    ctx.clearRect(0,0,w,h);
    const g = ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,'#0a0f1d'); g.addColorStop(1,'#120d18'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    const fog = Math.min(.38, .08 + data.silence/20); ctx.fillStyle=`rgba(190,190,210,${fog})`; ctx.fillRect(0,0,w,h);
    const mood = data.mood;
    for (let i=0;i<data.density;i++) { const x=Math.random()*w,y=Math.random()*h; ctx.fillStyle='rgba(214,179,106,.14)'; ctx.beginPath(); ctx.arc(x,y,Math.random()*1.8,0,6.28); ctx.fill(); }
    if (mood==='calm') { ctx.strokeStyle='rgba(110,165,210,.4)'; for (let i=0;i<5;i++){ctx.beginPath(); ctx.arc(w*(.2+i*.16),h*.55,26+i*8,0,6.28); ctx.stroke();}}
    if (mood==='chaos') { for(let i=0;i<14;i++){ctx.strokeStyle='rgba(216,82,120,.65)'; ctx.beginPath(); const x=Math.random()*w,y=Math.random()*h; ctx.moveTo(x,y); ctx.lineTo(x+Math.random()*34-17,y+Math.random()*30-15); ctx.stroke();}}
    if (mood==='reflective') { ctx.strokeStyle='rgba(148,120,220,.45)'; ctx.beginPath(); ctx.arc(w*.5,h*.5,64,0.5,5.8); ctx.stroke(); }
    if (mood==='anxious') { for(let i=0;i<8;i++){ctx.strokeStyle='rgba(210,150,78,.45)'; ctx.beginPath(); ctx.arc(w*(.2+i*.1),h*.58,18+i*4,0.2,4.9); ctx.stroke();}}
    if (mood==='joyful') { for(let i=0;i<16;i++){ctx.fillStyle='rgba(152,210,120,.55)'; ctx.fillRect(Math.random()*w,Math.random()*h,2,2);}}
    ctx.fillStyle='#d6b36a'; ctx.font='600 14px "DM Mono"'; ctx.fillText(data.name,14,20);
  }
  return { compute, render };
})();
const Rituals = (() => {
  const modal   = document.getElementById('fun-modal');
  const content = document.getElementById('fun-modal-content');
  let receiptTheme = 'classic';

  const RITUAL_OB_SHOWN_KEY = 'echoRitualOb';

  function getRitualOb(type) {
    try { return JSON.parse(localStorage.getItem(RITUAL_OB_SHOWN_KEY) || '{}'); } catch(e) { return {}; }
  }
  function markRitualObShown(type) {
    const shown = getRitualOb();
    shown[type] = true;
    localStorage.setItem(RITUAL_OB_SHOWN_KEY, JSON.stringify(shown));
  }

  const RITUAL_OB_DATA = {
    receipt:  { icon:'🧾', title:'Your Mood Receipt', body:'This is a <strong>receipt of your emotions</strong> — itemized, timestamped, and totally yours. Pick a theme, then save or share your emotional bill.' },
    dna:      { icon:'🧬', title:'Your Emotion DNA', body:'This card reveals your <strong>emotional archetype</strong> — the pattern woven through all your echoes. It shifts as you do.' },
    crash:    { icon:'💻', title:'Crash Report', body:'When feelings overflow, systems crash. This is your <strong>emotional stack trace</strong> — absurd, honest, and very real.' },
    sound:    { icon:'🎧', title:'Echo Soundprint', body:'Music matched to your current emotional frequency. <strong>Tap Spotify or YouTube</strong> to open the song. Breathe with the orb below.' },
    shatter:  { icon:'🪞', title:'Shatter Softly', body:'A quiet ritual of release. <strong>Tap the surface</strong> to begin cracking it. Hold to spread the fractures. Let it break when you\'re ready.<br><br>This is not a game. It\'s a ceremony.' },
    vsvs:     { icon:'⚔️', title:'Inner Conflict', body:'Your past self meets your present self. <strong>Drag the orbs</strong> to push them apart or let them collide. Watch what happens between them.' }
  };

  function showRitualOnboarding(type, onStart) {
    const data = RITUAL_OB_DATA[type];
    if (!data) { onStart(); return; }
    const overlay = document.createElement('div');
    overlay.className = 'ritual-ob-overlay';
    overlay.innerHTML = `
      <div class="ritual-ob-card">
        <span class="ritual-ob-icon">${data.icon}</span>
        <div class="ritual-ob-title">${data.title}</div>
        <div class="ritual-ob-body">${data.body}</div>
        <button class="ritual-ob-start" id="rob-start">Begin →</button>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#rob-start').addEventListener('click', () => {
      overlay.remove();
      markRitualObShown(type);
      onStart();
    });
  }

  function open(type) {
    const builders = {museum:buildMuseum,lantern:buildLantern,stormjar:buildStormJar,receipt:buildReceipt, dna:buildDNA, crash:buildCrash, sound:buildSound, vsvs:buildConflict, shatter:buildShatter};
    const fn = builders[type];
    if (!fn) return;
    const shown = getRitualOb();
    const doOpen = () => {
      try {
        content.innerHTML = fn();
      } catch (error) {
        console.warn('Ritual failed to render', error);
        content.innerHTML = type === 'receipt'
          ? '<div class="receipt-error-card"><h3>Receipt unavailable</h3><p>Your echoes are safe. Try refreshing the app cache or creating one new echo.</p></div>'
          : '<div class="ritual-error-card"><h3>Ritual unavailable</h3><p>Your vault is safe. Try refreshing the app cache.</p></div>';
      }
      modal.classList.add('open');
      postBuild(type);
    };
    if (!shown[type]) {
      showRitualOnboarding(type, doOpen);
    } else {
      doOpen();
    }
  }

  function postBuild(type) {
    if (type === 'vsvs') setTimeout(startConflictAnimation, 100);
    if (type === 'shatter') setTimeout(() => ShatterSoftly.init(), 80);
    if (type === 'museum') {
      const w = WeatherMap.compute(state.echoes);
      WeatherMap.render(document.getElementById('weather-map-canvas'), w);
      GentleQuests.evaluate('weather_room_visited', w);
      EchoAvatar.bind();
      bindEchoSocietyGate();
      document.querySelectorAll('.museum-tab').forEach(btn=>btn.addEventListener('click',()=>{
        const room = btn.dataset.room;
        document.querySelectorAll('.museum-tab,.museum-room').forEach(el=>el.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.querySelector(`[data-room-panel="${room}"]`);
        panel?.classList.add('active');
        document.querySelector('.museum-shell')?.setAttribute('data-room', room);
        if (room === 'crafting') GentleQuests.evaluate('crafting_table_visited');
      }));
      document.getElementById('dl-weather')?.addEventListener('click',()=>CinematicCardRenderer.downloadCanvas(CinematicCardRenderer.renderWeatherCard(w),'weather-card.png'));
      document.getElementById('save-weather')?.addEventListener('click',()=>{ArtifactArchive.saveArtifact({type:'weather',title:w.name,subtitle:w.summary,data:w});Toast.show('Weather artifact saved ✓');});
      document.getElementById('dl-arch')?.addEventListener('click',()=>{const p=ArchetypeEngine.compute(PatternEngine.analyze(state.echoes));CinematicCardRenderer.downloadCanvas(CinematicCardRenderer.renderArchetypeCard(p),'archetype-card.png');});
      document.getElementById('dl-sound')?.addEventListener('click',()=>CinematicCardRenderer.downloadCanvas(CinematicCardRenderer.renderSoundprintCard({mood:state.echoes[0]?.mood}),'soundprint-card.png'));
      document.querySelectorAll('.relic-dl').forEach(btn=>btn.addEventListener('click',()=>{const r=RelicEngine.fromEchoes(state.echoes).find(x=>x.id===btn.dataset.id);if(!r)return;const c=CinematicCardRenderer.renderRelicCard(r);CinematicCardRenderer.downloadCanvas(c,`${r.title}.png`);}));
      document.querySelectorAll('.relic-save').forEach(btn=>btn.addEventListener('click',()=>{const r=RelicEngine.fromEchoes(state.echoes).find(x=>x.id===btn.dataset.id);if(!r)return;ArtifactArchive.saveArtifact({type:'relic',title:r.title,subtitle:r.description,data:r});btn.closest('.relic-item')?.classList.add('is-saved');Toast.show('Relic saved ✓');}));
      document.querySelectorAll('.art-del').forEach(btn=>btn.addEventListener('click',()=>{if(confirm('Remove this artifact from your local museum?')){ArtifactArchive.deleteArtifact(btn.dataset.id);btn.closest('.artifact-row')?.remove();}}));
      document.querySelectorAll('.art-fav').forEach(btn=>btn.addEventListener('click',()=>{ArtifactArchive.toggleFavorite(btn.dataset.id);btn.classList.toggle('active');}));
      document.querySelectorAll('.craft-btn').forEach(btn=>btn.addEventListener('click',()=>{const result=RelicCrafting.craft(btn.dataset.recipeId);if(result.ok){const preview=document.getElementById('crafted-preview');if(preview){preview.hidden=false;preview.innerHTML=`<b>Crafted Relic</b><span>${escapeHTML(result.artifact.title)}</span><small>${escapeHTML(result.artifact.description || result.artifact.subtitle || '')}</small>`;} refreshEchoDependentUI();}else if(result.missing?.length){Toast.show(`Missing: ${result.missing.map(m=>`${m.qty} ${m.name}`).join(', ')}`);}}));
      document.getElementById('save-receipt-latest')?.addEventListener('click',()=>{
        const data = safeGetReceiptData('latest');
        if (!data) return;
        ArtifactArchive.saveArtifact({ type:'receipt', title:'Mood Receipt', subtitle:data.insight, data });
        GentleQuests.evaluate('receipt_exported');
        Toast.show('Receipt saved ✓');
      });
    }
    if (type === 'lantern') initLanternInteraction();
    if (type === 'stormjar') initStormJarInteraction();
    if (type === 'sound') {
      const relieverOrb = document.getElementById('reliever-orb');
      if (relieverOrb) {
        let breathing = false;
        relieverOrb.addEventListener('click', () => {
          breathing = !breathing;
          relieverOrb.style.animationPlayState = breathing ? 'running' : 'paused';
          if (breathing) {
            relieverOrb.style.boxShadow = '0 0 32px rgba(201,168,76,.3)';
            setTimeout(() => { relieverOrb.style.boxShadow = ''; }, 2000);
          }
        });
      }
    }
    if (type === 'receipt') {
      const replayBtn = document.createElement('button');
      replayBtn.className = 'ritual-ob-replay';
      replayBtn.textContent = '? how to use';
      replayBtn.addEventListener('click', () => showRitualOnboarding('receipt', () => {}));
      content.appendChild(replayBtn);
      document.querySelectorAll('.receipt-themes .theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          receiptTheme = btn.dataset.theme;
          document.querySelectorAll('.receipt-themes .theme-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const mainArea = document.querySelector('.receipt-main-area');
          if (mainArea) mainArea.innerHTML = buildReceiptCore();
        });
      });
      document.querySelector(`.theme-btn[data-theme="${receiptTheme}"]`)?.classList.add('active');
      document.querySelectorAll('.receipt-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.receipt-mode-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const mainArea = document.querySelector('.receipt-main-area');
          if (mainArea) mainArea.innerHTML = buildReceiptCore(btn.dataset.mode || 'latest');
        });
      });
      document.getElementById('receipt-download-btn')?.addEventListener('click', downloadReceipt);
      document.getElementById('receipt-copy-btn')?.addEventListener('click', copyReceiptSummary);
      document.getElementById('receipt-close-btn')?.addEventListener('click', close);
    }
    // Add replay button to all rituals
    if (['dna','crash','sound','shatter','vsvs'].includes(type)) {
      const replayBtn = document.createElement('button');
      replayBtn.className = 'ritual-ob-replay';
      replayBtn.style.cssText='display:block;margin:14px auto 0;';
      replayBtn.textContent = '? how to use';
      replayBtn.addEventListener('click', () => showRitualOnboarding(type, () => {}));
      content.appendChild(replayBtn);
    }
  }


  function initLanternInteraction(){const canvas=document.getElementById('lantern-canvas');if(!canvas)return;const ctx=canvas.getContext('2d');let glow=.4,taps=0,time=0,completed=false;const mood=PatternEngine.analyze(state.echoes).dominantMood||'reflective';const particles=[];const msg=document.getElementById('lantern-msg');const scene=document.querySelector('.lantern-scene');const frame=()=>{const w=canvas.width,h=canvas.height;time+=.012;ctx.clearRect(0,0,w,h);ctx.fillStyle='#07090f';ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba(80,90,110,.12)';ctx.fillRect(0,h*.7,w,h*.3);const r=28+glow*8+Math.sin(time)*2;const g=ctx.createRadialGradient(w/2,h*.56,0,w/2,h*.56,r*2.2);g.addColorStop(0,`rgba(240,198,115,${.2+glow*.1})`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(w/2,h*.56,r*2.2,0,6.28);ctx.fill();ctx.fillStyle=`rgba(243,201,126,${.5+glow*.06})`;ctx.beginPath();ctx.arc(w/2,h*.58,r,0,6.28);ctx.fill();for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.y-=p.vy;p.x+=p.vx;p.life-=.02;ctx.fillStyle=`rgba(248,214,155,${Math.max(0,p.life)})`;ctx.fillRect(p.x,p.y,2,2);if(p.life<=0)particles.splice(i,1);}if(document.getElementById('lantern-canvas') && document.getElementById('fun-modal')?.classList.contains('open')) requestAnimationFrame(frame)};frame();canvas.addEventListener('click',()=>{taps++;glow=Math.min(8,glow+1);scene?.setAttribute('data-state',taps>=4?'alive':(taps>=2?'faint':'unlit'));for(let i=0;i<6+taps;i++)particles.push({x:canvas.width/2+(Math.random()*36-18),y:canvas.height*.55,vx:Math.random()*.8-.4,vy:1+Math.random()*1.4,life:.8});if(taps===1)msg.textContent='The lantern wakes.';if(taps===2)msg.textContent='A faint warmth answers.';if(taps>=4){msg.textContent='Still here is still a signal.';document.getElementById('lantern-actions').hidden=false;scene?.classList.add('ritual-complete');if(!completed){completed=true;GentleQuests.evaluate('lantern_lit');VaultInventory.addMaterials([{name:'Moon Thread',qty:1}]);Toast.show('+1 Moon Thread');}}});document.getElementById('save-lantern')?.addEventListener('click',()=>{ArtifactArchive.saveArtifact({type:'lantern',title:'Void Lantern',subtitle:'Still here is still a signal.',data:{glowLevel:glow,mood,created_at:new Date().toISOString()}});Toast.show('Lantern saved to museum ✓');});document.getElementById('dl-lantern')?.addEventListener('click',()=>CinematicCardRenderer.downloadCanvas(CinematicCardRenderer.renderRelicCard({title:'Void Lantern',rarity:'luminous',coordinates:'EV-LIGHT',mood}),'void-lantern-card.png'));}
  function initStormJarInteraction(){const canvas=document.getElementById('storm-canvas');if(!canvas)return;const ctx=canvas.getContext('2d');const p=PatternEngine.analyze(state.echoes);let sparks=Math.max(10,Math.round((p.averageIntensity||4)*2));let taps=0,shake=0,flash=0;const msg=document.getElementById('storm-msg');const scene=document.querySelector('.storm-scene');const draw=()=>{const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#080a12';ctx.fillRect(0,0,w,h);const ox=(Math.random()-.5)*shake;ctx.save();ctx.translate(ox,0);ctx.strokeStyle='rgba(180,200,255,.65)';ctx.lineWidth=2;ctx.strokeRect(w/2-70,h/2-90,140,180);ctx.restore();for(let i=0;i<sparks;i++){ctx.strokeStyle='rgba(222,82,120,.6)';ctx.beginPath();const x=w/2-50+Math.random()*100,y=h/2-70+Math.random()*140;ctx.moveTo(x,y);ctx.lineTo(x+Math.random()*22-11,y+Math.random()*22-11);ctx.stroke();}if(flash>0){ctx.strokeStyle=`rgba(255,230,180,${flash})`;ctx.beginPath();ctx.moveTo(w/2-20,h/2-70);ctx.lineTo(w/2+16,h/2-30);ctx.lineTo(w/2-8,h/2+20);ctx.stroke();flash=Math.max(0,flash-.06);}shake*=.88;if(document.getElementById('storm-canvas') && document.getElementById('fun-modal')?.classList.contains('open')) requestAnimationFrame(draw)};draw();canvas.addEventListener('click',()=>{taps++;sparks=Math.min(52,sparks+4);shake=Math.min(14,shake+4);scene?.setAttribute('data-state',taps>=3?'contained':(taps>=2?'awake':'still'));if(taps===1)msg.textContent='Sparks begin to gather.';if(taps===2){msg.textContent='The jar trembles.';flash=.9;}if(taps>=3){msg.textContent='The storm has shape now.';document.getElementById('storm-actions').hidden=false;scene?.classList.add('ritual-complete');}});document.getElementById('save-storm')?.addEventListener('click',()=>{ArtifactArchive.saveArtifact({type:'stormjar',title:'Storm Jar',subtitle:'The storm has shape now.',data:{sparkCount:sparks,mood:'chaos',created_at:new Date().toISOString()}});Toast.show('Storm saved to museum ✓');});document.getElementById('dl-storm')?.addEventListener('click',()=>CinematicCardRenderer.downloadCanvas(CinematicCardRenderer.renderWeatherCard({name:'Storm Jar',summary:'The storm has shape now.',mood:'chaos'}),'storm-jar-card.png'));}
  function close() { modal.classList.remove('open'); }

  /* Character image pool */
  const CHAR_IMGS = [
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894015/IMG-20260423-WA0059_bz1ohb.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894015/IMG-20260423-WA0060_pifgne.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894022/IMG-20260423-WA0050_tae532.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894023/IMG-20260423-WA0051_c6weox.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894023/IMG-20260423-WA0048_wa1llc.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894024/IMG-20260423-WA0046_wvwgih.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894023/IMG-20260423-WA0047_pvaiyt.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894028/IMG-20260423-WA0039_kgdhkf.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894036/IMG-20260423-WA0030_jgq4fu.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894035/IMG-20260423-WA0029_grxw4f.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894039/IMG-20260423-WA0027_ebzfqh.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894040/IMG-20260423-WA0023_hcoixa.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894040/IMG-20260423-WA0024_ydfk93.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894044/IMG-20260423-WA0020_zub07i.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894045/IMG-20260423-WA0018_qibyfe.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894045/IMG-20260423-WA0016_nnwwed.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894046/IMG-20260423-WA0013_pvaura.jpg",
    "https://res.cloudinary.com/dg4vourvl/image/upload/v1776894049/IMG-20260423-WA0014_kqoquc.jpg"
  ];

  function pickCharImgs() {
    const pool = [...CHAR_IMGS];
    const count = Math.random() < 0.5 ? 1 : 2;
    const picked = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    return picked;
  }

  function buildCharImgHTML(imgs) {
    if (!imgs.length) return '';
    const positions = ['pos-tr', 'pos-br', 'pos-bl'];
    // always place first at top-right, second (if any) at bottom-left
    const placements = [positions[0], positions[2]];
    return imgs.map((src, i) => {
      const posClass = placements[i] || positions[1];
      const smallClass = i === 1 ? ' small' : '';
      return `<img class="receipt-char-img ${escapeHTML(posClass)}${smallClass}" src="${escapeHTML(src)}" alt="" aria-hidden="true" crossorigin="anonymous">`;
    }).join('');
  }

  function buildReceiptCore(mode='latest') {
    const safeMode = mode === 'weekly' ? 'weekly' : 'latest';
    const data = safeGetReceiptData(safeMode);
    let charImgHTML = '';
    if (isReceiptDebugMode()) console.info('[EchoVault Receipt]', data);
    if (!data) {
      return `<div class="receipt-error-card">
        <h3>Receipt unavailable</h3>
        <p>Your echoes are safe. Try refreshing the app cache or creating one new echo.</p>
      </div>`;
    }
    try {
      const charImgs = pickCharImgs();
      charImgHTML = buildCharImgHTML(charImgs);
    } catch (error) {
      console.warn('Receipt decoration failed', error);
      charImgHTML = '';
    }

    return `<div class="receipt ${escapeHTML(receiptTheme)}" id="receipt-el" style="position:relative">
      <div class="receipt-paper">
        <div class="receipt-header">
          <div class="receipt-store">ECHOVAULT™</div>
          <div class="receipt-tagline">Emotional Surplus Store · Est. Today</div>
        </div>
        <hr class="receipt-divider">
        <div class="receipt-line"><span>Receipt type</span><span>${escapeHTML(safeMode === 'weekly' ? 'Weekly Summary' : 'Latest Echo')}</span></div>
        <div class="receipt-line"><span>Vault Holder</span><span>${escapeHTML(data.vaultHolder)}</span></div>
        <div class="receipt-line"><span>Echo ID</span><span>${escapeHTML(data.echoId)}</span></div>
        <div class="receipt-line"><span>Receipt ID</span><span>${escapeHTML(data.receiptId)}</span></div>
        <div class="receipt-line"><span>Receipt Class</span><span>${escapeHTML(data.receiptClass)}</span></div>
        <div class="receipt-line"><span>Coordinates</span><span>${escapeHTML(data.coordinates)}</span></div>
        <div class="receipt-line"><span>Mood</span><span>${escapeHTML(String(data.mood).toUpperCase())}</span></div>
        <div class="receipt-line"><span>Intensity</span><span>${escapeHTML(data.intensity)}/10</span></div>
        <div class="receipt-line"><span>Silence</span><span>${escapeHTML(data.silence)}/10</span></div>
        <div class="receipt-line"><span>Emotional Weather</span><span>${escapeHTML(data.weather)}</span></div>
        <div class="receipt-line"><span>Archetype</span><span>${escapeHTML(data.archetype)}</span></div>
        <div class="receipt-line"><span>Void status</span><span>${escapeHTML(data.voidStatus)}</span></div>
        <div class="receipt-line"><span>Sync state</span><span>${escapeHTML(data.syncLabel)}</span></div>
        ${data.materialsDiscovered ? `<div class="receipt-line"><span>Materials Discovered</span><span>${escapeHTML(data.materialsDiscovered)}</span></div>` : ''}
        ${data.craftedRelic ? `<div class="receipt-line"><span>Crafted Relic</span><span>${escapeHTML(data.craftedRelic)}</span></div>` : ''}
        ${data.avatarRole ? `<div class="receipt-line"><span>Avatar Role</span><span>${escapeHTML(data.avatarRole)}</span></div>` : ''}
        ${data.roomUnlocked ? `<div class="receipt-line"><span>Room Unlocked</span><span>${escapeHTML(data.roomUnlocked)}</span></div>` : ''}
        <div class="receipt-line"><span>Date</span><span>${escapeHTML(data.date)}</span></div>
        <hr class="receipt-divider">
        <div class="receipt-line bold"><span>INSIGHT</span><span>#${escapeHTML(data.receiptNumber)}</span></div>
        <div style="font-size:10px;opacity:.8">${escapeHTML(data.insight)}</div>
        <div class="receipt-phase-note">Receipt Class can later become a collectible frame style.</div>
        <div class="receipt-barcode">${escapeHTML(data.barcode)}</div>
        <div class="receipt-footer">EchoVault · ${escapeHTML(data.timestamp)}<br>${escapeHTML(data.receiptNumber)}</div>
      </div>
      ${charImgHTML}
    </div>`;
  }

  function buildReceipt() {
    const themes = [
      {id:'classic',label:'Classic'},
      {id:'dreamy',label:'Dreamy'},
      {id:'dark-minimal',label:'Dark'},
      {id:'romantic',label:'Romantic'}
    ];
    const themeBar = `<div class="receipt-themes">
      ${themes.map(t=>`<button class="theme-btn ${t.id===receiptTheme?'active':''}" data-theme="${t.id}">${t.label}</button>`).join('')}
    </div>`;
    return `${themeBar}<div style="display:flex;gap:8px;margin-bottom:10px"><button class="theme-btn receipt-mode-btn active" data-mode="latest">Latest Echo</button><button class="theme-btn receipt-mode-btn" data-mode="weekly">Weekly Summary</button></div>
    <div class="receipt-main-area">${buildReceiptCore('latest')}</div>
    <div class="receipt-actions">
      <button class="receipt-action-btn" id="receipt-download-btn">⬇ Save Image</button>
      <button class="receipt-action-btn" id="receipt-copy-btn">⧉ Copy Summary</button>
      <button class="receipt-action-btn" id="receipt-close-btn">Close</button>
    </div>`;
  }

  function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
      if (window.html2canvas) { resolve(window.html2canvas); return; }
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload  = () => resolve(window.html2canvas);
      s.onerror = () => reject(new Error('Failed to load html2canvas'));
      document.head.appendChild(s);
    });
  }

  async function captureReceiptImage() {
    const el = document.getElementById('receipt-el');
    if (!el) throw new Error('No receipt element');
    const h2c = await loadHtml2Canvas();
    const canvas = await h2c(el, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      logging: false,
      removeContainer: true
    });
    return canvas;
  }

  async function downloadReceipt() {
    try {
      Toast.show('Preparing image…');
      const canvas = await captureReceiptImage();
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mood-receipt.png';
      a.click();
      Toast.show('Receipt saved ✓');
    } catch(e) {
      Toast.show('Download failed — try again');
    }
  }

  async function copyReceiptSummary() {
    try {
      const mode = document.querySelector('.receipt-mode-btn.active')?.dataset.mode || 'latest';
      const d = safeGetReceiptData(mode);
      if (!d) { Toast.show('Copy failed.'); return; }
      const txt = `EchoVault ${mode} receipt
Vault Holder: ${d.vaultHolder}
Receipt ID: ${d.receiptId}
Echo ID: ${d.echoId}
Receipt Class: ${d.receiptClass}
Coordinates: ${d.coordinates}
Mood: ${d.mood}
Intensity: ${d.intensity}/10
Silence: ${d.silence}/10
Emotional Weather: ${d.weather}
Archetype: ${d.archetype}
Void status: ${d.voidStatus}
Date: ${d.date}
Sync state: ${d.syncLabel}
Insight: ${d.insight}`;
      await navigator.clipboard.writeText(txt);
      Toast.show('Summary copied ✓');
    } catch(e) {
      console.warn('Receipt copy failed', e);
      Toast.show('Copy failed.');
    }
  }

  function fallbackDownload(canvas) {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = 'mood-receipt.png'; a.click();
    Toast.show('Saved as image ✓');
  }

  function buildDNA() {
    const mc = {}; state.echoes.forEach(e=>{ mc[e.mood]=(mc[e.mood]||0)+1; });
    const total  = state.echoes.length || 1;
    const sorted = Object.entries(mc).sort((a,b)=>b[1]-a[1]);
    const arch   = getArchetype(mc);
    const desc   = getArchetypeDesc(mc);
    const traits = [];
    if (mc.reflective) traits.push('introspective');
    if (mc.calm)       traits.push('grounded');
    if (mc.chaos)      traits.push('electric');
    if (mc.anxious)    traits.push('hyper-aware');
    if (mc.joyful)     traits.push('radiant');
    if (mc.empty)      traits.push('depth-seeker');
    if (!traits.length) traits.push('undefined','becoming','open');
    const domEmoji = MOOD_EMOJIS[sorted[0]?.[0]] || '✨';
    return `<div class="dna-card">
      <div class="dna-title">Emotion DNA — v${state.echoes.length}</div>
      <div class="dna-emoji-row">${domEmoji}${domEmoji}${domEmoji}</div>
      <div class="dna-archetype">${arch}</div>
      <div class="dna-archetype-sub">${desc}</div>
      <div class="dna-traits">${traits.map(t=>`<span class="dna-trait">${t}</span>`).join('')}</div>
      <div class="dna-bars">${sorted.slice(0,5).map(([mood,count])=>{
        const pct=Math.round(count/total*100);
        return `<div class="dna-bar-row">
          <div class="dna-bar-name">${mood}</div>
          <div class="dna-bar-track"><div class="dna-bar-fill" style="width:${pct}%;background:${MOOD_COLORS[mood]}"></div></div>
          <div class="dna-bar-pct">${pct}%</div>
        </div>`;
      }).join('')}</div>
      <div class="dna-footer">EchoVault · Your Emotional Sequence</div>
    </div>`;
  }

  function buildCrash() {
    const recent = state.echoes[0];
    return `<div class="crash-report">
      <div class="crash-header">💥 PROCESS TERMINATED: EMOTIONAL_OVERFLOW</div>
      <div class="crash-line"><span class="crash-key">timestamp:</span> <span class="crash-val">${new Date().toISOString()}</span></div>
      <div class="crash-line"><span class="crash-key">error_code:</span> <span class="crash-val">FEELINGS_EXCEEDED_CAPACITY</span></div>
      <div class="crash-line"><span class="crash-key">echoes_logged:</span> <span class="crash-val">${state.echoes.length}</span></div>
      ${recent?`<div class="crash-line"><span class="crash-key">last_emotion:</span> <span class="crash-val">${recent.mood} (intensity ${recent.intensity})</span></div>`:''}
      <div class="crash-line"><span class="crash-key">memory_usage:</span> <span class="crash-val">97.3% (mostly you)</span></div>
      <div class="crash-line"><span class="crash-key">recovery_mode:</span> <span class="crash-val">therapy / time / rest</span></div>
      <div class="crash-stack">Stack trace:<br>&nbsp;&nbsp;at Human.feel() [feelings.js:${Math.floor(Math.random()*9999)}]<br>&nbsp;&nbsp;at Human.suppress() [coping.js:${Math.floor(Math.random()*9999)}]<br>&nbsp;&nbsp;at Human.tryAgain() [resilience.js:${Math.floor(Math.random()*999)}]<br>&nbsp;&nbsp;at Universe.continue() [existence.js:1]</div>
      <button class="crash-btn" id="crash-close">ignore &amp; continue</button>
    </div>`;
  }

  function buildSound() {
    const recent = state.echoes[0];
    const mood   = recent?.mood || 'reflective';
    const tracks = SOUNDPRINTS[mood] || SOUNDPRINTS.reflective;
    const color  = MOOD_COLORS[mood];
    const coverEmoji = MOOD_COVER_EMOJI[mood] || '🎵';

    const relieverMessages = {
      calm:'You carried your stillness here. Stay a moment longer.',
      chaos:'The noise needed somewhere to go. Let this hold it.',
      reflective:'The quiet inside deserves this kind of company.',
      anxious:"Breathe with this. You don't have to solve anything right now.",
      joyful:'Some feelings deserve to be heard out loud.',
      empty:'Even the void has a sound. This is yours.'
    };
    const relieverEmojis = {calm:'🌊',chaos:'⚡',reflective:'🌙',anxious:'🫁',joyful:'🌸',empty:'◯'};

    return `<div class="soundprint-card">
      <div class="soundprint-title">Echo Soundprint</div>
      <div class="soundprint-sub">Resonating with your ${MOOD_EMOJIS[mood]} <strong style="color:var(--text);font-style:normal">${mood}</strong> frequency</div>
      <div class="track-list">${tracks.map((t,i)=>`
        <div class="track-item">
          <div class="track-cover" style="background:linear-gradient(135deg,${color}55,${color}1a)">
            <div class="track-cover-glow" style="background:${color}"></div>
            <div class="track-cover-emoji">${coverEmoji}</div>
          </div>
          <div class="track-body">
            <div>
              <div class="track-num">0${i+1}</div>
              <div class="track-song">${t.song}</div>
              <div class="track-artist">${t.artist}</div>
            </div>
            <div class="track-reason">${t.reason}</div>
            <div class="track-links">
              <a class="track-link spotify" href="${t.spotify}" target="_blank" rel="noopener noreferrer">Spotify</a>
              <a class="track-link youtube" href="${t.youtube}" target="_blank" rel="noopener noreferrer">YouTube</a>
            </div>
          </div>
        </div>`).join('')}
      </div>
      <div class="soundprint-reliever">
        <div class="reliever-label">✦ a moment for you</div>
        <div class="reliever-text">${relieverMessages[mood] || relieverMessages.reflective}</div>
        <div class="reliever-breath" id="reliever-orb" role="button" aria-label="Breathing orb — tap and breathe">
          <div class="reliever-breath-ring"></div>
          ${relieverEmojis[mood] || '◯'}
        </div>
        <div class="reliever-breath-hint">tap · breathe · release</div>
      </div>
    </div>`;
  }

  function buildShatter() {
    return `<div class="shatter-stage">
      <div class="shatter-title">Shatter Softly</div>
      <div class="shatter-sub">A quiet ceremony of release.<br>Tap to begin cracking the surface.</div>
      <div class="shatter-canvas-wrap">
        <canvas id="shatter-canvas" width="240" height="240" aria-label="Shatter surface — tap to crack"></canvas>
      </div>
      <div class="shatter-hint" id="shatter-hint">tap gently to begin</div>
      <div class="shatter-aftermath" id="shatter-aftermath">
        <div class="shatter-release-line">"you didn't need<br>to carry that"</div>
        <div class="shatter-song-suggestion" id="shatter-song-here"></div>
        <button class="shatter-back" id="shatter-reset-btn">← begin again</button>
      </div>
    </div>`;
  }

  function buildConflict() {
    return `<div class="conflict-arena">
      <div class="conflict-canvas-wrap">
        <canvas id="conflict-canvas"></canvas>
      </div>
      <div class="conflict-instruction">drag to influence · watch them collide</div>
      <div class="conflict-labels">
        <div class="conflict-label past">${state.echoes.length > 1 ? state.echoes[state.echoes.length-1].mood : 'past'}</div>
        <div class="conflict-label present">${state.echoes[0]?.mood || 'present'}</div>
      </div>
    </div>`;
  }


  function buildLantern(){
    return `<div class="ritual-scene lantern-scene"><h3>Void Lantern</h3><p>Tap to give the quiet a small light.</p><canvas id="lantern-canvas" width="520" height="300"></canvas><div id="lantern-msg" class="ritual-msg">Stillness can hold a signal.</div><div class="ritual-actions" id="lantern-actions" hidden><button class="receipt-action-btn" id="save-lantern">Save Lantern Artifact</button><button class="receipt-action-btn" id="dl-lantern">Download Lantern Card</button></div></div>`;
  }
  function buildStormJar(){
    return `<div class="ritual-scene storm-scene"><h3>Storm Jar</h3><p>Put the weather somewhere it can’t swallow you.</p><canvas id="storm-canvas" width="520" height="300"></canvas><div id="storm-msg" class="ritual-msg">Tap the jar to give the storm a shape.</div><div class="ritual-actions" id="storm-actions" hidden><button class="receipt-action-btn" id="save-storm">Save Storm Artifact</button><button class="receipt-action-btn" id="dl-storm">Download Storm Card</button></div></div>`;
  }
  function buildMuseum(){
    VaultRooms.evaluate?.();
    const echoes=state.echoes;
    const saved=ArtifactArchive.listArtifacts();
    const materials = VaultInventory.getTotals();
    const totalMaterials = Object.values(materials).reduce((sum, qty)=>sum + Number(qty || 0), 0);
    const meta = MaterialEngine.materialMeta || {};
    const materialRows = Object.entries(materials).map(([name,count])=>{ const m=meta[name] || { icon:'✦', description:'A private emotional material.', mood:'reflective' }; return `<div class="material-pill mood-${escapeHTML(m.mood)}"><span><b>${escapeHTML(m.icon)}</b> ${escapeHTML(name)}<small>${escapeHTML(m.description)}</small></span><strong>${escapeHTML(count)}</strong></div>`; }).join('') || '<div class="museum-empty">No materials discovered yet. Create an echo to uncover the first fragment.</div>';
    const craftCards = RelicCrafting.listRecipes().map(recipe => {
      const missing = RelicCrafting.getMissingMaterials(recipe.id);
      const can = missing.length === 0;
      const costs = recipe.cost.map(c => { const have=VaultInventory.getMaterialCount(c.name); return `<span class="cost-chip ${have>=c.qty?'has':'missing'}">${escapeHTML(c.name)} <b>${escapeHTML(have)}/${escapeHTML(c.qty)}</b></span>`; }).join('');
      const missText = missing.map(m=>`${m.qty} ${m.name}`).join(', ');
      return `<article class="craft-recipe-card ${can?'can-craft':'is-missing'}"><div class="craft-recipe-top"><span class="craft-rune">✦</span><div><h5>${escapeHTML(recipe.title)}</h5><p>${escapeHTML(recipe.description)}</p></div></div><div class="craft-costs">${costs}</div>${can ? '<small class="craft-ready">Materials aligned.</small>' : `<small class="craft-missing">missing: ${escapeHTML(missText)}</small>`}<button class="receipt-action-btn craft-btn" data-recipe-id="${escapeHTML(recipe.id)}" ${can?'':'disabled'}>Craft</button></article>`;
    }).join('');
    const materialsPrep = '<div class="phase-two-note">Materials remain local-first in <code>echovault_inventory_v1</code>; crafting only spends local inventory when every cost is available.</div>';
    const quest = GentleQuests.current();
    const avatarHtml = EchoAvatar.render();
    const societyTeaser = buildEchoSocietyGate();
    const weather=WeatherMap.compute(echoes);
    const arch=ArchetypeEngine.compute(PatternEngine.analyze(echoes));
    const tracks=SOUNDPRINTS[weather.mood]||SOUNDPRINTS.reflective;
    const relics=RelicEngine.fromEchoes(echoes);
    const relicVisual = (name) => {
      const key = name.toLowerCase();
      if (key.includes('signal')) return 'relic-star';
      if (key.includes('quiet')) return 'relic-stone';
      if (key.includes('storm')) return 'relic-prism';
      if (key.includes('comet')) return 'relic-comet';
      return 'relic-token';
    };
    const panelLock = (roomId, html) => VaultRooms.isUnlocked(roomId) ? html : `<div class="museum-locked"><h4>${escapeHTML(VaultRooms.getRooms().find(r=>r.id===roomId)?.name || 'Locked Room')}</h4><p>${escapeHTML(VaultRooms.getUnlockReason(roomId))}</p></div>`;
    const roomMap = [
      ['weather_room','weather','Weather Room'],
      ['archetype_hall','archetype','Archetype Hall'],
      ['soundprint_wall','soundprint','Soundprint Wall'],
      ['relic_hall','relics','Memory Relics'],
      ['archive_shelf','receipts','Receipt Archive'],
      ['lantern_garden','lanterns','Void Lanterns'],
      ['crafting_table','crafting','Crafting Table'],
      ['materials_room','materials','Vault Materials'],
      ['society_gate','society','Society Gate']
    ];
    const tabButton = ([roomId, panel, label]) => {
      const unlockId = roomId === 'archetype_hall' ? 'weather_room' : roomId === 'materials_room' ? 'crafting_table' : roomId;
      const unlocked = VaultRooms.isUnlocked(unlockId);
      return `<button class="museum-tab ${panel==='weather'?'active':''} ${unlocked?'is-unlocked':'is-locked'}" data-room="${panel}" title="${escapeHTML(unlocked?'Awakened':VaultRooms.getUnlockReason(unlockId))}">${escapeHTML(label)}</button>`;
    };
    const shellStart = `<div class="museum-shell" data-room="weather"><header class="museum-head"><h3>Emotional Museum</h3><p class="museum-sub">A private archive of what your echoes became.</p><div class="museum-meta"><span>${echoes.length} echoes</span><span>${saved.length} artifacts</span><span>${totalMaterials} materials</span><span>${weather.name}</span><span>${arch.archetypeName}</span></div></header><div class="gentle-quest-card"><span>Today’s Gentle Quest</span><b>${quest.text}</b><small>${quest.completed ? 'complete' : `Reward: +${quest.reward.qty} ${quest.reward.name}${quest.xp ? ` · +${quest.xp} XP` : ''}`}</small></div>${avatarHtml}<nav class="museum-tabs" aria-label="Museum rooms">${roomMap.map(tabButton).join('')}</nav>`;
    if(!echoes.length) return `${shellStart}<section class="vault-materials"><h4>Vault Materials</h4>${materialRows}</section>${materialsPrep}${societyTeaser}<div class="museum-empty">The museum is quiet. Create echoes to awaken its rooms.</div></div>`;
    return `${shellStart}<div class="museum-room active" data-room-panel="weather">${panelLock('weather_room', `<h4>Weather Room</h4><p>${weather.summary}</p><canvas id="weather-map-canvas" style="width:100%;height:240px"></canvas><div class="ritual-actions"><button class="receipt-action-btn" id="dl-weather">Download Weather Card</button><button class="receipt-action-btn" id="save-weather">Save Weather Artifact</button></div>`)}</div><div class="museum-room" data-room-panel="archetype"><h4>Archetype Hall</h4><p>${arch.archetypeName} · ${arch.archetypeDescription}</p><button class="receipt-action-btn" id="dl-arch">Download Archetype Card</button></div><div class="museum-room" data-room-panel="soundprint">${panelLock('soundprint_wall', `<h4>Soundprint Wall</h4>${tracks.slice(0,3).map(t=>`<div class='track-item'><div><b>${t.song}</b><small>${t.artist}</small></div><a class='track-link spotify' href='${t.spotify}' target='_blank' rel='noopener noreferrer'>Spotify</a><a class='track-link youtube' href='${t.youtube}' target='_blank' rel='noopener noreferrer'>YouTube</a></div>`).join('')}<button class="receipt-action-btn" id="dl-sound">Download Soundprint Card</button>`)}</div><div class="museum-room" data-room-panel="relics">${panelLock('relic_hall', `<h4>Memory Relics</h4><div class="relic-grid">${relics.map((r,i)=>`<article class='relic-item mood-${escapeHTML(r.mood)}' style='--delay:${i * 120}ms'><div class='relic-visual ${relicVisual(r.title)}'></div><b>${escapeHTML(r.title)}</b><span class='rarity'>${escapeHTML(r.rarity)}</span><small>${escapeHTML(r.coordinates)}</small><p>${escapeHTML(r.description)}</p><button class='receipt-action-btn relic-dl' data-id='${escapeHTML(r.id)}'>Download Card</button><button class='receipt-action-btn relic-save' data-id='${escapeHTML(r.id)}'>Save Artifact</button></article>`).join('')}</div>`)}</div><div class="museum-room" data-room-panel="receipts">${panelLock('archive_shelf', `<h4>Receipt Archive</h4><p>Receipts you save will appear here.</p><button class='receipt-action-btn' id='save-receipt-latest'>Save Latest Receipt</button><div class="artifact-shelf" id='artifact-list'>${saved.map(a=>`<div class='artifact-row'><b>${escapeHTML(a.title)}</b><small>${escapeHTML(a.type)}</small><button class='receipt-action-btn art-fav' data-id='${escapeHTML(a.id)}'>☆</button><button class='receipt-action-btn art-del' data-id='${escapeHTML(a.id)}'>Delete</button></div>`).join('') || 'No artifacts saved yet. Create one from a ritual.'}</div>`)}</div><div class="museum-room" data-room-panel="lanterns">${panelLock('lantern_garden', `<h4>Void Lanterns</h4><p>Still here is still a signal. Crafted lanterns gather here as a private garden.</p>`)}</div><div class="museum-room" data-room-panel="crafting">${panelLock('crafting_table', `<section class="crafting-table"><div class="crafting-head"><div><h4>Crafting Table</h4><p>Shape emotional materials into relics.</p></div><span>${totalMaterials} materials</span></div><section class="vault-materials compact"><h4>Inventory Summary</h4>${materialRows}</section><div class="craft-grid">${craftCards}</div><div id="crafted-preview" class="crafted-preview" hidden></div></section>`)}</div><div class="museum-room" data-room-panel="materials"><h4>Vault Materials</h4><section class="vault-materials">${materialRows}</section>${materialsPrep}</div><div class="museum-room" data-room-panel="society">${societyTeaser}</div></div>`;
  }
  function startConflictAnimation() {
    const canvas = document.getElementById('conflict-canvas');
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width  = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    const pastMood    = state.echoes.length > 1 ? state.echoes[state.echoes.length-1].mood : 'reflective';
    const presentMood = state.echoes[0]?.mood || 'chaos';
    const pastColor   = MOOD_COLORS[pastMood];
    const presColor   = MOOD_COLORS[presentMood];

    let entities = [
      {x:w*.3, y:h/2, vx:.8, vy:0, r:40, color:pastColor, label:'past', mass:1},
      {x:w*.7, y:h/2, vx:-.8, vy:0, r:40, color:presColor, label:'present', mass:1}
    ];

    let dragging = null;

    canvas.addEventListener('pointerdown', e => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      entities.forEach(en => {
        const dx = mx-en.x, dy = my-en.y;
        if (Math.sqrt(dx*dx+dy*dy) < en.r+10) dragging = en;
      });
    });
    canvas.addEventListener('pointermove', e => {
      if (!dragging) return;
      const rect = canvas.getBoundingClientRect();
      dragging.vx = (e.clientX - rect.left - dragging.x) * 0.2;
      dragging.vy = (e.clientY - rect.top  - dragging.y) * 0.2;
    });
    canvas.addEventListener('pointerup', () => { dragging = null; });

    let phase = 0;
    function frame() {
      if (!document.getElementById('conflict-canvas')) return;
      ctx.clearRect(0,0,w,h);
      phase += 0.012;

      entities.forEach(en => {
        en.vx *= 0.98; en.vy *= 0.98;
        en.x += en.vx; en.y += en.vy;
        if (en.x - en.r < 0) { en.x = en.r; en.vx *= -.7; }
        if (en.x + en.r > w) { en.x = w-en.r; en.vx *= -.7; }
        if (en.y - en.r < 0) { en.y = en.r; en.vy *= -.7; }
        if (en.y + en.r > h) { en.y = h-en.r; en.vy *= -.7; }
      });

      const a = entities[0], b = entities[1];
      const dx = a.x-b.x, dy = a.y-b.y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      const minD = a.r+b.r;
      if (dist < minD && dist > 0) {
        const nx = dx/dist, ny = dy/dist;
        const relV = (a.vx-b.vx)*nx + (a.vy-b.vy)*ny;
        const imp  = relV * 1.0;
        a.vx -= imp*nx; a.vy -= imp*ny;
        b.vx += imp*nx; b.vy += imp*ny;
        const overlap = (minD-dist)*0.5;
        a.x += nx*overlap; a.y += ny*overlap;
        b.x -= nx*overlap; b.y -= ny*overlap;
        const cx2 = (a.x+b.x)/2, cy2 = (a.y+b.y)/2;
        const grd = ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,32);
        grd.addColorStop(0,'rgba(255,255,255,.28)');
        grd.addColorStop(1,'transparent');
        ctx.beginPath(); ctx.arc(cx2,cy2,32,0,Math.PI*2);
        ctx.fillStyle = grd; ctx.fill();
      }

      if (dist < minD*2.5) {
        const alpha = Math.max(0, 1-(dist/(minD*2.5))) * .32;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 1; ctx.stroke();
      }

      entities.forEach(en => {
        const pulse = 1 + Math.sin(phase)*0.06;
        const grd = ctx.createRadialGradient(en.x,en.y,0,en.x,en.y,en.r*pulse);
        grd.addColorStop(0,en.color+'cc');
        grd.addColorStop(.6,en.color+'44');
        grd.addColorStop(1,en.color+'00');
        ctx.beginPath(); ctx.arc(en.x, en.y, en.r*pulse, 0, Math.PI*2);
        ctx.fillStyle = grd; ctx.fill();
        ctx.beginPath(); ctx.arc(en.x,en.y,en.r*pulse,0,Math.PI*2);
        ctx.strokeStyle = en.color + '66'; ctx.lineWidth=1.5; ctx.stroke();
      });

      requestAnimationFrame(frame);
    }
    frame();
  }

  document.querySelectorAll('.fun-card').forEach(card => {
    card.addEventListener('click',   () => open(card.dataset.fun));
    card.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();open(card.dataset.fun);}});
  });
  document.getElementById('fun-modal-close').addEventListener('click', close);
  modal.addEventListener('click', e => { if(e.target===modal) close(); });
  content.addEventListener('click', e => { if(e.target.id==='crash-close') close(); });

  return {open};
})();

/* ── HELPER FUNCTIONS ── */
function getArchetype(mc) {
  const max = Object.entries(mc).sort((a,b)=>b[1]-a[1])[0]?.[0];
  return ARCHETYPE_NAMES[max] || 'The Unknown';
}
function getArchetypeDesc(mc) {
  const max = Object.entries(mc).sort((a,b)=>b[1]-a[1])[0]?.[0];
  return ARCHETYPE_DESCS[max] || 'Still becoming.';
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
}
function formatDateShort(iso) {
  return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric'});
}

/* ── WIRE EVENTS ── */
document.getElementById('nav-logo-btn').addEventListener('click', e => { e.preventDefault(); Nav.show('home'); });
document.getElementById('home-create-btn').addEventListener('click', () => Nav.show('entry'));
document.getElementById('home-enter-btn').addEventListener('click',  () => Nav.show('timeline'));
document.getElementById('timeline-create-btn').addEventListener('click', () => Nav.show('entry'));
document.getElementById('view-uni-btn').addEventListener('click', () => Nav.show('timeline'));
document.getElementById('detail-close-btn').addEventListener('click', () =>
  document.getElementById('node-detail').classList.remove('open'));
document.getElementById('node-detail').addEventListener('click', e => {
  if (e.target.id==='node-detail') document.getElementById('node-detail').classList.remove('open');
});
document.getElementById('period-week').addEventListener('click',  function(){ setPeriod('week',this);  });
document.getElementById('period-month').addEventListener('click', function(){ setPeriod('month',this); });
document.getElementById('period-all').addEventListener('click',   function(){ setPeriod('all',this);   });
function setPeriod(p, btn) {
  state.wrappedPeriod = p;
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  Wrapped.render();
}
document.getElementById('export-btn').addEventListener('click', () => Storage.exportVault(state.echoes));
document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-file').click());

const UserChip = (() => {
  const chip = document.getElementById('user-chip');
  const menu = chip?.querySelector('.chip-menu');
  const settingsBtn = document.getElementById('chip-settings-btn');
  function refresh() {
    const profile = ProfileStore.read();
    const name = profile.display_name || Auth.user?.user_metadata?.display_name || localStorage.getItem(USER_KEY) || 'you';
    const email = Auth.user?.email || 'local mode';
    if (!Auth.user && !localStorage.getItem(USER_KEY) && !profile.display_name) { chip?.classList.remove('visible'); return; }
    chip?.classList.add('visible');
    document.getElementById('chip-name').textContent = name;
    document.getElementById('chip-display-name').textContent = name;
    document.getElementById('chip-email').textContent = email;
    const avatarEl = document.getElementById('chip-avatar');
    const avatarUrl = profile.avatar_url || profile.avatar_data_url;
    if (avatarUrl && avatarEl) {
      avatarEl.textContent = '';
      const img = document.createElement('img');
      img.src = avatarUrl;
      img.alt = '';
      avatarEl.appendChild(img);
    } else if (avatarEl) {
      const initials = name.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase();
      avatarEl.textContent = initials || 'EV';
    }
  }

  function toggleMenu(forceOpen) {
    if (!menu) return;
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !menu.classList.contains('open');
    menu.classList.toggle('open', shouldOpen);
  }

  chip?.addEventListener('click', (e) => {
    if (e.target.closest('.chip-item')) return;
    toggleMenu();
  });
  chip?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });

  document.addEventListener('click', (e) => {
    if (!chip?.contains(e.target)) toggleMenu(false);
  });

  settingsBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu(false);
    Settings.open();
  });

  document.getElementById('chip-export-btn')?.addEventListener('click', () => Storage.exportVault(state.echoes));
  document.getElementById('chip-signout-btn')?.addEventListener('click', () => {
    Auth.signOut().then(() => window.location.reload());
  });
  return { refresh };
})();

const VaultPulse = (() => {
  const chip = document.getElementById('user-chip');
  const label = document.getElementById('chip-sync-label');
  const msg = document.getElementById('sync-msg');
  const toast = document.getElementById('sync-toast');
  function set(stateKey, text){
    if(!chip||!label) return;
    chip.classList.remove('syncing','synced','failed','local');
    chip.classList.add(stateKey);
    label.textContent=text;
    if(msg) msg.textContent=text;
  }
  function toastPulse(){ toast?.classList.add('show'); setTimeout(()=>toast?.classList.remove('show'),1800); }
  return {set,toastPulse};
})();


function refreshEchoDependentUI() {
  Weather.update();
  IdentityOrb.update();
  IdentityCore.update();
  GhostLayer.initFromEchoes(state.echoes);

  if (state.currentView === 'timeline') {
    Timeline.render();
    setTimeout(ConnectionCanvas.render, 60);
  }

  if (state.currentView === 'wrapped') {
    Wrapped.render();
  }
  const weather = WeatherMap.compute(state.echoes);
  const e=document.getElementById('museum-echo-count'); if(e) e.textContent=`${state.echoes.length} echoes`;
  const a=document.getElementById('museum-artifact-count'); if(a) a.textContent=`${ArtifactArchive.listArtifacts().length} artifacts`;
  const w=document.getElementById('museum-weather'); if(w) w.textContent=weather.name.toLowerCase();
}

const EchoSync = (() => {
  function isAvailable() {
    return Boolean(Auth.user && Auth.client);
  }

  async function syncLocalToCloud() {
    if (!isAvailable()) {
      VaultPulse.set('local', 'Local Vault');
      return { ok: false, reason: 'not_authenticated' };
    }

    VaultPulse.set('synced', 'Profile Synced');
    return { ok: true };
  }

  return { isAvailable, syncLocalToCloud };
})();

const MigrationFlow = (() => {
  const modal = document.getElementById('migration-modal');

  function close() {
    modal?.classList.remove('open');
  }

  function init() {
    document.getElementById('migration-sync-btn')?.addEventListener('click', async () => {
      VaultPulse.set('syncing', 'Syncing Echoes…');
      VaultPulse.toastPulse();

      try {
        if (window.EchoSync?.syncLocalToCloud) {
          const result = await window.EchoSync.syncLocalToCloud();
          if (result?.ok) {
            VaultPulse.set('synced', 'Profile Synced');
          } else if (result?.reason === 'not_authenticated') {
            VaultPulse.set('local', 'Local Vault');
            Toast.show('Sign in to sync. Your local vault is still safe.');
          } else {
            VaultPulse.set('local', 'Local Vault');
          }
        } else {
          VaultPulse.set('local', 'Local Vault');
          Toast.show('Sign in to sync. Your local vault is still safe.');
        }
      } catch {
        VaultPulse.set('failed', 'Sync Failed — Still Safe');
      }

      close();
    });

    document.getElementById('migration-keep-btn')?.addEventListener('click', () => {
      VaultPulse.set('local', 'Offline — Held Locally');
      close();
    });

    document.getElementById('migration-export-btn')?.addEventListener('click', () => {
      Storage.exportVault(state.echoes);
      VaultPulse.set('local', 'Local Vault');
      close();
    });
  }

  return { init, close };
})();

window.EchoSync = EchoSync;

const ImportFlow = (() => {
  let imported = null;
  const modal = document.getElementById('import-preview-modal');
  const content = document.getElementById('import-preview-content');
  function preview(arr){
    imported = arr;
    const dates = arr.map(e=>new Date(e.date)).filter(d=>!isNaN(d));
    const min = dates.length ? new Date(Math.min(...dates)).toLocaleDateString() : '—';
    const max = dates.length ? new Date(Math.max(...dates)).toLocaleDateString() : '—';
    const profileIncluded = arr.some(e=>e.profile_snapshot) ? 'yes' : 'no';
    content.innerHTML = `<div>Echoes: ${arr.length}</div><div>Date Range: ${min} → ${max}</div><div>Profile Included: ${profileIncluded}</div><div>Import Type: vault json</div>`;
    modal?.classList.add('open');
  }
  function close(){ modal?.classList.remove('open'); imported=null; }
  document.getElementById('import-merge-btn')?.addEventListener('click', () => {
    if (!imported) return;
    state.echoes = [...state.echoes, ...imported];
    Storage.save(state.echoes);
    refreshEchoDependentUI();
    close();
    Toast.show('Merged with your vault.');
  });
  document.getElementById('import-replace-btn')?.addEventListener('click', () => {
    if (!imported) return;
    if (!window.confirm('Replace your local vault with imported echoes? This cannot be undone.')) return;
    state.echoes = imported;
    Storage.save(state.echoes);
    refreshEchoDependentUI();
    close();
    Toast.show('Local vault replaced.');
  });
  document.getElementById('import-cancel-btn')?.addEventListener('click', close);
  return {preview};
})();

document.getElementById('import-file').addEventListener('change', function() {
  if (this.files[0]) {
    Storage.importVault(this.files[0], (arr) => { ImportFlow.preview(arr); });
  }
  this.value = '';
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('node-detail').classList.remove('open');
    document.getElementById('fun-modal').classList.remove('open');
    document.getElementById('onboarding').classList.remove('open');
  }
});

document.addEventListener('visibilitychange', () => { state.tabHidden = document.hidden; });

window.addEventListener('resize', () => {
  Cosmos.resize(); Ripple.resize(); ConnectionCanvas.resize(); Whip.resize();
  if (state.currentView === 'timeline') Timeline.render();
}, {passive:true});


/* ── EXTERNAL BRIDGE ── */
window.EchoVaultBridge = {
  getState: () => state,
  MOOD_COLORS,
  ARCHETYPE_NAMES,
  ARCHETYPE_DESCS,
  SOUNDPRINTS
};

/* ── INIT ── */
async function init() {
  state.echoes = Storage.load();
  Cosmos.init();
  Cosmos.draw();
  Breathing.start();
  Weather.update();
  GhostLayer.initFromEchoes(state.echoes);
  IdentityCore.update();
  try {
    await Auth.init();
  } catch (error) {
    console.warn('Auth initialization failed; continuing in local mode.', error);
  }
  UserChip.refresh();
  VaultPulse.set(Auth.user ? "synced" : "local", Auth.user ? "Profile Synced" : "Local Vault");
  MigrationFlow.init();
  PWAInstall.init();
  Login.init();
  await ServiceWorkerManager.register();
  DebugPanel.ensure();
}



const DebugPanel = (() => {
  function ensure() {
    if (!location.search.includes('debug=1')) return;
    let panel = document.getElementById('debug-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'debug-panel';
      panel.className = 'debug-panel';
      document.body.appendChild(panel);
    }
    const profile = ProfileStore.read();
    panel.innerHTML = `APP_VERSION:${APP_VERSION}<br>SW cache:${SW_CACHE_VERSION}<br>mode:${Auth.isLocalMode() ? 'local' : 'supabase'}<br>display:${AppEnvironment.isStandalone() ? 'standalone':'browser'}<br>echoes:${state.echoes.length}<br>artifacts:${ArtifactArchive.listArtifacts().length}<br>profile:${escapeHTML(profile.display_name || 'anon')}<br>sw:${navigator.serviceWorker?.controller ? 'active' : 'none'}`;
    console.info('[EchoVault Debug]', { appVersion: APP_VERSION, swCacheVersion: SW_CACHE_VERSION, storageMode: Auth.isLocalMode() ? 'local' : 'supabase', standalone: AppEnvironment.isStandalone(), echoCount: state.echoes.length, artifactCount: ArtifactArchive.listArtifacts().length });
  }
  return { ensure };
})();

const ServiceWorkerManager = (() => {
  const UPDATE_GUARD_KEY = 'ev_sw_update_reload_guard';
  const LAST_VERSION_KEY = 'ev_sw_last_version';
  async function register() {
    if (!('serviceWorker' in navigator)) return;
    if (sessionStorage.getItem(LAST_VERSION_KEY) === APP_VERSION) sessionStorage.removeItem(UPDATE_GUARD_KEY);
    sessionStorage.setItem(LAST_VERSION_KEY, APP_VERSION);
    const reg = await navigator.serviceWorker.register('sw.js');
    const refreshOnce = () => {
      if (sessionStorage.getItem(UPDATE_GUARD_KEY) === APP_VERSION) return;
      sessionStorage.setItem(UPDATE_GUARD_KEY, APP_VERSION);
      Toast.show('New EchoVault version ready — refreshing…', 3200);
      setTimeout(() => location.reload(), 850);
    };
    const onNewWorker = (worker) => {
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if ((worker.state === 'installed' || worker.state === 'activated') && navigator.serviceWorker.controller) refreshOnce();
      });
    };
    onNewWorker(reg.installing || reg.waiting);
    reg.addEventListener('updatefound', () => onNewWorker(reg.installing));
    navigator.serviceWorker.addEventListener('controllerchange', refreshOnce);
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SW_ACTIVATED') {
        if (event.data?.appVersion === APP_VERSION) sessionStorage.removeItem(UPDATE_GUARD_KEY);
        DebugPanel.ensure();
      }
    });
    reg.update?.();
  }
  return { register };
})();
init();

})();


  const PRODUCTION_REDIRECT_URL = 'https://nmethylpyrrolinium.github.io/echovault.com/';
  function getAuthRedirectUrl() {
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocalhost) return PRODUCTION_REDIRECT_URL;
    return new URL('./', window.location.href).toString();
  }

// serviceWorker.register marker retained for smoke tests
