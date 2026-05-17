# Mood-to-sound rules

## Audio feature targets

Use these as defaults, then tune with user feedback and actual catalog availability.

| Mood | Valence | Energy | Tempo | Mode | Acousticness | Danceability | Lyrical density |
| --- | ---: | ---: | --- | --- | ---: | ---: | --- |
| grief | 0.10-0.35 | 0.10-0.40 | 55-90 | minor/mixed | high | low-mid | low-mid |
| ache | 0.20-0.50 | 0.20-0.55 | 60-105 | minor/mixed | mid-high | low-mid | mid-high |
| calm | 0.35-0.70 | 0.05-0.35 | 50-90 | major/mixed | high | low | low |
| joy | 0.70-0.95 | 0.55-0.90 | 95-130 | major | low-mid | high | mid |
| awe | 0.55-0.90 | 0.30-0.80 | 65-120 | major/mixed | mid | low-mid | low |
| anger | 0.10-0.45 | 0.70-1.00 | 85-165 | minor | low | mid-high | mid-high |
| confidence | 0.55-0.90 | 0.60-0.95 | 90-140 | major/mixed | low-mid | high | mid |
| focus | 0.35-0.70 | 0.35-0.70 | 70-120 | mixed | low-mid | mid | low |
| nostalgia | 0.35-0.75 | 0.20-0.60 | 60-115 | mixed | mid-high | low-mid | mid |
| hope | 0.55-0.85 | 0.25-0.70 | 75-120 | major | mid | mid | mid |
| numb | 0.10-0.40 | 0.00-0.25 | 45-85 | minor/mixed | mid-high | low | low |
| chaos | 0.05-0.45 | 0.75-1.00 | 110-175 | minor | low | mid | mid |

## Scoring weights

Recommended starting weights:

- mood family match: 30%
- valence distance: 15%
- energy distance: 15%
- intensity fit: 10%
- memory texture match: 10%
- user preference signals: 10%
- novelty/freshness: 5%
- transition fit inside playlist arc: 5%

## Playlist rules

- Do not choose only songs that match the same mood. Build an arc.
- For painful emotions, avoid forcing upbeat songs too early; move gradually.
- For high-intensity moods, include at least one grounding or credits track.
- For nostalgia, include analog, acoustic, older, or memory-coded textures.
- If using Spotify audio features, combine them with EchoVault semantic labels rather than replacing semantic labels.
- Preserve a reason string for every recommendation.

## Reason templates

- "This belongs here because it mirrors the echo's {texture} without flattening it."
- "This is the turning-point track: it keeps the {primary_mood} but adds {movement}."
- "This closes the Soundprint like end credits, turning {tension} into {resolution}."
