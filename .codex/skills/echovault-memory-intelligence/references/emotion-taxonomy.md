# EchoVault Emotion Taxonomy

Use this taxonomy to keep EchoVault's emotional logic consistent, gentle, and explainable.

## Primary emotional families

| Family | Valence | Energy | Use when echoes mention | Avoid saying |
| --- | ---: | ---: | --- | --- |
| joy | positive | medium/high | delight, gratitude, play, relief, celebration | "You are happy now" |
| calm | positive/neutral | low | peace, rest, safety, groundedness, softness | "You are fixed" |
| hope | positive | medium | beginnings, possibility, trying again, future orientation | "Everything will be okay" |
| love | positive | low/medium | care, closeness, friendship, home, tenderness | "This person is good for you" |
| growth | mixed/positive | medium | learning, boundaries, courage, change, self-recognition | "You healed" |
| sadness | negative | low/medium | grief, missing, loneliness, heaviness, ache | "You are depressed" |
| anxiety | negative | high | worry, uncertainty, fear, spiraling, pressure | "You have anxiety" |
| anger | negative/mobilizing | high | unfairness, boundaries, frustration, heat, resentment | "You are hostile" |
| shame | negative | low/medium | guilt, hiding, feeling small, regret, self-blame | "You are broken" |
| numb | negative/neutral | low | fog, distance, blankness, muted feelings, disconnection | "You do not care" |

## Scoring guidance

- Score explicit user labels higher than inferred text.
- Let one echo hold multiple emotional families.
- Decay confidence when text is short, sarcastic, contradictory, or purely factual.
- Use intensity as volume, not importance. A quiet insight can matter deeply.
- Never infer clinical conditions from emotion families.

## Summary patterns

Prefer:

- "Your echoes leaned toward sadness and hope this week."
- "There were more charged entries around work language."
- "Calm appeared in small, repeated moments rather than one big shift."

Avoid:

- "You are sad."
- "Your trauma response is..."
- "You always feel anxious at night."
