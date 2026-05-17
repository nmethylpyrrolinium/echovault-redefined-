#!/usr/bin/env node
/**
 * EchoVault Memory Intelligence helpers.
 * Deterministic, dependency-free JS for emotional summaries, clusters,
 * trend detection, silence weighting, archetype assignment, and Wrapped insights.
 */

const EMOTION_LEXICON = {
  joy: ['happy', 'glad', 'joy', 'joyful', 'delight', 'laugh', 'grateful', 'bright', 'lighter', 'celebrate'],
  calm: ['calm', 'peace', 'peaceful', 'steady', 'soft', 'quiet', 'rested', 'safe', 'grounded', 'ease'],
  hope: ['hope', 'hopeful', 'possible', 'try', 'trying', 'begin', 'again', 'future', 'better', 'open'],
  love: ['love', 'loved', 'care', 'cared', 'tender', 'close', 'together', 'friend', 'home', 'warm'],
  sadness: ['sad', 'heavy', 'lonely', 'miss', 'missing', 'grief', 'cry', 'tired', 'ache', 'empty'],
  anxiety: ['anxious', 'worry', 'worried', 'panic', 'nervous', 'afraid', 'fear', 'spiral', 'uncertain', 'stress'],
  anger: ['angry', 'mad', 'rage', 'resent', 'unfair', 'frustrated', 'annoyed', 'irritated', 'bitter', 'sharp'],
  shame: ['shame', 'ashamed', 'guilty', 'embarrassed', 'failure', 'worthless', 'small', 'hide', 'regret'],
  numb: ['numb', 'blank', 'nothing', 'distant', 'detached', 'fog', 'foggy', 'flat', 'muted', 'offline'],
  growth: ['learn', 'learned', 'grow', 'growth', 'healing', 'change', 'boundary', 'brave', 'proud', 'progress']
};

const VALENCE = {
  joy: 0.8,
  calm: 0.55,
  hope: 0.6,
  love: 0.7,
  growth: 0.45,
  sadness: -0.55,
  anxiety: -0.65,
  anger: -0.5,
  shame: -0.75,
  numb: -0.35
};

const AROUSAL = {
  joy: 0.55,
  calm: -0.45,
  hope: 0.25,
  love: 0.15,
  growth: 0.2,
  sadness: -0.2,
  anxiety: 0.75,
  anger: 0.8,
  shame: 0.15,
  numb: -0.75
};

