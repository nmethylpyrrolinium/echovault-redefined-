# Spotify integration plan

## Product stance

Spotify is a catalog and playback layer. EchoVault's differentiator is the emotional reasoning layer: Echo Soundprint should decide why a song belongs before Spotify provides final candidates.

## Suggested backend flow

1. Extract an EchoVault mood profile from the echo.
2. Convert the profile into audio feature targets and seed genres/artists/tracks.
3. Query Spotify recommendations/search when tokens are available.
4. Normalize candidates into EchoVault's internal track schema.
5. Score candidates with EchoVault weights.
6. Return playlist cards with reasons and visual metadata.
7. Store explicit likes/dislikes, skips, saves, and manual picks as preference signals.

## Internal track schema

```json
{
  "id": "spotify:track:...",
  "title": "Song title",
  "artist": "Artist",
  "source": "spotify",
  "audio": {
    "valence": 0.42,
    "energy": 0.58,
    "tempo": 96,
    "mode": 0,
    "acousticness": 0.34,
    "danceability": 0.62,
    "instrumentalness": 0.08
  },
  "echoTags": ["ache", "nocturnal", "intimate"],
  "reason": "Why EchoVault chose it"
}
```

## API guidance

- Keep OAuth and token refresh server-side.
- Cache stable track metadata and audio analysis to reduce rate-limit pressure.
- Treat Spotify popularity as a weak signal, not the recommendation engine.
- Keep a no-token fallback: curated pools by mood family and category.
- Never expose private Spotify data in Wrapped-style summaries without explicit user consent.

## Fallback category examples

- grief: "rain-window piano", "slow indie confession", "ambient mourning"
- ache: "late-night R&B ache", "bedroom pop longing", "soft synth heartbreak"
- joy: "sunlit pop release", "disco kitchen dancing", "golden-hour indie"
- focus: "lofi constellation", "minimal pulse", "instrumental coding fog"
- confidence: "main-character bassline", "runway synth", "victory credits"
