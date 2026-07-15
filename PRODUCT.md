# Product

## Register

product

## Users

One user: Nicolò. Phone-first, opened ~5× a day in real contexts — kitchen with wet hands, gym bag packing, campus microwave queue, Saturday supermarket run. Every visit is a micro-task: log a meal, check tonight's cook, tick groceries, glance at the trend. Seconds, not sessions.

## Product Purpose

NUTRI runs a fixed personal food system (permanent breakfast, snack canon, 8 standardised mains, Sat→Fri cook cycle, one weekly shop). It is a **meal operating system, not a food tracker** — no food database, no free-form logging, no calorie search, and by hard rule it never adjusts targets or gives advice. Success = the week runs itself: generate, shop, cook, tap, done.

## Brand Personality

Calm · glanceable · self-explanatory. Apple Health / Fitness product language: the app should read like a first-party iOS utility — instantly legible in 3 seconds without body text, one consistent SF-style glyph set, numbers as the heroes (tabular, with muted units). The surface system is **liquid-glass widgets on a calm dark ground**: large continuous-feel radii (~22 px), translucent saturated-blur fills with specular gradient hairlines (light falls top-left) and inner top highlights, a tinted identity-color capsule on the active tab, generous breathing space (screens may scroll; viewports stay airy), and every widget doing exactly one job behind an icon-led header. Zero persuasion, zero gamification, zero coaching voice.

## Anti-references

- Consumer diet-app energy: streaks, badges, confetti, mascots, motivational copy.
- Marketing-site aesthetics inside an app: hero spacing, purple/blue gradients, glassmorphism, glow effects, three-equal-card layouts, decorative icon noise, the generic AI-template look.
- Food-tracker anti-patterns at both extremes: airy cards with one number each, and wall-of-text screens that need reading. Glanceable hierarchy over both.

## Design Principles

1. **Three-second comprehension.** Every screen passes the test: a first-time user knows what it's for and what to tap without reading body text. Content leads; documentation retires to footnotes or ⓘ.
2. **The next action dominates, tasks before eating.** Today opens with kitchen tasks (due cook session, defrost — pink), then the day summary (wordless day-dot track + eaten-vs-target bars), then the supplements toggles beneath it, then the next meal as the hero; everything completed collapses to quiet lines.
3. **Progressive disclosure.** Nothing is an always-open form — compact summary rows expand or open focused sheets (weight, settings groups).
4. **Color = identity, glyphs always accompany it.** A fixed multi-hue vocabulary (habit-app / Apple Fitness style): green=done, orange=attention/energy, cyan=protein/shop, blue=freeze/fish, red=beef, yellow=breakfast/grains, mint=fresh food, purple=body data, indigo=evening, pink=kitchen tasks (cook sessions, defrost — work, never eating). Color appears as vivid fills on small elements (dots, chips, bars, rings, figures) — large surfaces stay neutral dark, and a glyph always carries the same meaning for color-blind reading.
5. **Numbers are the product.** Tabular numerals everywhere; large figures, muted unit labels; columns never jitter.
6. **No interpretation.** Display-only data surfaces (§1 hard rule); the UI never editorialises the numbers.

## Accessibility & Inclusion

Dark mode is the default and primary theme. Tap targets ≥48 px (kitchen, wet hands). iOS safe-area insets respected (installed PWA). Body text contrast ≥4.5:1 on layered dark surfaces; status distinguishable without color. Reduced motion honoured — micro-interactions only (press/checked states), no gratuitous animation.