const ARCHETYPES = [
  {
    id: 'quiet-anchor',
    label: 'Quiet Anchor',
    when: 'steady, low-arousal echoes with calm, care, or grounded repetition',
    copy: 'You seem to return to steadiness in small, quiet ways.',
    weights: { calm: 1.5, love: 0.6, numb: -0.4, anxiety: -0.5 }
  },
  {
    id: 'weather-watcher',
    label: 'Weather Watcher',
    when: 'emotionally varied echoes with reflective language and careful noticing',
    copy: 'You seem to notice emotional weather before rushing to explain it.',
    weights: { sadness: 0.5, hope: 0.5, anxiety: 0.4, growth: 0.7, calm: 0.2 }
  },
  {
    id: 'soft-rebuilder',
    label: 'Soft Rebuilder',
    when: 'growth and hope appear beside heavier emotions',
    copy: 'You seem to be rebuilding gently, without needing the story to be simple.',
    weights: { growth: 1.4, hope: 1.1, sadness: 0.4, shame: -0.2 }
  },
  {
    id: 'ember-carrier',
    label: 'Ember Carrier',
    when: 'anger, boundary, and resilience signals recur without dominating every echo',
    copy: 'There is heat in your echoes, often near places where something matters.',
    weights: { anger: 1.3, growth: 0.7, love: 0.3, calm: -0.2 }
  },
  {
    id: 'tender-seeker',
    label: 'Tender Seeker',
    when: 'love, loneliness, home, longing, and connection motifs repeat',
    copy: 'Connection seems to matter deeply in the way your memories gather.',
    weights: { love: 1.4, sadness: 0.5, hope: 0.4, shame: -0.2 }
  },
  {
    id: 'threshold-crosser',
    label: 'Threshold Crosser',
    when: 'language of beginnings, endings, change, and identity drift is prominent',
    copy: 'Your echoes feel like they are standing in a doorway between versions of you.',
    weights: { hope: 0.9, growth: 1.2, anxiety: 0.3, sadness: 0.2 }
  }
];

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function tokenize(text = '') {
  return String(text).toLowerCase().match(/[a-z']+/g) || [];
}

function stableIdForEcho(echo) {
  const basis = `${echo.createdAt || echo.date || echo.timestamp || 'echo'}|${echo.text || echo.body || echo.content || echo.note || ''}`;
  let hash = 0;
  for (let i = 0; i < basis.length; i += 1) hash = ((hash << 5) - hash + basis.charCodeAt(i)) | 0;
  return `echo-${Math.abs(hash).toString(36)}`;
}

function normalizeEcho(echo) {
  return {
    id: echo.id || echo.echoId || stableIdForEcho(echo),
    text: echo.text || echo.body || echo.content || echo.note || '',
    createdAt: echo.createdAt || echo.date || echo.timestamp || null,
    mood: echo.mood || echo.emotion || null,
    intensity: typeof echo.intensity === 'number' ? clamp(echo.intensity) : null,
    silenceLevel: typeof echo.silenceLevel === 'number' ? clamp(echo.silenceLevel) : 0,
    tags: Array.isArray(echo.tags) ? echo.tags : []
  };
}

function scoreEcho(input) {
  const echo = normalizeEcho(input);
  const tokens = tokenize(`${echo.text} ${echo.mood || ''} ${echo.tags.join(' ')}`);
  const tokenSet = new Set(tokens);
  const emotionScores = Object.fromEntries(Object.keys(EMOTION_LEXICON).map((emotion) => [emotion, 0]));

  for (const [emotion, words] of Object.entries(EMOTION_LEXICON)) {
    for (const word of words) {
      if (tokenSet.has(word)) emotionScores[emotion] += 1;
    }
  }

  const totalHits = Object.values(emotionScores).reduce((sum, value) => sum + value, 0);
  const explicitMood = echo.mood ? String(echo.mood).toLowerCase() : '';
  if (explicitMood && emotionScores[explicitMood] !== undefined) emotionScores[explicitMood] += 1.5;

  const adjustedTotal = Object.values(emotionScores).reduce((sum, value) => sum + value, 0) || 1;
  const distribution = Object.fromEntries(
    Object.entries(emotionScores).map(([emotion, value]) => [emotion, Number((value / adjustedTotal).toFixed(4))])
  );
  const dominantEmotion = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0][0];
  const intensity = echo.intensity ?? clamp(0.25 + Math.min(totalHits, 6) * 0.1 + Math.abs(distribution[dominantEmotion] - 0.2) * 0.25);
  const valence = Object.entries(distribution).reduce((sum, [emotion, weight]) => sum + weight * (VALENCE[emotion] || 0), 0);
  const arousal = Object.entries(distribution).reduce((sum, [emotion, weight]) => sum + weight * (AROUSAL[emotion] || 0), 0);
  const confidence = clamp(0.25 + Math.min(totalHits, 5) * 0.12 + (echo.mood ? 0.12 : 0) - echo.silenceLevel * 0.25);

  return {
    ...echo,
    emotionScores: distribution,
    dominantEmotion,
    intensity: Number(intensity.toFixed(3)),
    valence: Number(valence.toFixed(3)),
    arousal: Number(arousal.toFixed(3)),
    confidence: Number(confidence.toFixed(3))
  };
}

function aggregateScores(scoredEchoes) {
  const totals = Object.fromEntries(Object.keys(EMOTION_LEXICON).map((emotion) => [emotion, 0]));
  let weightedValence = 0;
  let weightedArousal = 0;
  let weightTotal = 0;

  for (const echo of scoredEchoes) {
    const weight = echo.confidence * (1 - (echo.silenceLevel || 0) * 0.4);
    weightTotal += weight;
    weightedValence += echo.valence * weight;
    weightedArousal += echo.arousal * weight;
    for (const emotion of Object.keys(totals)) totals[emotion] += (echo.emotionScores[emotion] || 0) * weight;
  }

  const denominator = weightTotal || 1;
  const distribution = Object.fromEntries(
    Object.entries(totals).map(([emotion, value]) => [emotion, Number((value / denominator).toFixed(4))])
  );
  const dominant = Object.entries(distribution).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return {
    count: scoredEchoes.length,
    confidence: Number(clamp(weightTotal / Math.max(scoredEchoes.length, 1)).toFixed(3)),
    valence: Number((weightedValence / denominator).toFixed(3)),
    arousal: Number((weightedArousal / denominator).toFixed(3)),
    distribution,
    dominant
  };
}

function assignArchetype(echoes) {
  const scored = echoes.map(scoreEcho);
  const aggregate = aggregateScores(scored);
  const ranked = ARCHETYPES.map((archetype) => {
    const score = Object.entries(archetype.weights).reduce(
      (sum, [emotion, weight]) => sum + (aggregate.distribution[emotion] || 0) * weight,
      0
    );
    return { ...archetype, score: Number(score.toFixed(4)) };
  }).sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const second = ranked[1];
  const confidence = clamp(aggregate.confidence * 0.65 + Math.max(0, best.score - second.score) * 0.7);

  return {
    id: best.id,
    label: best.label,
    copy: best.copy,
    confidence: Number(confidence.toFixed(3)),
    caveat: confidence < 0.45 ? 'Light signal only; invite the user to rename or dismiss this archetype.' : 'Offer as a current pattern, not a fixed identity.',
    alternatives: ranked.slice(1, 3).map(({ id, label, copy, score }) => ({ id, label, copy, score }))
  };
}

function dayKey(dateLike) {
  const date = dateLike ? new Date(dateLike) : new Date(0);
  if (Number.isNaN(date.getTime())) return 'unknown';
  return date.toISOString().slice(0, 10);
}

function weekKey(dateLike) {
  const date = dateLike ? new Date(dateLike) : new Date(0);
  if (Number.isNaN(date.getTime())) return 'unknown';
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const day = Math.floor((date - start) / 86400000);
  return `${date.getUTCFullYear()}-W${String(Math.ceil((day + start.getUTCDay() + 1) / 7)).padStart(2, '0')}`;
}

function detectTrends(echoes, period = 'week') {
  const groups = new Map();
  for (const echo of echoes.map(scoreEcho)) {
    const key = period === 'day' ? dayKey(echo.createdAt) : weekKey(echo.createdAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(echo);
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, items]) => {
    const aggregate = aggregateScores(items);
    return {
      period: key,
      count: items.length,
      dominant: aggregate.dominant,
      valence: aggregate.valence,
      arousal: aggregate.arousal,
      confidence: aggregate.confidence,
      summary: summarizeAggregate(aggregate)
    };
  });
}

