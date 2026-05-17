# EchoVault Emotional Archetype System

Archetypes are temporary mirrors for the current season of echoes. They are not personality types, diagnoses, or fixed identities.

## Rules

- Always include confidence.
- Always allow rename, hide, or dismiss.
- Recompute from recent data unless the product intentionally stores a historical archetype.
- Do not assign an archetype from fewer than three meaningful echoes unless labeled "light signal."
- Avoid archetypes that glamorize suffering or imply destiny.

## Canonical archetypes

| ID | Label | Signal | User-facing copy |
| --- | --- | --- | --- |
| quiet-anchor | Quiet Anchor | calm, care, steadiness, low arousal | "You seem to return to steadiness in small, quiet ways." |
| weather-watcher | Weather Watcher | varied emotions, reflective language, noticing | "You seem to notice emotional weather before rushing to explain it." |
| soft-rebuilder | Soft Rebuilder | hope/growth beside sadness or shame | "You seem to be rebuilding gently, without needing the story to be simple." |
| ember-carrier | Ember Carrier | anger, boundaries, resilience, value-protection | "There is heat in your echoes, often near places where something matters." |
| tender-seeker | Tender Seeker | love, longing, loneliness, home, connection | "Connection seems to matter deeply in the way your memories gather." |
| threshold-crosser | Threshold Crosser | beginnings, endings, identity drift, change | "Your echoes feel like they are standing in a doorway between versions of you." |

## Assignment formula

1. Aggregate recent echo emotion distribution.
2. Score each archetype by weighted emotion families and motifs.
3. Penalize sparse data and long silence.
4. Return the best archetype plus 1-2 alternatives.
5. Use a caveat if confidence is below 0.45.

## UI copy

- Label: use title case and keep under 28 characters.
- Description: one sentence, non-absolute.
- CTA: "Rename," "Hide," or "Tell EchoVault this does not fit."
