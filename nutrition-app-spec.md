# NUTRI — Personal Nutrition App · Complete Specification & Claude Code Handoff
**Owner:** Nicolò Violante · single user, private use only · v1.0 spec (July 2026)

---

## 1. Product overview

A phone-first, offline-capable PWA that runs Nicolò's fixed food system: a permanent breakfast, a small snack canon, 8 standardised main-meal recipes, a 4-session weekly cook cycle, one weekly grocery shop, tap-to-log adherence, and morning-weight storage. It is a **meal operating system, not a food tracker** — there is no food database, no free-form logging, no calorie search.

**Non-goals for v1:** calorie/macro suggestions (v1.1), cost tracking, caffeine/Garmin/sleep features, guest portions, protein-bar inventory, notifications/push, accounts, sync, multi-user. *(Shipped later as small additions: a static grocery cost estimate (§6.3) and a display-only daily supplements checklist (§9.1 / §8, v4) — both logging/display only, no reminders.)*

**Hard rules:**
- The app NEVER changes calorie or macro targets by itself. v1 makes no suggestions at all; v1.1 may only *propose* changes requiring explicit approval.
- No pseudoscience anywhere in UI copy (no "testosterone booster", no "jawline food" claims).
- Metric only (g, ml, kg, kcal). English UI. Week starts Monday.

---

## 2. Food system constants

| Constant | Value |
|---|---|
| Daily target | ~2,700 kcal · 150 g P · 70–80 g F · 330–350 g C |
| Slot structure | Breakfast 635 · Snack1 ~255 · Lunch ~785 · Snack2 ~255 · Dinner ~785 |
| Main-meal tolerance | kcal ±30, protein ±5 g (**meal level**) |
| Fat & carb tolerance | balanced at **day level**, not per meal |
| Snack rules | max ONE Skyr-based snack (A′/B′/D′) per day · combined snack protein ≥20 g/day |
| Realized day range (verified) | 2,680–2,760 kcal · 150–162 P · 315–345 C · 70–80 F |

All meal numbers below are **computationally verified** against the ingredient table in §10.

---

## 3. Permanent breakfast (fixed, daily)

**Weetabix–Skyr bowl — 624 kcal · 33 P · 92 C · 10 F · ~12 g fibre** *(cholesterol revision 2026-07: dark chocolate 10→5 g, +5 g oats)*

| Ingredient | Amount | State |
|---|---|---|
| Weetabix | 56 g (3 biscuits) | as sold |
| Skyr, plain | 200 g | as sold |
| Oat milk, unsweetened | 180 g | as sold |
| Banana | 120 g | peeled |
| Chia seeds | 10 g | as sold |
| Oats | 5 g | as sold |
| Dark chocolate 85% | 5 g | as sold |
| Honey | 5 g | as sold |
| Granulated sweetener | to taste (~2 g, calibrate per brand) | — |
| Cinnamon (optional) | 1 g | — |

Method: crumble Weetabix, add Skyr + oat milk, rest 2 min to soften, top with sliced banana, chia, oats, chopped chocolate, honey, sweetener.

**Emergency breakfast (only when an ingredient is missing, never auto-rotated):** 90 g sourdough/wholegrain bread toasted, 3 eggs scrambled, 150 g fruit, 100 g Skyr if available (~640 kcal, ~34 P).

---

## 4. Snack canon (verified)

The app schedules exactly **two snacks/day** from a weekly pick of 2–3 templates (user confirms the pick on plan generation). Rules: **max ONE Skyr-based template (A′/B′/D′) scheduled per day** (the same Skyr template twice also counts as two) · **combined daily snack protein ≥20 g**. A non-Skyr template may fill both slots.

