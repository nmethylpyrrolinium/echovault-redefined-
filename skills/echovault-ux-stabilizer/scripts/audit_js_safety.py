#!/usr/bin/env python3
"""Static JS audit for broken controls, unsafe storage, and navigation fragility."""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

SKIP = {"node_modules", ".git", "dist", "build", ".next"}
ID_RE = re.compile(r"id\s*=\s*['\"]([^'\"]+)['\"]")
CLASS_RE = re.compile(r"class\s*=\s*['\"]([^'\"]+)['\"]")
GET_ID_RE = re.compile(r"getElementById\(\s*['\"]([^'\"]+)['\"]\s*\)")
QUERY_RE = re.compile(r"querySelector(?:All)?\(\s*['\"]([^'\"]+)['\"]\s*\)")
LISTENER_RE = re.compile(r"(getElementById\([^)]*\)|querySelector\([^)]*\)|\w+)\.addEventListener\(")
STORAGE_RE = re.compile(r"\b(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem|clear)\(")


def files(root: Path, suffixes):
    for path in root.rglob("*"):
        if path.is_file() and path.suffix in suffixes and not any(part in SKIP for part in path.parts):
            yield path


def collect_dom(root: Path):
    ids, classes = set(), set()
    for path in files(root, {".html"}):
        text = path.read_text(encoding="utf-8", errors="ignore")
        ids.update(ID_RE.findall(text))
        for cls in CLASS_RE.findall(text):
            classes.update(cls.split())
    return ids, classes


def audit(root: Path):
    ids, classes = collect_dom(root)
    findings = []
    for path in files(root, {".js", ".mjs", ".html"}):
        rel = path.relative_to(root)
        text = path.read_text(encoding="utf-8", errors="ignore")
        lines = text.splitlines()
        for match in GET_ID_RE.finditer(text):
            ident = match.group(1)
            line = text.count("\n", 0, match.start()) + 1
            if ids and ident not in ids:
                findings.append(("warn", rel, line, f"getElementById('{ident}') has no matching static HTML id"))
        for match in QUERY_RE.finditer(text):
            selector = match.group(1)
            line = text.count("\n", 0, match.start()) + 1
            if selector.startswith("#") and ids and selector[1:] not in ids:
                findings.append(("warn", rel, line, f"querySelector('{selector}') has no matching static HTML id"))
            if selector.startswith(".") and classes and selector[1:].split()[0] not in classes:
                findings.append(("info", rel, line, f"querySelector('{selector}') has no obvious static class match"))
        for idx, line_text in enumerate(lines, start=1):
            if ".addEventListener(" in line_text and "?." not in line_text:
                window = "\n".join(lines[max(0, idx-3):idx+2])
                if "if (" not in window and "if(" not in window and "const " not in line_text:
                    findings.append(("info", rel, idx, "event listener may need a null guard for missing elements"))
            if STORAGE_RE.search(line_text):
                window = "\n".join(lines[max(0, idx-5):idx+5])
                if "try" not in window and "safe" not in window.lower():
                    findings.append(("warn", rel, idx, "storage access should be guarded for private mode/quota/security errors"))
            if "scrollTo(" in line_text or "scrollIntoView(" in line_text:
                if "behavior" in line_text and "prefers-reduced-motion" not in text:
                    findings.append(("info", rel, idx, "smooth scrolling should respect prefers-reduced-motion"))
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
        print("PASS js audit: no static issues found")
    return 0

if __name__ == "__main__":
    sys.exit(main())
