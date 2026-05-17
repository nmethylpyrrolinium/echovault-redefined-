#!/usr/bin/env python3
"""Static HTML UX audit for EchoVault-style single-page apps."""
from __future__ import annotations

import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
INTERACTIVE_TAGS = {"button", "a", "input", "select", "textarea", "summary"}

class Parser(HTMLParser):
    def __init__(self, path: Path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.stack = []
        self.tags = []
        self.text_by_tag = []
        self.ids = []
        self.anchors = []
        self.has_viewport = False
        self.current_text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        line, _ = self.getpos()
        self.tags.append((tag, attrs, line))
        if "id" in attrs:
            self.ids.append((attrs["id"], line))
        if tag == "a" and attrs.get("href", "").startswith("#") and attrs.get("href") != "#":
            self.anchors.append((attrs["href"][1:], line))
        if tag == "meta" and attrs.get("name") == "viewport":
            self.has_viewport = True
        if tag not in VOID_TAGS:
            self.stack.append((tag, attrs, line, []))

    def handle_endtag(self, tag):
        for idx in range(len(self.stack) - 1, -1, -1):
            if self.stack[idx][0] == tag:
                open_tag, attrs, line, chunks = self.stack.pop(idx)
                text = " ".join("".join(chunks).split())
                self.text_by_tag.append((open_tag, attrs, line, text))
                if self.stack:
                    self.stack[-1][3].append(text)
                break

    def handle_data(self, data):
        if self.stack:
            self.stack[-1][3].append(data)


def html_files(root: Path):
    skip = {"node_modules", ".git", "dist", "build", ".next"}
    for path in root.rglob("*.html"):
        if not any(part in skip for part in path.parts):
            yield path


def audit(root: Path):
    findings = []
    for path in html_files(root):
        parser = Parser(path)
        parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
        rel = path.relative_to(root)
        ids = {}
        for ident, line in parser.ids:
            if ident in ids:
                findings.append(("error", rel, line, f"duplicate id '#{ident}' also appears on line {ids[ident]}"))
            else:
                ids[ident] = line
        for target, line in parser.anchors:
            if target not in ids:
                findings.append(("error", rel, line, f"hash link points to missing id '#{target}'"))
        if not parser.has_viewport:
            findings.append(("warn", rel, 1, "missing mobile viewport meta tag"))
        for tag, attrs, line, text in parser.text_by_tag:
            if tag in {"button", "a"}:
                label = text or attrs.get("aria-label") or attrs.get("title") or attrs.get("alt")
                if not label and not attrs.get("hidden"):
                    findings.append(("warn", rel, line, f"<{tag}> has no visible or accessible label"))
            if tag == "button" and attrs.get("type") is None:
                findings.append(("info", rel, line, "button missing explicit type; use type='button' unless submitting a form"))
        for tag, attrs, line in parser.tags:
            classes = attrs.get("class", "")
            if re.search(r"modal|overlay|dialog|drawer", classes, re.I):
                if tag != "dialog" and "role" not in attrs and "aria-modal" not in attrs:
                    findings.append(("info", rel, line, "overlay/modal-like element should define role, aria-modal, and focus behavior"))
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
        print("PASS html audit: no static issues found")
    return 1 if any(level == "error" for level, *_ in findings) else 0

if __name__ == "__main__":
    sys.exit(main())