| ID | Snack | Recipe (1 serving) | kcal | P | C | F |
|---|---|---|---|---|---|---|
| A′ | Skyr power bowl | Skyr 200 g · fruit 100 g · mixed nuts 10 g · honey 5 g | 256 | 24 | 25 | 6 |
| B′ | Mini Weetabix bowl | Weetabix 37 g (2) · Skyr 150 g · oat milk 120 g · sweetener | 279 | 21 | 40 | 3 |
| C | Fruit + nuts (portable, shelf-stable) | banana 120 g · mixed nuts 25 g | 262 | 7 | 27 | 14 |
| D′ | Skyr jar (portable, cold bag) | Skyr 200 g · fruit 100 g · oats 15 g · honey 5 g | 250 | 24 | 33 | 2 |
| E | Emergency protein bar | one bar, 15–25 g protein | ~220 | ~20 | — | — |
| F | Whey-banana shake (portable) | whey protein 30 g · banana 120 g · oats 10 g | 257 | 25 | 33 | 3 |
| G | Tuna pot (portable) | tinned tuna in water 100 g drained · rice cakes 35 g · cherry tomatoes to taste | 251 | 29 | 28 | 2 |
| H | Cottage cheese bowl (fridge) | cottage cheese 200 g · fruit 100 g | 248 | 22 | 19 | 9 |

Fruit macros computed per chosen fruit from §10 (apple default in A′/D′/H; banana allowed, +~37 kcal). G's cherry tomatoes are to-taste and excluded from the macro math (they still appear on the grocery list).

---

## 5. Main-meal recipe library (8 recipes · 1 serving canonical · verified)

Target window per meal: **755–815 kcal, 40–50 g protein.** All weights RAW unless stated. Every recipe stores: ingredients (g + state), steps with per-serving-count overrides, tags, reheat note.

**Tags:** `quick` = Tuesday-eligible (~20 min one-pan) · `keeper` = holds 2+ days well · `bigpot` = scales easily to 4.

### R1 · Lemon-herb chicken, rice & broccoli — 787 kcal · 48 P · 87 C · 26 F · `keeper`
Chicken breast 160 g · basmati rice 105 g dry · broccoli 150 g · olive oil 22 g · lemon (juice+zest ½), garlic 1 clove, oregano/thyme, salt, pepper.
Steps: (1) Rice on to boil (per water table §5.1). (2) Season chicken, pan-sear in half the oil 4–5 min/side to 74 °C core; rest, slice. (3) Steam or boil broccoli 5 min. (4) Whisk remaining oil + lemon + garlic; dress everything.
Scaling overrides: 3–4 servings → sear chicken in two batches or bake all pieces 200 °C 20–22 min instead.
Reheat: microwave 2:30 covered, splash of water on the rice.

### R2 · Saffron chicken, courgette & rice — 785 kcal · 46 P · 89 C · 27 F · `keeper`
Chicken breast 160 g · rice 105 g dry · courgette 200 g · onion 40 g · olive oil 22 g · saffron 1 pinch bloomed in 2 tbsp hot water · salt, pepper.
Steps: (1) Bloom saffron. (2) Soften onion in oil, add diced chicken 5–6 min, add courgette half-moons 4 min. (3) Stir cooked rice + saffron water through; season.
Scaling: 3–4 → use widest pan; courgette in two additions so it fries, not steams.
Reheat: 2:30 covered; excellent — flavour improves.

### R3 · Chicken pesto tomato pasta — 778 kcal · 50 P · 78 C · 28 F
Chicken breast 150 g · pasta 100 g dry · pesto 30 g · passata 100 g · spinach 50 g · olive oil 10 g.
Steps: (1) Pasta in salted water (water table). (2) Sear diced chicken in oil. (3) Add passata, simmer 3 min; off heat stir pesto + spinach. (4) Toss with pasta + splash of pasta water.
Scaling: pesto stays off-heat at any scale (keeps colour); 4 servings need a 28 cm+ pan.
Reheat: 2:00 with a spoon of water; pesto dulls slightly — acceptable.

### R4 · Honey-soy chicken noodles — 777 kcal · 49 P · 93 C · 21 F · `quick`
Chicken breast 155 g · egg noodles 100 g dry · mixed peppers/veg 200 g · honey 18 g · soy sauce 20 g · sesame or neutral oil 15 g · garlic 1 clove.
Steps (one pan + kettle): (1) Noodles soak/boil per pack. (2) Stir-fry chicken strips high heat 4 min, add veg 3 min. (3) Honey + soy + garlic in, 1 min. (4) Toss noodles through; **reserve ⅓ of sauce to add at reheat**.
Scaling: 2 servings = true 20-min one-pan (Tuesday config); 4 servings → cook chicken in two batches.
Reheat: add reserved sauce + 1 tbsp water, 2:00, stir halfway (prevents clumping).

