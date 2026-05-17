(function EchoVaultPhase2(global) {
  'use strict';

  const FAMILY_COLORS = {
    calm: '#9DB7FF', chaos: '#FF6A4A', reflective: '#C8B6FF', anxious: '#73E6D4', joyful: '#FFD37A', empty: '#8796C8'
  };

  const SEASONS = {
    quietWinter: {
      id: 'quiet-winter', title: 'Quiet Winter', traits: ['low intensity', 'high silence', 'slow return'],
      interpretation: 'A hushed season where feelings seem to move under ice instead of asking to be named.',
      influence: 'frosted edges, slower drift, silver-blue atmosphere', color: '#9DB7FF'
    },
    staticBloom: {
      id: 'static-bloom', title: 'Static Bloom', traits: ['anxious charge', 'soft repetition', 'small openings'],
      interpretation: 'The nervous system flickers, but small blooms keep appearing through the static.',
      influence: 'teal shimmer with careful gold accents', color: '#73E6D4'
    },
    solarDrift: {
      id: 'solar-drift', title: 'Solar Drift', traits: ['joy or hope', 'medium intensity', 'upward motion'],
      interpretation: 'Warmth keeps returning. Not as noise — as a steady light you can follow.',
      influence: 'sunrise-gold glow and tiny upward sparks', color: '#FFD37A'
    },
    neonCollapse: {
      id: 'neon-collapse', title: 'Neon Collapse', traits: ['high intensity', 'chaotic mood', 'compressed pressure'],
      interpretation: 'A bright, overloaded passage where emotion asks for containment before explanation.',
      influence: 'ember pulse, tighter constellation lines', color: '#FF6A4A'
    },
    monsoonPhase: {
      id: 'monsoon-phase', title: 'Monsoon Phase', traits: ['repetition', 'rising intensity', 'dense weather'],
      interpretation: 'The same weather keeps arriving, not to trap you — maybe to be witnessed differently.',
      influence: 'deep blue rainfall gradients and heavier quiet', color: '#5472D3'
    },
    voidSeason: {
      id: 'void-season', title: 'Void Season', traits: ['empty or numb echoes', 'high silence', 'low wording'],
      interpretation: 'A sparse season where absence becomes the shape. The quiet still counts as signal.',
      influence: 'dim halo, faded edges, starless negative space', color: '#8796C8'
    }
  };

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function familyFor(mood, moodFamily) { return typeof moodFamily === 'function' ? moodFamily(mood) : String(mood || 'reflective').toLowerCase(); }
  function daysBetween(a, b) { return Math.abs(new Date(a || Date.now()) - new Date(b || Date.now())) / 86400000; }

  function analyzeSeason(echoes = [], moodFamily) {
    const list = (Array.isArray(echoes) ? echoes : []).filter(Boolean);
    if (!list.length) return { ...SEASONS.quietWinter, confidence: 0, summary: 'The universe is quiet — ready, not empty.' };
    const recent = list.slice(0, Math.min(12, list.length));
    const counts = {};
    let intensity = 0, silence = 0, voids = 0, repeated = 0;
    recent.forEach((echo, index) => {
      const family = familyFor(echo.mood, moodFamily);
      counts[family] = (counts[family] || 0) + 1;
      intensity += Number(echo.intensity || 0);
      silence += Number(echo.silence || 0);
      if (echo.void || !echo.thought) voids += 1;
      if (index && familyFor(recent[index - 1].mood, moodFamily) === family) repeated += 1;
    });
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'reflective';
    const avgIntensity = intensity / recent.length;
    const avgSilence = silence / recent.length;
    const repetition = repeated / Math.max(1, recent.length - 1);
    const voidRatio = voids / recent.length;
    let season = SEASONS.monsoonPhase;
    if ((dominant === 'empty' && avgSilence >= 5) || voidRatio >= 0.58) season = SEASONS.voidSeason;
    else if (avgSilence >= 6.6 && avgIntensity <= 4.8) season = SEASONS.quietWinter;
    else if (avgIntensity >= 7.2 && (dominant === 'chaos' || counts.chaos >= 2)) season = SEASONS.neonCollapse;
    else if (dominant === 'joyful' || (counts.joyful || 0) >= Math.max(2, recent.length * 0.34)) season = SEASONS.solarDrift;
    else if (dominant === 'anxious' || (counts.anxious || 0) >= Math.max(2, recent.length * 0.34)) season = SEASONS.staticBloom;
    else if (repetition >= 0.55 || avgIntensity >= 6.2) season = SEASONS.monsoonPhase;
    else if (dominant === 'calm') season = SEASONS.quietWinter;
    const confidence = clamp(Math.round((Math.min(1, recent.length / 5) * 55) + (Math.max(...Object.values(counts)) / recent.length) * 35 + repetition * 10), 18, 96);
    return {
      ...season,
      dominantMood: dominant,
      averageIntensity: Number(avgIntensity.toFixed(1)),
      averageSilence: Number(avgSilence.toFixed(1)),
      repetition: Number(repetition.toFixed(2)),
      confidence,
      summary: `${season.title} · ${dominant} weather, intensity ${avgIntensity.toFixed(1)}, silence ${avgSilence.toFixed(1)}`
    };
  }

  function scoreRelation(a, b, moodFamily) {
    const famA = familyFor(a.mood, moodFamily);
    const famB = familyFor(b.mood, moodFamily);
    let score = famA === famB ? 46 : 0;
    const intensityDelta = Math.abs(Number(a.intensity || 0) - Number(b.intensity || 0));
    const silenceDelta = Math.abs(Number(a.silence || 0) - Number(b.silence || 0));
    score += Math.max(0, 22 - intensityDelta * 4);
    score += Math.max(0, 18 - silenceDelta * 3);
    score += Math.max(0, 18 - daysBetween(a.date, b.date) * 2.6);
    if (a.void && b.void) score += 8;
    return clamp(score, 0, 100);
  }

  function buildConstellationLinks(points = [], options = {}) {
    const maxLinks = options.maxLinks || (global.innerWidth < 768 ? 18 : 38);
    const maxDistance = options.maxDistance || (global.innerWidth < 768 ? 170 : 240);
    const moodFamily = options.moodFamily;
    const candidates = [];
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i], b = points[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > maxDistance) continue;
        const score = scoreRelation(a.echo || a, b.echo || b, moodFamily);
        if (score < 42) continue;
        candidates.push({ a, b, distance, score, strength: (1 - distance / maxDistance) * (score / 100) });
      }
    }
    return candidates.sort((a, b) => b.strength - a.strength).slice(0, maxLinks);
  }

  function describeRelations(echo, echoes = [], moodFamily) {
    if (!echo) return [];
    return (echoes || [])
      .filter((candidate) => candidate && candidate.id !== echo.id)
      .map((candidate) => ({ echo: candidate, score: scoreRelation(echo, candidate, moodFamily) }))
      .filter((item) => item.score >= 48)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }

  global.Phase2EmotionalIntelligence = { analyzeSeason, buildConstellationLinks, describeRelations, scoreRelation, FAMILY_COLORS };
})(window);
