#!/usr/bin/env python3
"""PWA manifest and service worker static audit."""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

SKIP = {"node_modules", ".git", "dist", "build", ".next"}
MANIFEST_LINK_RE = re.compile(r"<link[^>]+rel=[\"']manifest[\"'][^>]*>", re.I)
HREF_RE = re.compile(r"href=[\"']([^\"']+)[\"']", re.I)


def read(path: Path):
    return path.read_text(encoding="utf-8", errors="ignore")


def audit(root: Path):
    findings = []
    html_paths = [p for p in root.rglob("*.html") if not any(part in SKIP for part in p.parts)]
    manifest_refs = []
    for html in html_paths:
        text = read(html)
        for link in MANIFEST_LINK_RE.findall(text):
            href = HREF_RE.search(link)
            if href:
                manifest_refs.append((html, href.group(1)))
        if "serviceWorker" not in text and not any("serviceWorker" in read(js) for js in root.glob("*.js")):
            findings.append(("warn", html.relative_to(root), 1, "no obvious service worker registration found"))
    if not manifest_refs:
        findings.append(("error", Path("."), 1, "no <link rel='manifest'> found in HTML"))
    for html, href in manifest_refs:
        manifest_path = (html.parent / href.lstrip("/")).resolve()
        rel = manifest_path.relative_to(root) if manifest_path.exists() and root in manifest_path.parents or manifest_path == root else Path(href)
        if not manifest_path.exists():
            findings.append(("error", html.relative_to(root), 1, f"manifest href '{href}' does not exist"))
            continue
        try:
            data = json.loads(read(manifest_path))
        except json.JSONDecodeError as exc:
            findings.append(("error", manifest_path.relative_to(root), exc.lineno, f"manifest JSON is invalid: {exc.msg}"))
            continue
        for key in ["name", "short_name", "start_url", "display", "icons"]:
            if key not in data:
                findings.append(("warn", manifest_path.relative_to(root), 1, f"manifest missing '{key}'"))
        if data.get("display") not in {"standalone", "fullscreen", "minimal-ui", None}:
            findings.append(("info", manifest_path.relative_to(root), 1, "display should usually be standalone for premium app-like PWA behavior"))
        for icon in data.get("icons", []) if isinstance(data.get("icons"), list) else []:
            src = icon.get("src") if isinstance(icon, dict) else None
            if src:
                icon_path = (manifest_path.parent / src.lstrip("/")).resolve()
                if not icon_path.exists():
                    findings.append(("error", manifest_path.relative_to(root), 1, f"manifest icon '{src}' is missing"))
    sw_paths = [p for p in root.rglob("sw.js") if not any(part in SKIP for part in p.parts)]
    if not sw_paths:
        findings.append(("warn", Path("."), 1, "no sw.js found; confirm service worker path if using PWA install"))
    for sw in sw_paths:
        text = read(sw)
        rel = sw.relative_to(root)
        for event in ["install", "activate", "fetch"]:
            if f"'{event}'" not in text and f'"{event}"' not in text:
                findings.append(("warn", rel, 1, f"service worker missing '{event}' event listener"))
        if "cache" not in text.lower():
            findings.append(("info", rel, 1, "service worker has no obvious Cache API usage"))
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
        print("PASS pwa audit: no static issues found")
    return 1 if any(level == "error" for level, *_ in findings) else 0

if __name__ == "__main__":
    sys.exit(main())
