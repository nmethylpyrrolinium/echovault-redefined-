#!/usr/bin/env python3
"""Static performance audit for animation, layout, and asset risks."""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

SKIP = {"node_modules", ".git", "dist", "build", ".next"}
LAYOUT_ANIM_RE = re.compile(r"transition\s*:[^;]*(all|width|height|top|left|right|bottom|margin|padding)|@keyframes[\s\S]{0,400}(width|height|top|left|right|bottom|margin|padding)", re.I)
HEAVY_FILTER_RE = re.compile(r"filter\s*:[^;]*(blur\((?:[2-9]\d|\d{3,})px\)|drop-shadow)", re.I)
INFINITE_RE = re.compile(r"animation\s*:[^;]*infinite", re.I)
SCROLL_HANDLER_RE = re.compile(r"addEventListener\(\s*['\"]scroll['\"]", re.I)


def files(root: Path, suffixes):
    for path in root.rglob("*"):
        if path.is_file() and path.suffix in suffixes and not any(part in SKIP for part in path.parts):
            yield path


def line_no(text, pos):
    return text.count("\n", 0, pos) + 1


def audit(root: Path):
    findings = []
    for path in files(root, {".css", ".html", ".js", ".mjs"}):
        rel = path.relative_to(root)
        text = path.read_text(encoding="utf-8", errors="ignore")
        for regex, level, msg in [
            (LAYOUT_ANIM_RE, "warn", "animation/transition may trigger layout; prefer transform and opacity"),
            (HEAVY_FILTER_RE, "info", "large blur/drop-shadow filters can be expensive on mobile"),
            (INFINITE_RE, "info", "infinite animation should be subtle, composited, and disabled for reduced motion"),
            (SCROLL_HANDLER_RE, "info", "scroll listener should be passive/throttled or replaced with IntersectionObserver"),
        ]:
            for match in regex.finditer(text):
                findings.append((level, rel, line_no(text, match.start()), msg))
        if "prefers-reduced-motion" not in text and ("animation" in text or "transition" in text):
            findings.append(("warn", rel, 1, "motion styles/scripts should honor prefers-reduced-motion"))
        if path.suffix == ".html":
            for match in re.finditer(r"<img\b(?![^>]*\bloading=)", text, re.I):
                findings.append(("info", rel, line_no(text, match.start()), "image missing loading='lazy' unless it is above the fold/LCP"))
    return findings


def main():
    argp = argparse.ArgumentParser()
    argp.add_argument("root", nargs="?", default=".")
    args = argp.parse_args()
    root = Path(args.root).resolve()
    findings = audit(root)
    for level, rel, line, msg in findings:
        print(f"{level.upper()} {rel}:{line}: {msg}")
    if not findings:
        print("PASS performance audit: no static issues found")
    return 0

if __name__ == "__main__":
    sys.exit(main())