### R5 · Lean beef & lentil chilli with rice — 792 kcal · 46 P · 108 C · 19 F · `keeper` `bigpot`
*(Cholesterol revision 2026-07: beef 160→110 g, +120 g cooked lentils; rice −10 g and kidney beans 80→40 g to hold the kcal band.)*
Beef mince 5% 110 g · cooked lentils 120 g · rice 90 g dry · kidney beans 40 g drained · chopped tomatoes 150 g · onion 50 g · olive oil 12 g · chilli powder, cumin, paprika, garlic.
Steps: (1) Brown onion then mince hard. (2) Spices 1 min, tomatoes + beans + lentils, simmer 15–20 min. (3) Rice separately.
Scaling: 4 servings = same pot, +5 min simmer. Best keeper in the library — assign late portions to it.
Reheat: 2:30; improves by day 2.

### R6 · Turkey, tomato & spinach orzo — 779 kcal · 49 P · 86 C · 25 F · `keeper` `bigpot`
*(Cholesterol revision 2026-07: beef → turkey mince 5%, same grams; olive oil 16→12 g holds kcal at exactly the original 779.)*
Turkey mince 5% 150 g · orzo 105 g dry · passata 150 g · spinach 80 g · onion 40 g · olive oil 12 g · garlic, oregano.
Steps: (1) Brown onion + mince. (2) Passata + 250 ml water, orzo straight in, simmer 10–12 min stirring. (3) Spinach off heat.
Scaling: one-pot at all scales; water per water table (not linear).
Reheat: 2:00 + splash of water — orzo reabsorbs beautifully.

### R7 · Salmon, potatoes & greens — 776 kcal · 49 P · 80 C · 28 F
Salmon fillet 185 g · potatoes 430 g · green beans (or broccoli) 150 g · olive oil 3 g · lemon, dill/parsley, salt, pepper.
Steps: (1) Potato chunks, skin on, boil 12–15 min (or roast 200 °C 30 min with the oil). (2) Salmon 200 °C oven 12–14 min. (3) Greens steamed 5 min. Fat comes from the fish — do not add more oil.
Scaling: 4 fillets on one tray, same time. Day-level note: planner pairs salmon day with low-fat snacks (B′/D′).
Reheat: 1:30 medium power only — UCD microwave approved by owner.

### R8 · Lemon-paprika cod, couscous & veg — 790 kcal · 50 P · 86 C · 25 F · `quick`
Cod/white fish 190 g (frozen OK, defrosted) · couscous 105 g dry · peppers/courgette mix 200 g · olive oil 22 g · smoked paprika, lemon, garlic.
Steps (one pan + kettle): (1) Couscous + equal volume boiling water, cover 5 min. (2) Fry veg 4 min, push aside; fish in paprika + oil 3–4 min/side. (3) Lemon over everything, fluff couscous through.
Scaling: 2 servings = 20-min Tuesday config; 4 → fish in two batches.
Reheat: 1:30 medium; mild smell — approved for UCD.

### 5.1 Water & scaling tables (non-linear)
| Servings | Pasta/orzo boil water | Rice absorption water | Chilli simmer add |
|---|---|---|---|
| 1 | 1.5 L | 1 : 1.6 by weight | 50 ml |
| 2 | 2.0 L | 1 : 1.6 | 75 ml |
| 3 | 2.5 L | 1 : 1.5 | 100 ml |
| 4 | 3.0 L | 1 : 1.5 | 120 ml |

Global overrides: any pan-sear step at 3–4 servings → "work in two batches or switch to oven method". Seasoning scales at ~0.8× per added serving (taste-adjust).

---

## 6. Weekly cycle, rotation & grocery

### 6.1 Cook cycle (fixed shape)
| Session | When | Portions | Covers | Max age at eating |
|---|---|---|---|---|
| S1 | **Sunday** afternoon | 4 | Mon L, Mon D, Tue L, Tue D | 2 days |
| S2 | **Tuesday** evening (post-gym, `quick` recipe only) | 2 | Wed L, Wed D | 1 day |
| S3 | **Wednesday** evening (rest day) | 4 | Thu L, Thu D, Fri L, Fri D | 2 days |
| S4 | **Saturday** midday | 4 | Sat L, Sat D, Sun L, Sun D | 1 day |

