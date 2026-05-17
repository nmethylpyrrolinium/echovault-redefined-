---
name: echovault-echo-soundprint
description: >-
  Build and improve EchoVault's emotionally intelligent music system: Echo Soundprint logic, Spotify-style mood mapping, playlist rules, mood-to-song matching, Mood Receipt music blocks, Wrapped soundtrack summaries, album-cover and visual prompts, and reusable frontend/backend implementation guidance. Use when asked to improve Echo Soundprint, create mood-to-music logic, add Spotify emotional mapping, make Mood Receipt songs better, fix music recommendations, create Wrapped soundtrack logic, map emotions to songs, generate emotional playlists, add album cover logic, or build the EchoVault music engine.
---
# EchoVault Echo Soundprint

## Core identity

Treat EchoVault as a cinematic emotional universe, not a normal journaling app. Memories become echoes and orbs; emotions evolve visually; music should feel like an emotionally inevitable soundtrack rather than a random recommendation list.

Use this skill to make EchoVault's music layer feel:

- **Emotionally intelligent**: infer affect, momentum, and tension from echoes instead of matching only one mood label.
- **Cinematic**: frame playlists as scenes, arcs, motifs, and credits sequences.
- **Personal**: reward repeated emotional patterns, user-selected songs, and recurring memory themes.
- **Explainable**: provide short reasons for each song or category so users trust the Soundprint.
- **Safe and consent-aware**: avoid implying diagnosis, surveillance, or certainty about protected mental health states.

## Workflow

1. **Classify the emotional echo**
   - Identify primary mood, secondary mood, valence, energy, intensity, movement, memory texture, and time context.
   - For taxonomy details, read `references/emotion_taxonomy.md`.

2. **Translate emotion into sound rules**
   - Map emotional state into tempo, mode, acousticness, danceability, instrumentalness, lyrical density, and genre families.
   - For scoring rules, read `references/music_rules.md`.

3. **Score candidate tracks or categories**
   - Prefer weighted scoring over random selection.
   - Use `scripts/echo_soundprint.py` for local scoring prototypes and deterministic playlist assembly.
   - Use `scripts/spotify_helpers.py` when shaping Spotify API requests or normalizing Spotify track data.

4. **Create the product output**
   - For playlists: include arc name, tracks/categories, reasons, transitions, and emotional purpose.
   - For Mood Receipt: include a compact soundtrack block that explains why the songs belong to the receipt.
   - For Wrapped: summarize recurring sonic motifs and emotional seasons.
   - For visual prompts: generate album-cover language tied to orbs, echoes, lighting, and memory texture.

5. **Implement in EchoVault**
   - Keep frontend output poetic and compact.
   - Keep backend logic deterministic, inspectable, and easy to tune with weights.
   - Store user overrides and likes/dislikes as preference signals.
   - For integration architecture, read `references/spotify_integration.md`.

## Output patterns

### Echo Soundprint logic

Return a concise spec with:

- Inputs: echo text, mood labels, timestamp, user-selected tags, prior listening signals if available.
- Feature extraction: valence, energy, intensity, motion, nostalgia, socialness, and weather/light imagery.
- Scoring model: weighted match between echo features and song/audio features.
- Fallbacks: curated category pools when no Spotify token or audio features are available.
- Explanation copy: one sentence per song/category using EchoVault language.

### Mood-to-song matching

Prefer tracks/categories that match the **emotional job** of the echo:

- **Validate**: mirror the feeling without forcing positivity.
- **Hold**: provide atmosphere for unresolved emotions.
- **Shift**: gently move the user toward regulation or energy.
- **Celebrate**: amplify joy, pride, intimacy, or awe.
- **Archive**: make the moment feel like a memory artifact.

### Playlist arcs

Build playlists as arcs, usually 5-12 songs/categories:

1. Opening scene: the emotional entry point.
2. Descent or focus: the deeper truth under the mood.
3. Turning point: tempo, lyric, or texture shifts.
4. Integration: the emotion becomes understandable.
5. Credits: a closing song that makes the echo feel complete.

### Visual prompts

Use `assets/album_cover_prompts.md` and `assets/soundprint_visual_language.json` for reusable prompt language. Tie visuals to:

- orb color and opacity,
- echo age and memory grain,
- light direction,
- sonic texture,
- cinematic environment,
- album-cover composition.

## Resource guide

- Read `references/emotion_taxonomy.md` for EchoVault mood dimensions and labels.
- Read `references/music_rules.md` for mood-to-audio-feature mapping and scoring weights.
- Read `references/spotify_integration.md` for Spotify API implementation guidance.
- Read `references/wrapped_music_logic.md` for yearly/monthly soundtrack summaries.
- Read `references/ui_ux_rules.md` for product copy, interaction, and visual rules.
- Use `scripts/echo_soundprint.py` to prototype mood profiles, playlist scoring, and visual prompts.
- Use `scripts/spotify_helpers.py` for Spotify query construction and track normalization helpers.
- Reuse `assets/playlist_card_template.json`, `assets/mood_receipt_music_block.md`, `assets/album_cover_prompts.md`, and `assets/soundprint_visual_language.json` as output templates.