function silenceWeight(echoes, expectedPerWeek = 3) {
  if (!echoes.length) {
    return { level: 1, label: 'silent', confidencePenalty: 0.55, interpretation: 'No echoes are available, so reflection should stay spacious and avoid conclusions.' };
  }
  const dates = echoes.map((echo) => new Date(normalizeEcho(echo).createdAt)).filter((date) => !Number.isNaN(date.getTime())).sort((a, b) => a - b);
  if (dates.length < 2) {
    return { level: 0.75, label: 'sparse', confidencePenalty: 0.35, interpretation: 'Only a small signal is available; frame insights as gentle possibilities.' };
  }
  const weeks = Math.max(1, (dates[dates.length - 1] - dates[0]) / 604800000);
  const density = echoes.length / weeks;
  const level = clamp(1 - density / expectedPerWeek);
  const label = level > 0.7 ? 'quiet' : level > 0.35 ? 'uneven' : 'present';
  return {
    level: Number(level.toFixed(3)),
    label,
    confidencePenalty: Number((level * 0.35).toFixed(3)),
    interpretation: label === 'present'
      ? 'There are enough echoes to discuss patterns with moderate confidence.'
      : 'There are quiet spaces in the record; treat silence as context, not evidence.'
  };
}

function clusterEchoes(echoes, options = {}) {
  const maxGapDays = options.maxGapDays ?? 21;
  const scored = echoes.map(scoreEcho).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  const clusters = [];

  for (const echo of scored) {
    const previous = clusters[clusters.length - 1];
    const previousLast = previous?.items[previous.items.length - 1];
    const gapDays = previousLast ? Math.abs(new Date(echo.createdAt || 0) - new Date(previousLast.createdAt || 0)) / 86400000 : Infinity;
    const sameEmotion = previous && previous.dominantEmotion === echo.dominantEmotion;
    const sharedTag = previous && echo.tags.some((tag) => previous.tags.includes(tag));

    if (previous && gapDays <= maxGapDays && (sameEmotion || sharedTag)) {
      previous.items.push(echo);
      previous.tags = [...new Set([...previous.tags, ...echo.tags])];
      previous.aggregate = aggregateScores(previous.items);
      previous.dominantEmotion = previous.aggregate.dominant[0][0];
    } else {
      const aggregate = aggregateScores([echo]);
      clusters.push({
        id: `cluster-${clusters.length + 1}`,
        dominantEmotion: echo.dominantEmotion,
        tags: [...echo.tags],
        items: [echo],
        aggregate
      });
    }
  }

  return clusters.map((cluster) => ({
    id: cluster.id,
    size: cluster.items.length,
    dominantEmotion: cluster.dominantEmotion,
    tags: cluster.tags.slice(0, 6),
    start: cluster.items[0]?.createdAt || null,
    end: cluster.items[cluster.items.length - 1]?.createdAt || null,
    confidence: cluster.aggregate.confidence,
    summary: summarizeAggregate(cluster.aggregate),
    echoIds: cluster.items.map((item) => item.id)
  }));
}