Nothing eaten is ever >2 days old. Zero cooking on training days except the 20-min Tuesday one-pan.

### 6.2 Rotation algorithm (v1)
On plan generation (default Saturday 08:00, editable), pick 4 recipes for the week:
1. S2 (Tuesday) must be tagged `quick` (R4 or R8).
2. No recipe repeats within the same week.
3. A recipe used in week N is deprioritised in week N+1 (soft rule — allowed if needed).
4. Salmon (R7) at most once per week; if chosen, planner assigns that day's snacks from the low-fat set {B′, D′, F, G} (still max one Skyr-based snack that day).
5. Prefer `keeper`-tagged recipes in S1 and S3 (their portions live longest).
6. **Swap feature:** user can replace any session's recipe before or during the week; swap applies to the whole session (all its portions), grocery list re-computes, already-checked items stay checked.

Snack pick: app proposes 2–3 templates for the week honouring the §4 snack rules (max one Skyr-based snack per day, ≥20 g combined snack protein, salmon-day low-fat set); user confirms or edits on the same screen.

### 6.3 Grocery (one weekly shop)
- Shop day: **Saturday morning** (default, editable). One consolidated list generated with the plan.
- List = Σ(ingredients × portions across S1–S4) + 7× breakfast + 14× snacks, aggregated per ingredient, rounded to sensible pack sizes.
- Three sections: **Fresh** (use ≤2 days: S4 + S1 proteins, all veg/fruit/dairy) · **Freeze on arrival** (S2 + S3 proteins) · **Pantry check** (rice, pasta, oil, spices, honey — checklist, not quantities).
- **Defrost tasks** are injected into the daily plan: Monday evening → "move Tuesday's protein to fridge"; Tuesday evening → "move Wednesday-session protein to fridge".
- Checkbox list, persists until next generation.
- **Cost estimate (deliberately approximate):** the list shows an estimated total ("Est. ~€NN · Dublin avg · fresh & freeze only"), per-section subtotals and a muted per-item price, from the static §10 prices (Dublin average of Tesco/Lidl/Dunnes). Cost = what the till charges, not what recipes use: pack-rounded items cost whole packs (ceil-packs × price × pack size), loose items cost the rounded grams shown. Fresh + Freeze-on-arrival sections only — pantry-check lines and name-only extras are excluded. Re-computes on swap like the rest of the list.

### 6.4 Freezer buffer (untracked, instructional)
Plan shows a standing suggestion until dismissed: "When a session is easy, cook +1 portion and freeze it, until you hold 2–3 emergency meals." No inventory logic in v1.

---

## 7. Logging, adherence & weight

- **Meal log:** each of the 5 daily slots has three states: `planned` (default) → `eaten` (one tap) → `off-plan` (one tap; means skipped/replaced/ate out). No macro estimation for off-plan. No partial portions.
- **Adherence:** % of slots marked `eaten` over the period; shown per day, per week (35 slots) — plus cook-session completion (did S1–S4 happen).
- **Weight:** one field, kg with 1 decimal, tagged to date, mornings assumed. Editable/deletable. Chart shows raw points + 7-day rolling average + weekly averages. **No interpretation, no suggestions in v1** — display only. Data model stores everything v1.1 needs.

---

## 8. Data model (localStorage, JSON; all TypeScript interfaces)

