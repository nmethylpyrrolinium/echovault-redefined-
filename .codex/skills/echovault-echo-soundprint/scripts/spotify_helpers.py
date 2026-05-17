#!/usr/bin/env python3
"""Spotify helper utilities for EchoVault prototypes.

This script does not call Spotify directly. It creates recommendation/search payloads
and normalizes sample track JSON so API integration stays testable without network access.
"""

from __future__ import annotations

import argparse
import json
from typing import Any

MOOD_TO_SEEDS = {
    "grief": ["ambient", "piano", "indie"],
    "ache": ["r-n-b", "indie-pop", "singer-songwriter"],
    "calm": ["ambient", "acoustic", "chill"],
    "joy": ["pop", "disco", "funk"],
    "awe": ["soundtracks", "ambient", "post-rock"],
    "anger": ["rock", "hip-hop", "electronic"],
    "confidence": ["pop", "hip-hop", "dance"],
    "focus": ["lo-fi", "electronic", "study"],
    "nostalgia": ["indie", "soul", "singer-songwriter"],
    "hope": ["indie-pop", "folk", "pop"],
    "numb": ["ambient", "sleep", "minimal-techno"],
    "chaos": ["industrial", "electronic", "punk"],
}

TARGETS = {
    "grief": {"target_valence": 0.24, "target_energy": 0.24, "target_tempo": 72},
    "ache": {"target_valence": 0.34, "target_energy": 0.38, "target_tempo": 84},
    "calm": {"target_valence": 0.58, "target_energy": 0.20, "target_tempo": 70},
    "joy": {"target_valence": 0.86, "target_energy": 0.76, "target_tempo": 116},
    "awe": {"target_valence": 0.76, "target_energy": 0.52, "target_tempo": 92},
    "anger": {"target_valence": 0.24, "target_energy": 0.88, "target_tempo": 132},
    "confidence": {"target_valence": 0.74, "target_energy": 0.80, "target_tempo": 122},
    "focus": {"target_valence": 0.52, "target_energy": 0.50, "target_tempo": 94},
    "nostalgia": {"target_valence": 0.58, "target_energy": 0.36, "target_tempo": 86},
    "hope": {"target_valence": 0.72, "target_energy": 0.48, "target_tempo": 96},
    "numb": {"target_valence": 0.24, "target_energy": 0.12, "target_tempo": 62},
    "chaos": {"target_valence": 0.26, "target_energy": 0.92, "target_tempo": 148},
}


def recommendation_payload(mood: str, limit: int = 20) -> dict[str, Any]:
    if mood not in TARGETS:
        raise SystemExit(f"Unknown mood '{mood}'.")
    return {
        "endpoint": "GET /v1/recommendations",
        "params": {
            "limit": limit,
            "seed_genres": ",".join(MOOD_TO_SEEDS[mood][:3]),
            **TARGETS[mood],
        },
        "echovaultNote": "Use Spotify as candidate supply; apply EchoVault scoring before display.",
    }


def search_query(mood: str, modifier: str | None = None) -> str:
    seeds = MOOD_TO_SEEDS.get(mood)
    if not seeds:
        raise SystemExit(f"Unknown mood '{mood}'.")
    texture = f" {modifier}" if modifier else ""
    return f"{mood}{texture} {' OR '.join(seeds[:2])}"


def normalize_track(track: dict[str, Any], audio_features: dict[str, Any] | None = None) -> dict[str, Any]:
    artists = track.get("artists") or []
    return {
        "id": track.get("uri") or track.get("id"),
        "title": track.get("name"),
        "artist": ", ".join(artist.get("name", "Unknown") for artist in artists) or "Unknown",
        "source": "spotify",
        "audio": audio_features or {},
        "echoTags": [],
        "reason": "Candidate track; score with EchoVault before showing to users.",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Spotify payload helper for EchoVault")
    sub = parser.add_subparsers(dest="command", required=True)
    payload = sub.add_parser("payload")
    payload.add_argument("--mood", required=True)
    payload.add_argument("--limit", type=int, default=20)
    query = sub.add_parser("query")
    query.add_argument("--mood", required=True)
    query.add_argument("--modifier")
    args = parser.parse_args()
    if args.command == "payload":
        print(json.dumps(recommendation_payload(args.mood, args.limit), indent=2))
    elif args.command == "query":
        print(search_query(args.mood, args.modifier))


if __name__ == "__main__":
    main()
