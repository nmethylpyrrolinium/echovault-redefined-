#!/usr/bin/env python3
"""Prototype EchoVault Echo Soundprint mood mapping and playlist scoring.

Usage examples:
  python echo_soundprint.py profile --mood ache --modifier nocturnal --text "I miss who we were at midnight"
  python echo_soundprint.py playlist --mood hope --modifier credits --limit 5
  python echo_soundprint.py cover --mood grief --modifier weightless
"""

from __future__ import annotations

import argparse
import json
import math
from dataclasses import dataclass, asdict
from typing import Iterable


MOOD_PROFILES = {
    "grief": {"valence": 0.22, "energy": 0.24, "intensity": 0.72, "tempo": 72, "orb": "blue-violet"},
    "ache": {"valence": 0.34, "energy": 0.38, "intensity": 0.66, "tempo": 84, "orb": "rose-blue"},
    "calm": {"valence": 0.58, "energy": 0.20, "intensity": 0.28, "tempo": 70, "orb": "pale aqua"},
    "joy": {"valence": 0.86, "energy": 0.76, "intensity": 0.62, "tempo": 116, "orb": "gold"},
    "awe": {"valence": 0.76, "energy": 0.52, "intensity": 0.78, "tempo": 92, "orb": "silver-gold"},
    "anger": {"valence": 0.24, "energy": 0.88, "intensity": 0.88, "tempo": 132, "orb": "red-orange"},
    "confidence": {"valence": 0.74, "energy": 0.80, "intensity": 0.70, "tempo": 122, "orb": "emerald-gold"},
    "focus": {"valence": 0.52, "energy": 0.50, "intensity": 0.36, "tempo": 94, "orb": "white-blue"},
    "nostalgia": {"valence": 0.58, "energy": 0.36, "intensity": 0.58, "tempo": 86, "orb": "amber"},
    "hope": {"valence": 0.72, "energy": 0.48, "intensity": 0.52, "tempo": 96, "orb": "green-gold"},
    "numb": {"valence": 0.24, "energy": 0.12, "intensity": 0.42, "tempo": 62, "orb": "gray-blue"},
    "chaos": {"valence": 0.26, "energy": 0.92, "intensity": 0.94, "tempo": 148, "orb": "fractured neon"},
}

MODIFIERS = {
    "cinematic": {"energy": 0.08, "intensity": 0.10, "tags": ["orchestral", "wide", "swell"]},
    "intimate": {"energy": -0.08, "intensity": 0.02, "tags": ["close vocal", "acoustic", "bedroom"]},
    "nocturnal": {"valence": -0.05, "energy": -0.02, "tags": ["late-night", "dark synth", "reverb"]},
    "sunlit": {"valence": 0.08, "energy": 0.06, "tags": ["bright", "golden-hour", "open"]},
    "stormy": {"valence": -0.08, "energy": 0.14, "intensity": 0.08, "tags": ["distortion", "drums", "pressure"]},
    "weightless": {"energy": -0.10, "intensity": -0.04, "tags": ["ambient", "dream", "floating"]},
    "ritual": {"energy": -0.02, "tags": ["repetition", "pulse", "mantra"]},
    "credits": {"valence": 0.04, "energy": -0.04, "tags": ["closing", "resolution", "end credits"]},
}

CATEGORY_LIBRARY = [
    {"name": "rain-window piano", "moods": ["grief", "calm"], "valence": 0.26, "energy": 0.18, "tempo": 66, "tags": ["piano", "rain", "soft"]},
    {"name": "late-night R&B ache", "moods": ["ache", "nocturnal"], "valence": 0.36, "energy": 0.42, "tempo": 82, "tags": ["vocal", "reverb", "midnight"]},
    {"name": "sunlit pop release", "moods": ["joy", "hope"], "valence": 0.84, "energy": 0.76, "tempo": 118, "tags": ["bright", "hook", "release"]},
    {"name": "lofi constellation", "moods": ["focus", "calm"], "valence": 0.54, "energy": 0.40, "tempo": 88, "tags": ["instrumental", "steady", "soft beat"]},
    {"name": "main-character bassline", "moods": ["confidence", "joy"], "valence": 0.76, "energy": 0.84, "tempo": 124, "tags": ["bass", "runway", "bold"]},
    {"name": "controlled storm drums", "moods": ["anger", "chaos"], "valence": 0.24, "energy": 0.90, "tempo": 138, "tags": ["drums", "edge", "pressure"]},
    {"name": "analog memory haze", "moods": ["nostalgia", "ache"], "valence": 0.56, "energy": 0.34, "tempo": 80, "tags": ["warm", "grain", "old photo"]},
    {"name": "end-credits synth swell", "moods": ["awe", "hope", "credits"], "valence": 0.70, "energy": 0.50, "tempo": 92, "tags": ["cinematic", "swell", "resolution"]},
    {"name": "fog-drift ambient", "moods": ["numb", "weightless"], "valence": 0.28, "energy": 0.12, "tempo": 58, "tags": ["ambient", "fog", "minimal"]},
]