```ts
interface Ingredient { id: string; name: string; per100g: { kcal: number; p: number; c: number; f: number };
  category: 'protein'|'carb'|'veg'|'fruit'|'dairy'|'fat'|'pantry'; packSizeG?: number; freezable: boolean }

interface RecipeIngredient { ingredientId: string; grams: number; state: 'raw'|'cooked'|'drained'|'as-sold'|'peeled' }

interface RecipeStep { text: string; overridesByServings?: Record<string, string> } // key "3-4" etc.

interface Recipe { id: string; name: string; slotType: 'main'|'snack'|'breakfast';
  ingredients: RecipeIngredient[]; steps: RecipeStep[]; tags: ('quick'|'keeper'|'bigpot')[];
  reheatNote: string; verified: { kcal: number; p: number; c: number; f: number } } // per 1 serving

interface CookSession { id: 'S1'|'S2'|'S3'|'S4'; day: 'Sun'|'Tue'|'Wed'|'Sat'; portions: 2|4;
  recipeId: string; covers: SlotRef[]; done: boolean }

interface WeekPlan { weekStartISO: string; sessions: CookSession[]; snackTemplateIds: string[];
  slots: { date: string; slot: 'B'|'S1'|'L'|'S2'|'D'; recipeId: string;
           status: 'planned'|'eaten'|'off-plan'; tasks?: string[] }[] } // tasks = defrost prompts

interface WeightEntry { dateISO: string; kg: number }

interface Settings { targets: { kcal: number; p: number; fMin: number; fMax: number; cMin: number; cMax: number };
  shopDay: string; planGenDay: string; language: 'en' }

type SupplementDay = { creatine: boolean; omega3: boolean; vitaminD3: boolean } // v4

interface AppState { version: number; ingredients: Ingredient[]; recipes: Recipe[];
  weeks: WeekPlan[]; weights: WeightEntry[];
  supplementsLog: Record<string, SupplementDay>; // keyed by local YYYY-MM-DD; absent date = all unchecked (v4)
  settings: Settings }
```

Persistence: single `AppState` JSON in localStorage, debounced writes, schema `version` for migrations. **Export/Import:** one-tap download/upload of the full JSON (backup + phone↔laptop move).

---

## 9. Screens (6)

1. **Today** — the home screen. Daily supplements checklist first (Creatine · Omega-3 · Vitamin D3, per-item checkboxes, fresh each day — display/logging only, no reminders); then 5 slot cards (meal name, kcal/P, gram amounts on expand), tap to mark eaten/off-plan; defrost task banner when due; quick weight-add field at top; today's cook session (if any) with "open recipe at N servings" button.
2. **Week** — 7×5 grid of slots + the 4 session cards; swap button per session; adherence % for the week.
3. **Recipes** — library list; detail view with serving selector **1–4** that recalculates every ingredient gram, batch macros, and step overrides live. Cycle-launched views open pre-set to the session's portion count.
4. **Grocery** — current week's checklist in the three sections; regenerate on swap.
5. **Trends** — weight chart (points, 7-day rolling, weekly averages) + weekly adherence bars. Display only.
6. **Settings** — targets (editable with confirmation dialog: "This changes your plan"), shop/plan-gen day, export/import, about.

Design: clean, dense-but-calm, dark-mode default, big tap targets (used in kitchens with wet hands), zero onboarding (data ships seeded).

---

## 10. Seeded ingredient nutrition table (per 100 g, EU-label style)

chicken_breast 106/22.0/0/2.0 · beef_mince_5 124/20.5/0/4.5 · turkey_mince_5 148/21.0/0/7.0 · salmon 201/20.4/0/13.1 · cod 82/18.0/0/0.7 · rice_dry 351/8.0/77.5/0.6 · pasta_dry 353/12.5/71.0/1.5 · orzo_dry 353/12.5/71.0/1.5 · noodles_dry 348/12.0/67.0/2.0 · couscous_dry 358/12.8/72.5/0.6 · potato 77/2.0/17.0/0.1 · broccoli 34/2.8/4.0/0.4 · courgette 17/1.2/2.2/0.3 · spinach 23/2.9/1.4/0.4 · peppers_mix 30/1.0/5.0/0.3 · green_beans 31/1.8/4.7/0.2 · passata 30/1.3/4.5/0.2 · chopped_tomatoes 25/1.2/3.5/0.2 · onion 38/1.0/8.0/0.1 · kidney_beans_drained 90/7.0/12.0/0.5 · lentils_cooked 116/9.0/20.0/0.4 (pack 400 g) · pesto 450/4.5/6.0/45.0 · olive_oil 900/0/0/100 · honey 320/0/80.0/0 · soy_sauce 60/6.0/8.0/0 · skyr 63/10.6/4.0/0.2 · weetabix 362/12.0/69.0/2.0 · oat_milk_unsweetened 42/0.8/6.6/1.3 · banana 89/1.1/20.5/0.3 · apple 52/0.3/12.0/0.2 · chia 486/16.5/8.0/30.7 · dark_chocolate_85 590/9.5/22.0/46.0 · nuts_mixed 620/21.0/9.0/54.0 · oats 372/13.5/60.0/7.0 · whey_protein 375/75.0/8.0/6.0 · tuna_drained 116/26.0/0/1.0 · rice_cakes 387/8.0/81.0/3.0 · cottage_cheese 98/11.0/3.5/4.5 · cherry_tomatoes 18/0.9/2.7/0.2