function summarizeAggregate(aggregate) {
  const [first, second] = aggregate.dominant;
  const valencePhrase = aggregate.valence > 0.25 ? 'lighter' : aggregate.valence < -0.25 ? 'heavier' : 'mixed';
  const arousalPhrase = aggregate.arousal > 0.3 ? 'charged' : aggregate.arousal < -0.3 ? 'quiet' : 'steady';
  if (!first || first[1] === 0) return 'The emotional signal is quiet; keep the reflection open-ended.';
  const secondText = second && second[1] > 0.15 ? ` with traces of ${second[0]}` : '';
  return `The echoes lean ${valencePhrase} and ${arousalPhrase}, led by ${first[0]}${secondText}.`;
}

function identityDrift(previousEchoes, currentEchoes) {
  const previous = aggregateScores(previousEchoes.map(scoreEcho));
  const current = aggregateScores(currentEchoes.map(scoreEcho));
  const deltas = Object.keys(EMOTION_LEXICON).map((emotion) => ({
    emotion,
    delta: Number(((current.distribution[emotion] || 0) - (previous.distribution[emotion] || 0)).toFixed(4))
  })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const top = deltas.slice(0, 3);
  const confidence = clamp((previous.confidence + current.confidence) / 2 - (previous.count < 3 || current.count < 3 ? 0.2 : 0));

  return {
    confidence: Number(confidence.toFixed(3)),
    valenceShift: Number((current.valence - previous.valence).toFixed(3)),
    arousalShift: Number((current.arousal - previous.arousal).toFixed(3)),
    topEmotionShifts: top,
    summary: `Compared with the earlier period, the current echoes show ${describeDelta(top[0])}${top[1] ? ` and ${describeDelta(top[1])}` : ''}.`,
    caveat: 'Describe this as a seasonal drift in expression, not a permanent identity change.'
  };
}

function describeDelta(item) {
  if (!item) return 'no clear emotional movement';
  const direction = item.delta > 0 ? 'more' : 'less';
  return `${direction} ${item.emotion}`;
}

function generateWrappedInsights(echoes) {
  const scored = echoes.map(scoreEcho);
  const aggregate = aggregateScores(scored);
  const clusters = clusterEchoes(scored);
  const trends = detectTrends(scored);
  const archetype = assignArchetype(scored);
  const silence = silenceWeight(scored);
  const strongestCluster = [...clusters].sort((a, b) => b.size - a.size)[0];
  const mostPresent = aggregate.dominant[0]?.[0] || 'quiet';

  return {
    headline: `Your echoes most often returned to ${mostPresent}.`,
    emotionalWeather: summarizeAggregate(aggregate),
    archetype,
    recurringPattern: strongestCluster
      ? `${strongestCluster.size} echoes gathered around ${strongestCluster.dominantEmotion}${strongestCluster.tags.length ? ` and ${strongestCluster.tags.slice(0, 2).join(', ')}` : ''}.`
      : 'No recurring cluster is strong enough yet; keep the copy spacious.',
    quietSpaces: silence.interpretation,
    trendCount: trends.length,
    careNote: 'Offer this as a mirror, not a verdict. Invite the user to edit, hide, or rename any insight.',
    confidence: Number(clamp(aggregate.confidence - silence.confidencePenalty).toFixed(3))
  };
}

function analyzeEchoHistory(echoes) {
  const normalized = echoes.map(normalizeEcho);
  const scored = normalized.map(scoreEcho);
  return {
    emotionalSummary: summarizeAggregate(aggregateScores(scored)),
    aggregate: aggregateScores(scored),
    archetype: assignArchetype(scored),
    moodPatterns: detectTrends(scored),
    silenceInterpretation: silenceWeight(scored),
    clusters: clusterEchoes(scored),
    wrappedInsights: generateWrappedInsights(scored)
  };
}

function loadCliInput() {
  const fs = require('fs');
  const raw = fs.readFileSync(0, 'utf8');
  return JSON.parse(raw);
}

function writeCliOutput(payload) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

if (require.main === module) {
  const input = loadCliInput();
  const echoes = Array.isArray(input) ? input : input.echoes;
  if (!Array.isArray(echoes)) {
    process.stderr.write('Expected a JSON array of echoes or an object with an echoes array.\n');
    process.exit(1);
  }
  writeCliOutput(analyzeEchoHistory(echoes));
}

module.exports = {
  EMOTION_LEXICON,
  ARCHETYPES,
  scoreEcho,
  aggregateScores,
  assignArchetype,
  detectTrends,
  silenceWeight,
  clusterEchoes,
  identityDrift,
  generateWrappedInsights,
  analyzeEchoHistory
};
