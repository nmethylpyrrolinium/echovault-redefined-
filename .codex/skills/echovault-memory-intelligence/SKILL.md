---
name: echovault-memory-intelligence
description: Emotional memory intelligence for EchoVault. Use when Codex needs to improve Identity Drift, add emotional pattern detection, create emotional archetypes, improve Wrapped insights, analyze echo history, make weekly/monthly reflections smarter, add memory clustering, improve emotional intelligence logic, score moods, interpret silence levels, summarize user echoes, or design gentle cinematic personalized memory features without positioning EchoVault as therapy.
---

# EchoVault Memory Intelligence

Use this skill to make EchoVault's memory features feel emotionally intelligent, non-random, gentle, cinematic, and deeply personal while staying clearly outside therapy, diagnosis, or crisis counseling.

## Core workflow

1. **Locate the echo data shape first.** Inspect the app's echo, journal, reflection, Wrapped, or memory schemas before changing logic. Preserve existing naming and privacy boundaries.
2. **Choose the smallest intelligence layer that fits the request.** Use deterministic scoring and transparent heuristics before adding model calls. Prefer explainable signals over opaque randomness.
3. **Read only the needed reference.**
   - Emotion taxonomy: `references/emotion-taxonomy.md`
   - Reflection voice and copy constraints: `references/reflection-tone-rules.md`
   - Archetype assignment: `references/archetype-system.md`
   - Memory and echo clustering: `references/memory-clustering-rules.md`
   - Safety boundaries: `references/ethical-safety-boundaries.md`
4. **Reuse scripts where possible.** Start from `scripts/memory-intelligence.js` for mood scoring, emotional clustering, trend detection, silence weighting, archetype assignment, and Wrapped insight generation.
5. **Use assets for output copy.** Pull formats from `assets/` when implementing reflection cards, archetype labels, Wrapped insight copy, empty states, or emotional summary blocks.
6. **Validate with representative histories.** Test quiet weeks, sparse histories, mixed moods, repeated emotional loops, outlier echoes, and emotionally intense entries.

## Implementation principles

- Treat echoes as signals, not proof. Use language like "seems," "may," "often," and "this season" instead of absolute claims.
- Keep outputs emotionally specific but non-clinical. Name feelings, rhythms, and shifts; do not diagnose disorders or infer trauma.
- Make silence meaningful without over-reading it. Interpret missing echoes as low confidence unless nearby context supports a pattern.
- Prefer trend language over judgment. Say "your echoes leaned heavier on Sundays" rather than "you are sad on Sundays."
- Separate identity drift from identity verdicts. Describe directional movement in values, themes, tone, and attention.
- Give users agency. Include opt-outs, edit controls, and "does this fit?" style affordances for archetypes or summaries.
- Avoid gamifying pain. Wrapped insights should honor resilience, tenderness, uncertainty, and growth without ranking suffering.

## Script quick start

Use the reusable JS module directly in app code or run it as a CLI against a JSON array of echoes:

```bash
node .codex/skills/echovault-memory-intelligence/scripts/memory-intelligence.js ./echoes.json
```

Expected echo fields are flexible, but best results use:

```js
{
  id: "echo_123",
  text: "I felt lighter after walking home.",
  createdAt: "2026-05-17T20:30:00Z",
  mood: "hopeful",          // optional
  intensity: 0.6,            // optional 0..1
  silenceLevel: 0.2,         // optional 0..1
  tags: ["walk", "home"]   // optional
}
```

## Output targets

When implementing EchoVault features, return or persist these kinds of fields when useful:

- `emotionalSummary`: gentle plain-language read of dominant emotional tones.
- `identityDrift`: values, themes, language, and attention shifts between periods.
- `archetype`: current emotional archetype with confidence and non-fixed copy.
- `moodPatterns`: recurring day/time/theme rhythms and confidence.
- `silenceInterpretation`: confidence-aware note about sparse or quiet periods.
- `clusters`: related echo groups by theme, mood, and time proximity.
- `reflections`: weekly or monthly narrative cards.
- `wrappedInsights`: year/season/month highlights, motifs, emotional weather, and care-oriented takeaways.

## Safety checklist before shipping

- No diagnosis, treatment advice, or claims that EchoVault knows why the user feels something.
- No crisis assessment unless the product already has a reviewed safety flow.
- No manipulation, shame, or scarcity copy.
- No private inference displayed as fact.
- Confidence is reduced for sparse data, long silence, contradictory entries, or model-only guesses.