Format: kcal/P/C/F. **Owner task (not app logic):** re-verify against local labels once on arrival in Dublin (~20 min); edit values in Settings→(v1.1) or directly in seed data. Canonical substitute: 0%-fat Greek yoghurt for Skyr (57/10.0/4.0/0.3) — one-tap substitution is a v1.1 feature; v1 just documents it here.

**Price column (€/kg, liquids per litre; Dublin average of Tesco/Lidl/Dunnes, deliberately approximate — feeds the §6.3 estimate):**
chicken_breast 8.00 · beef_mince_5 9.50 · turkey_mince_5 8.50 · salmon 17.00 · cod 9.00 · rice_dry 2.20 · pasta_dry 1.50 · orzo_dry 1.80 · noodles_dry 3.50 · couscous_dry 2.50 · potato 1.20 · broccoli 2.50 · courgette 2.50 · spinach 5.00 · peppers_mix 3.50 · green_beans 4.50 · passata 1.20 · chopped_tomatoes 1.20 · onion 1.20 · kidney_beans_drained 2.00 · lentils_cooked 2.50 · pesto 6.00 · olive_oil 8.00 · honey 7.00 · soy_sauce 6.00 · skyr 4.60 · weetabix 5.00 · oat_milk_unsweetened 1.60 · banana 1.50 · apple 2.50 · chia 10.00 · dark_chocolate_85 12.00 · nuts_mixed 11.00 · oats 1.60 · whey_protein 25.00 · tuna_drained 8.50 · rice_cakes 6.00 · cottage_cheese 4.50 · cherry_tomatoes 4.00

---

## 11. v1.1 roadmap (architect for it, do NOT build it)

1. **Calibration engine:** weekly weight averages; band −0.1 to −0.3 %BW/week; propose ±100–150 kcal ONLY when 2 consecutive weekly deltas sit outside band AND adherence ≥80%; 14-day settling period after any location change (Italy↔Dublin) excluded from analysis; every proposal requires explicit accept/reject; accepted changes adjust carb+fat grams proportionally across main meals, protein untouched.
2. Ingredient editing UI + Skyr↔Greek-yoghurt substitution toggle.
3. Cost tracking — **partially shipped in v1 as a static estimate** (per-ingredient Dublin prices in §10, weekly grocery estimate in §6.3). Remaining for v1.1: owner-editable prices and a per-week spend roll-up/history.
4. Protein-bar / freezer-portion inventory.
5. Integrations (Garmin, sleep, training) — far future.

---

## 12. Tech constraints & build instructions for Claude Code

- **Stack:** Vite + React + TypeScript. No backend, no accounts, no network calls. State in localStorage as per §8.
- **PWA:** manifest + service worker, fully offline after first load, installable on iOS/Android home screen.
- **Seed data:** ship the app with §3–§5 recipes, §4 snacks, §10 ingredients pre-loaded. The owner should open the app and see a working Today screen with zero setup.
- **Dates:** device-local time; week starts Monday.
- **Testing:** unit-test the three pure cores — (a) recipe scaling (grams × servings, overrides resolve), (b) grocery aggregation, (c) rotation constraints (quick-on-Tuesday, no intra-week repeat, salmon rule). Verify every seeded meal's computed macros match §5's `verified` numbers within ±1 kcal (guards against seed typos).
- **Definition of done (v1):** install on phone → generate a week → see grocery list → mark meals eaten → add weight → export JSON. All offline.

### Kickoff prompt for Claude Code
> Read `nutrition-app-spec.md` in full before writing any code. Build v1 exactly as specified: Vite + React + TS PWA, localStorage persistence, seeded data from §3–§5 and §10, six screens from §9, cycle/rotation/grocery logic from §6, logging from §7, data model from §8. Respect §1 hard rules and §11 (architect for v1.1, build none of it). Start by scaffolding the project and implementing the data layer + seed data with the §12 unit tests, then the Today screen, then Recipes with the serving selector, then Week/Grocery, then Trends/Settings. Ship a working build at each stage.
