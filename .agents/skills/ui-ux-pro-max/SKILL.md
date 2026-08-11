---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Use for designing, building, reviewing, or improving pages, components, typography, colors, layouts, accessibility, animation, responsive behavior, navigation, forms, dashboards, product listings, and data visualization."
---

# UI/UX Pro Max — Codex bootstrap

This project uses UI UX Pro Max for UI/UX work. The official current Codex installation target is `.agents/skills/ui-ux-pro-max/`.

## Activation

Apply this skill whenever a task changes how the product looks, feels, moves, responds, or is interacted with. Skip it for pure backend, database, infrastructure, or non-visual logic unless those changes affect the interface.

## Full local database

The complete UI UX Pro Max installation includes `scripts/search.py`, the searchable design data, references, and stack-specific guidance. If those generated files are missing, run from the repository root:

```bash
npm run uipro:codex
```

The command uses the official `ui-ux-pro-max-cli` package and initializes the Codex project skill.

Python 3.x is required by the generated search tool. Do not install system software automatically; if Python is missing, tell the user what is required.

## Core priorities

1. Accessibility: WCAG contrast, visible focus, keyboard navigation, semantic labels, alt text, reduced motion.
2. Touch and interaction: comfortable targets, clear hover/pressed/disabled/loading states, immediate feedback.
3. Performance: optimized images, reserved dimensions, lazy loading below the fold, avoid layout shift and animation jank.
4. Style consistency: one coherent design language, consistent icons, radii, elevation, tokens, light/dark pairing.
5. Responsive layout: mobile-first, no horizontal overflow, systematic breakpoints, safe spacing, readable line length.
6. Typography and color: body text normally 16px+, strong hierarchy, semantic tokens, accessible foreground/background pairs.
7. Motion: purposeful 150–300ms micro-interactions, transform/opacity preferred, respect reduced motion.
8. Forms and feedback: visible labels, inline errors, loading/success/error/empty states, destructive-action safeguards.
9. Navigation: predictable routes/back behavior, clear hierarchy, mobile navigation kept focused.
10. Data display: prices and figures aligned/readable, legends/tooltips where needed, never rely on color alone.

## PreçoCerto project defaults

- Detect and follow the actual project stack before implementation. This repository is React-based; prefer existing React/Tailwind patterns and dependencies instead of introducing a second UI framework without a clear need.
- Keep user-facing copy in Portuguese.
- For price comparison screens, prioritize scanability: product identity, establishment, current price, lower/average/higher price distinctions, freshness/update date, favorite state, and primary action must be visually unambiguous.
- For mobile, prioritize search, product comparison, favorites, establishments, and basket-building flows with touch-friendly controls.
- Preserve the established brand/design tokens unless the task explicitly requests a redesign.

## Workflow

For broad redesigns, first inspect the current components/styles and, when the full generated files are available, generate/search the UI UX Pro Max design system before coding. Then implement with existing project conventions and finish with responsive, accessibility, light/dark, loading/error, and interaction checks.
