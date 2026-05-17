---
name: echovault-ux-stabilizer
description: Improve EchoVault usability, stability, mobile polish, navigation, layout, PWA behavior, accessibility, and animation performance while preserving its calm cinematic emotional-universe identity. Use when asked to fix EchoVault UI bugs, improve mobile layout, fix navigation scroll, fix broken buttons, improve onboarding, fix PWA install, stabilize animations, improve readability, fix overlay issues, or make EchoVault feel premium and stable without rewriting the whole project.
---

# EchoVault UX Stabilizer

## Purpose

Use this skill to make EchoVault feel stable, readable, smooth, mobile-friendly, and premium without flattening it into a generic dashboard or journaling app. Treat EchoVault as a calm cinematic emotional universe: intimate, spacious, atmospheric, responsive, and trustworthy.

## Operating Principles

1. Preserve the emotional-universe identity before changing visuals.
   - Keep cinematic depth, soft gradients, atmospheric motion, warm copy, and memory/vault metaphors.
   - Avoid generic SaaS/dashboard patterns unless they solve a concrete usability problem.
2. Stabilize before redesigning.
   - Prefer targeted fixes to navigation, layout containment, z-index, event binding, focus handling, storage safety, and responsive sizing.
   - Do not rewrite the whole project unless the user explicitly asks.
3. Make interactions obvious and reversible.
   - Buttons need visible states, reachable hit targets, keyboard focus, and clear outcomes.
   - Modals, overlays, onboarding steps, and install prompts need close/escape/back paths.
4. Optimize for mobile first.
   - Test narrow widths, dynamic viewport height, sticky/fixed elements, scroll locking, and thumb reach.
   - Avoid horizontal overflow, tiny tap targets, and content hidden behind bottom navigation.
5. Keep motion premium, not noisy.
   - Use slow, purposeful transitions and honor `prefers-reduced-motion`.
   - Avoid layout-thrashing animation of `top`, `left`, `width`, `height`, or large blur filters.

## Stabilization Workflow

1. **Scope the task.** Identify whether the request is navigation, mobile layout, broken controls, onboarding, PWA install, accessibility, overlays, readability, or animation performance.
2. **Run targeted audits.** Use scripts from this skill folder when relevant (for example, `<skill-dir>/scripts/audit_html.py <project-root>`):
   - `python3 <skill-dir>/scripts/run_all_audits.py <project-root>` for a combined static audit.
   - `python3 <skill-dir>/scripts/audit_html.py <project-root>` for broken anchors, duplicate IDs, empty controls, viewport issues, and overlay/focus clues.
   - `python3 <skill-dir>/scripts/audit_js_safety.py <project-root>` for missing event-listener targets, unsafe localStorage/sessionStorage usage, and risky navigation handlers.
   - `python3 <skill-dir>/scripts/audit_pwa.py <project-root>` for manifest/service worker/installability issues.
   - `python3 <skill-dir>/scripts/audit_performance.py <project-root>` for heavy animation, scroll, image, and render-cost patterns.
3. **Read only the needed references.** Load the relevant files from `references/` instead of all of them.
4. **Patch surgically.** Fix root causes, preserve existing content, and keep selectors/data structures compatible.
5. **Verify behavior.** Run the app’s existing checks plus the relevant audit script. For visible UI changes, inspect mobile and desktop and capture a screenshot when the environment supports it.
6. **Document risk.** Note any static-audit limitations and any behavior that still needs browser/manual validation.

## Resource Map

### scripts/

- `run_all_audits.py` — Runs all bundled audits and returns a combined nonzero exit when hard errors are found.
- `audit_html.py` — Checks HTML for broken hash anchors, duplicate IDs, missing viewport tags, empty buttons/links, risky overlays, and focusable controls.
- `audit_js_safety.py` — Checks JavaScript for event listeners bound to missing IDs/classes, storage usage without safety wrappers, and common dead-button patterns.
- `audit_pwa.py` — Checks manifest links, required manifest fields, icon files, service worker registration, install prompt hooks, and offline cache clues.
- `audit_performance.py` — Checks CSS/JS/HTML for animation and rendering patterns that can hurt smoothness.

Copy or run scripts from the skill folder. They are intentionally dependency-free Python scripts.

### references/

- `echovault-ux-principles.md` — Identity, tone, and premium stabilization heuristics.
- `mobile-layout-rules.md` — Mobile viewport, spacing, tap target, overflow, and safe-area rules.
- `accessibility-rules.md` — Keyboard, focus, reduced motion, color contrast, form, and modal rules.
- `motion-rules.md` — Animation performance and cinematic motion guidelines.
- `navigation-flow.md` — Routing, anchors, scroll restoration, overlays, and broken-button triage.
- `onboarding-flow.md` — Calm onboarding sequence, copy, permissions, and empty-state guidance.
- `do-not-break-constraints.md` — Hard constraints for preserving data, identity, compatibility, and scope.

### assets/

- `ui-patterns.md` — Reusable modal, overlay, navigation, focus, and toast patterns.
- `button-states.md` — Premium button state checklist and CSS snippets.
- `onboarding-copy-examples.md` — EchoVault-native onboarding and permission copy.
- `empty-state-examples.md` — Calm emotional-universe empty states.
- `premium-card-layouts.md` — Card layout patterns that feel cinematic without reducing readability.

## Patch Guidance

- Prefer semantic HTML, stable IDs, data attributes, and progressive enhancement.
- Guard browser-only APIs (`localStorage`, `serviceWorker`, `BeforeInstallPromptEvent`) behind feature checks and small helpers.
- Keep modal open/close state centralized; avoid multiple competing overlay flags.
- Fix scroll with CSS containment and explicit scroll targets before adding complex JavaScript.
- Keep content readable: adequate line length, text contrast, spacing rhythm, and visible hierarchy.
- Do not remove EchoVault’s cinematic copy, vault/memory language, ambient visuals, or emotional pacing unless replacing them with stronger EchoVault-native alternatives.