@dataclass
class MoodProfile:
    mood: str
    modifier: str | None
    valence: float
    energy: float
    intensity: float
    tempo: int
    orb: str
    tags: list[str]


def clamp(value: float) -> float:
    return max(0.0, min(1.0, value))


def build_profile(mood: str, modifier: str | None = None, text: str = "") -> MoodProfile:
    if mood not in MOOD_PROFILES:
        raise SystemExit(f"Unknown mood '{mood}'. Choose one of: {', '.join(sorted(MOOD_PROFILES))}")
    base = dict(MOOD_PROFILES[mood])
    tags: list[str] = [mood]
    if modifier:
        if modifier not in MODIFIERS:
            raise SystemExit(f"Unknown modifier '{modifier}'. Choose one of: {', '.join(sorted(MODIFIERS))}")
        delta = MODIFIERS[modifier]
        tags.append(modifier)
        tags.extend(delta.get("tags", []))
        for key in ("valence", "energy", "intensity"):
            if key in delta:
                base[key] = clamp(float(base[key]) + float(delta[key]))
    lowered = text.lower()
    if any(word in lowered for word in ["midnight", "night", "dark"]):
        tags.append("nocturnal")
    if any(word in lowered for word in ["rain", "storm", "window"]):
        tags.append("weathered")
    if any(word in lowered for word in ["remember", "used to", "childhood", "again"]):
        tags.append("memory-soaked")
    return MoodProfile(
        mood=mood,
        modifier=modifier,
        valence=round(float(base["valence"]), 3),
        energy=round(float(base["energy"]), 3),
        intensity=round(float(base["intensity"]), 3),
        tempo=int(base["tempo"]),
        orb=str(base["orb"]),
        tags=sorted(set(tags)),
    )


def score_category(profile: MoodProfile, category: dict) -> float:
    mood_bonus = 0.30 if profile.mood in category["moods"] else 0.0
    if profile.modifier and profile.modifier in category["moods"]:
        mood_bonus += 0.08
    valence_score = 1 - abs(profile.valence - category["valence"])
    energy_score = 1 - abs(profile.energy - category["energy"])
    tempo_score = 1 - min(abs(profile.tempo - category["tempo"]) / 120, 1)
    tag_overlap = len(set(profile.tags) & set(category["tags"])) / max(len(profile.tags), 1)
    score = mood_bonus + 0.24 * valence_score + 0.22 * energy_score + 0.14 * tempo_score + 0.10 * tag_overlap
    return round(score, 4)


def ranked_categories(profile: MoodProfile, limit: int) -> list[dict]:
    ranked = []
    for category in CATEGORY_LIBRARY:
        item = dict(category)
        item["score"] = score_category(profile, category)
        item["reason"] = reason_for(profile, item)
        ranked.append(item)
    return sorted(ranked, key=lambda item: item["score"], reverse=True)[:limit]


def reason_for(profile: MoodProfile, item: dict) -> str:
    return (
        f"This fits the {profile.mood} echo because {item['name']} carries "
        f"{', '.join(item['tags'][:2])} energy without breaking the {profile.orb} orb."
    )


def cover_prompt(profile: MoodProfile) -> str:
    modifier = f" with {profile.modifier} texture" if profile.modifier else ""
    return (
        f"Cinematic album cover for an EchoVault Soundprint: a {profile.orb} memory orb{modifier}, "
        "floating in a dark atmospheric space, visible soundwaves wrapping around it, subtle film grain, "
        "emotional but not literal, premium Spotify Wrapped-style composition, no text."
    )


def print_json(value: object) -> None:
    print(json.dumps(value, indent=2, ensure_ascii=False))


def main(argv: Iterable[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="EchoVault Echo Soundprint prototype helper")
    sub = parser.add_subparsers(dest="command", required=True)

    def add_common(p: argparse.ArgumentParser) -> None:
        p.add_argument("--mood", required=True, choices=sorted(MOOD_PROFILES))
        p.add_argument("--modifier", choices=sorted(MODIFIERS))
        p.add_argument("--text", default="")

    profile_parser = sub.add_parser("profile", help="Build a mood profile")
    add_common(profile_parser)

    playlist_parser = sub.add_parser("playlist", help="Score fallback playlist categories")
    add_common(playlist_parser)
    playlist_parser.add_argument("--limit", type=int, default=5)

    cover_parser = sub.add_parser("cover", help="Generate an album-cover prompt")
    add_common(cover_parser)

    args = parser.parse_args(argv)
    profile = build_profile(args.mood, args.modifier, args.text)

    if args.command == "profile":
        print_json(asdict(profile))
    elif args.command == "playlist":
        print_json({"profile": asdict(profile), "categories": ranked_categories(profile, args.limit)})
    elif args.command == "cover":
        print(cover_prompt(profile))


if __name__ == "__main__":
    main()
