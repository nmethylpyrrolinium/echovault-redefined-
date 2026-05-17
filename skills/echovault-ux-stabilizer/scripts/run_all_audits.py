#!/usr/bin/env python3
"""Run all EchoVault UX Stabilizer static audits."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

SCRIPTS = ["audit_html.py", "audit_js_safety.py", "audit_pwa.py", "audit_performance.py"]


def main():
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    here = Path(__file__).resolve().parent
    worst = 0
    for script in SCRIPTS:
        print(f"\n=== {script} ===", flush=True)
        result = subprocess.run([sys.executable, str(here / script), str(root)], text=True)
        worst = max(worst, result.returncode)
    return worst

if __name__ == "__main__":
    sys.exit(main())
